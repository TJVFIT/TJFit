import type { V2Disclaimer, V2Macros } from "@/lib/tjai/v2-plan-schema";
import type { QuizAnswers } from "@/lib/tjai-types";

/**
 * Deterministic calorie + macro math from v2 intake answers. No LLM
 * call — this is a pure function so the rest of the plan downstream
 * gets a stable target.
 *
 * Sources used:
 *   BMR  = Mifflin-St Jeor (sex / weight / height / age)
 *   TDEE = BMR × activity multiplier
 *   Goal bias = preset cut/recomp/bulk delta
 *
 * Returns macros AND any disclaimers triggered by intake signals
 * (cardio history, ED history, BMI<18.5, pregnancy, etc.).
 */

type Sex = "male" | "female";
type Goal = "fat_loss" | "muscle_gain" | "recomposition" | "performance" | "recovery";
type Job = "desk" | "active" | "physical";

const ACTIVITY_BY_DAYS: Record<number, number> = {
  0: 1.2,
  1: 1.275,
  2: 1.35,
  3: 1.425,
  4: 1.5,
  5: 1.575,
  6: 1.65,
  7: 1.725
};

const JOB_BUMP: Record<Job, number> = {
  desk: 0,
  active: 0.05,
  physical: 0.12
};

const GOAL_BIAS_KCAL: Record<Goal, number> = {
  fat_loss: -500,
  muscle_gain: 300,
  recomposition: -200,
  performance: 100,
  recovery: 0
};

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function bmrMifflin(sex: Sex, weightKg: number, heightCm: number, ageYears: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function computeV2Macros(answers: QuizAnswers): { macros: V2Macros; disclaimers: V2Disclaimer[] } {
  const sex = (asString(answers.sex) === "female" ? "female" : "male") as Sex;
  const age = clamp(asNumber(answers.age) ?? 25, 13, 90);
  const heightCm = clamp(asNumber(answers.height_cm) ?? 175, 130, 220);
  const weightKg = clamp(asNumber(answers.weight_kg) ?? 75, 35, 250);
  const goal = (asString(answers.goal) ?? "recovery") as Goal;
  const days = clamp(asNumber(answers.days_per_week) ?? 4, 0, 7);
  const job = (asString(answers.job_type) ?? "desk") as Job;

  const bmr = bmrMifflin(sex, weightKg, heightCm, age);
  const activity = (ACTIVITY_BY_DAYS[days] ?? 1.5) + (JOB_BUMP[job] ?? 0);
  const tdee = Math.round(bmr * activity);

  const disclaimers: V2Disclaimer[] = [];

  // BMI safety signals
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (bmi < 18.5 && goal === "fat_loss") {
    disclaimers.push({
      kind: "underweight",
      message:
        "Your current weight is in the underweight range. We've routed you to a maintenance plan instead of an aggressive cut. Please check with a clinician before changing this."
    });
  }

  // ED-history hard rule — never aggressive deficit even if user picked fat_loss
  const edHistory = asString(answers.ed_history) === "yes";
  let goalBias = GOAL_BIAS_KCAL[goal] ?? 0;
  if (edHistory && goalBias < -200) {
    goalBias = -200;
    disclaimers.push({
      kind: "ed",
      message:
        "Because you noted an eating-disorder history, we cap the deficit at a small, sustainable level. Please continue working with a clinician."
    });
  }
  if (bmi < 18.5 && goalBias < 0) {
    goalBias = 0; // override to maintenance
  }

  // Pregnancy → flat maintenance only
  const pregnant = asString(answers.pregnancy_status) === "yes";
  if (pregnant) {
    goalBias = 0;
    disclaimers.push({
      kind: "pregnancy",
      message:
        "Pregnancy and postpartum nutrition needs to be guided by your obstetrician — TJAI's plan is set to maintenance only. Please don't deficit while pregnant or nursing."
    });
  }

  // CV history → doctor-clearance disclaimer
  if (asString(answers.cv_history) === "yes") {
    disclaimers.push({
      kind: "cv",
      message:
        "You noted cardiovascular history. Get medical clearance before starting structured training, and let your coach know if anything changes."
    });
  }

  // Diabetes → carb-timing disclaimer (the diet generator reads this and adjusts)
  if (asString(answers.diabetes) === "yes") {
    disclaimers.push({
      kind: "diabetes",
      message:
        "Your plan factors in steady carb timing to avoid hypoglycemia during training. Coordinate insulin / meds with your physician."
    });
  }

  const targetKcal = Math.max(1200, tdee + goalBias); // hard floor

  // Macros split
  // Protein: 1.6–2.2 g/kg of bodyweight, lean toward upper end on cuts.
  const proteinPerKg = goal === "fat_loss" ? 2.0 : goal === "muscle_gain" ? 1.8 : 1.6;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const proteinKcal = proteinG * 4;
  // Fat: 25-30% of calories
  const fatKcal = Math.round(targetKcal * 0.27);
  const fatG = Math.round(fatKcal / 9);
  // Carbs: remainder
  const carbsKcal = Math.max(0, targetKcal - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);

  const macros: V2Macros = {
    bmrKcal: bmr,
    tdeeKcal: tdee,
    targetKcal,
    proteinG,
    carbsG,
    fatG,
    goalBiasKcal: goalBias,
    rationale: rationaleLine({ goal, bias: goalBias, edHistory, pregnant, bmi })
  };

  return { macros, disclaimers };
}

function rationaleLine(input: {
  goal: Goal;
  bias: number;
  edHistory: boolean;
  pregnant: boolean;
  bmi: number;
}): string {
  if (input.pregnant) return "Maintenance calories — pregnancy/postpartum.";
  if (input.bmi < 18.5) return "Maintenance calories — underweight protection.";
  if (input.edHistory && input.bias === -200) return "Sustainable -200 kcal deficit — ED-aware.";
  switch (input.goal) {
    case "fat_loss":
      return `Goal: fat loss (~${Math.abs(input.bias)} kcal deficit, ~0.5–1% bodyweight per week).`;
    case "muscle_gain":
      return `Goal: muscle gain (+${input.bias} kcal surplus for lean growth).`;
    case "recomposition":
      return "Goal: recomposition (small deficit + high protein).";
    case "performance":
      return "Goal: performance (slight surplus, prioritize recovery).";
    case "recovery":
      return "Maintenance — recovery focus.";
  }
}

/**
 * Hard refusals that should block plan generation entirely.
 * Returns null if OK, or a disclaimer-shaped error if blocked.
 */
export function blockingSignals(answers: QuizAnswers): V2Disclaimer | null {
  // 0 days/week — push back.
  const days = asNumber(answers.days_per_week);
  if (days === 0) {
    return {
      kind: "doctor_clearance",
      message:
        "We need at least 2 training days per week to build a plan that actually works. Update your schedule and try again."
    };
  }
  // BMI < 16 + cut goal — too risky to plan.
  const heightM = (asNumber(answers.height_cm) ?? 175) / 100;
  const weightKg = asNumber(answers.weight_kg) ?? 75;
  const bmi = weightKg / (heightM * heightM);
  if (bmi < 16 && asString(answers.goal) === "fat_loss") {
    return {
      kind: "underweight",
      message:
        "Your weight is in a clinically underweight range. We're not the right tool for fat-loss programming here — please reach out to a clinician for guidance."
    };
  }
  return null;
}

/** Convenience helper for downstream generators to read intake context. */
export function intakeContext(answers: QuizAnswers) {
  return {
    sex: (asString(answers.sex) === "female" ? "female" : "male") as Sex,
    age: asNumber(answers.age) ?? 25,
    heightCm: asNumber(answers.height_cm) ?? 175,
    weightKg: asNumber(answers.weight_kg) ?? 75,
    goal: (asString(answers.goal) ?? "recovery") as Goal,
    daysPerWeek: asNumber(answers.days_per_week) ?? 4,
    sessionLength: asString(answers.session_length) ?? "standard",
    trainingHistory: asString(answers.training_history) ?? "novice",
    sleepHours: asNumber(answers.sleep_hours) ?? 7,
    stress: asString(answers.stress_level) ?? "moderate",
    job: (asString(answers.job_type) ?? "desk") as Job,
    bodyType: asString(answers.body_type) ?? "average",
    firstName: asString(answers.first_name) ?? "",
    persona: asString(answers.persona) ?? "mentor",
    country: asString(answers.country) ?? "",
    city: asString(answers.city) ?? "",
    units: asString(answers.units) ?? "metric",
    market: asString(answers.market) ?? "",
    cookTime: asString(answers.cook_time) ?? "30",
    familySize: asString(answers.family_size) ?? "solo",
    religionDiet: asString(answers.religion_diet) ?? "none",
    fastingPattern: asString(answers.fasting_pattern) ?? "no",
    cvHistory: asString(answers.cv_history) === "yes",
    diabetes: asString(answers.diabetes) === "yes",
    pregnant: asString(answers.pregnancy_status) === "yes",
    edHistory: asString(answers.ed_history) === "yes",
    smoking: asString(answers.smoking) === "yes",
    alcohol: asString(answers.alcohol) ?? "none",
    caffeine: asString(answers.caffeine) ?? "none",
    hydrationLiters: asNumber(answers.hydration_liters) ?? 2,
    injuries: asArray(answers.injuries),
    currentSupplements: asString(answers.current_supplements) ?? "",
    allergies: asArray(answers.allergies),
    medications: asString(answers.medications) ?? ""
  };
}

export type IntakeContext = ReturnType<typeof intakeContext>;

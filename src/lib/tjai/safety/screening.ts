/**
 * TJAI safety screening — computes structured red-flag set from the user's intake.
 *
 * Sources:
 *  - PAR-Q+ (Physical Activity Readiness Questionnaire, 2023 revision)
 *  - SCOFF (Sick, Control, One stone, Fat, Food) eating-disorder screener
 *  - IOC Relative Energy Deficiency in Sport (RED-S) consensus 2023
 *  - AHA cardiovascular pre-screening for exercise
 *
 * The output is pure data (no I/O). The prompt layer reads it and either
 * gates the plan, down-shifts intensity, or appends a mandatory professional-
 * referral disclaimer. Never use these flags to make a clinical diagnosis.
 */

import type { TjaiUserProfile } from "@/lib/tjai-types";

export type SafetySeverity = "info" | "caution" | "refer";

export type SafetyFlag = {
  code: string;
  severity: SafetySeverity;
  message: string;
  action: string;
};

export type SafetyFlagSet = {
  flags: SafetyFlag[];
  requiresMedicalClearance: boolean;
  disallowAggressivePace: boolean;
  disallowHighIntensity: boolean;
  eatingDisorderConcern: boolean;
  redsConcern: boolean;
};

function hasAny<T extends string>(list: readonly T[] | undefined | null, needles: readonly T[]): boolean {
  if (!list || list.length === 0) return false;
  const set = new Set(list.map((v) => String(v).toLowerCase()));
  return needles.some((n) => set.has(n));
}

/**
 * Structured screening pass. Read-only — returns the flag set plus a couple
 * of convenience booleans the prompt layer uses to constrain the plan.
 */
export function screenUserProfile(profile: TjaiUserProfile): SafetyFlagSet {
  const flags: SafetyFlag[] = [];

  // PAR-Q+ style cardiovascular / surgical history triggers
  if (hasAny(profile.injuries, ["recent_surgery"])) {
    flags.push({
      code: "parq_recent_surgery",
      severity: "refer",
      message: "Recent surgery reported in intake — PAR-Q+ flags this as a referral trigger.",
      action:
        "Do NOT prescribe high-intensity or heavy loading until the user confirms physician clearance. Offer a mobility/low-load foundation phase only."
    });
  }
  if (hasAny(profile.injuries, ["chronic_condition"])) {
    flags.push({
      code: "parq_chronic_condition",
      severity: "caution",
      message: "Chronic medical condition reported — modify dose, not intent.",
      action:
        "Cap session RPE at 8, avoid maximal lifts, add an explicit disclaimer to consult their physician, and offer a lower-impact variant for every prescribed movement."
    });
  }

  // Joint / spine red flags
  const jointFlags: Array<{ code: string; label: string; tip: string }> = [];
  if (hasAny(profile.injuries, ["knee"])) {
    jointFlags.push({
      code: "joint_knee",
      label: "Knee",
      tip: "Swap deep barbell squats for hack squat, leg press, or box squat to parallel; avoid lockout leg extensions if pain is anterior."
    });
  }
  if (hasAny(profile.injuries, ["lower_back"])) {
    jointFlags.push({
      code: "joint_lower_back",
      label: "Lower back",
      tip: "Avoid conventional deadlifts and bent-over rows; use trap-bar pulls, chest-supported rows, and anti-extension core work (dead bug, Pallof press)."
    });
  }
  if (hasAny(profile.injuries, ["shoulder"])) {
    jointFlags.push({
      code: "joint_shoulder",
      label: "Shoulder",
      tip: "Prefer neutral-grip pressing and cable work; avoid behind-the-neck presses and upright rows; scapular retraction primer before upper work."
    });
  }
  if (hasAny(profile.injuries, ["hip"])) {
    jointFlags.push({
      code: "joint_hip",
      label: "Hip",
      tip: "Prefer hinge over deep squat, add glute activation before lower sessions, avoid deep lunges if anterior pinching occurs."
    });
  }
  if (hasAny(profile.injuries, ["wrist_elbow"])) {
    jointFlags.push({
      code: "joint_wrist_elbow",
      label: "Wrist / elbow",
      tip: "Prefer DB and machine pressing over barbell; use neutral grip; add forearm/grip warm-up; avoid close-grip bench if pain."
    });
  }
  for (const jf of jointFlags) {
    flags.push({
      code: jf.code,
      severity: "caution",
      message: `${jf.label} injury reported — substitute exercises that do not load the affected area.`,
      action: jf.tip
    });
  }

  // Red-flag combinations (SCOFF / RED-S style)
  const veryLean = profile.estimatedBodyFat > 0 && profile.estimatedBodyFat <= 12 && profile.sex === "female";
  const maleAthleticLean = profile.estimatedBodyFat > 0 && profile.estimatedBodyFat <= 6 && profile.sex === "male";
  const aggressiveCut = profile.goal === "fat_loss" && profile.pace === "aggressive";
  const veryLowBudget = profile.monthlyFoodBudget === "budget";
  const highObstacleCravings = profile.biggestObstacles.includes("food_cravings");
  const hardRestrictionCount = profile.dietaryRestrictions.filter((r) => r && r !== "none").length;

  let eatingDisorderConcern = false;
  if ((veryLean || maleAthleticLean) && aggressiveCut) {
    eatingDisorderConcern = true;
    flags.push({
      code: "eating_disorder_risk",
      severity: "caution",
      message:
        "Very lean body-fat estimate combined with aggressive fat-loss goal — SCOFF-style screening is warranted before prescribing a deficit.",
      action:
        "Down-shift pace to sustainable_cut automatically. Recommend 4-week recomposition or maintenance phase first. Include a short, non-alarmist note that persistent preoccupation with food, loss of period, or compensatory behaviors should prompt a chat with a registered dietitian or physician."
    });
  }
  if (highObstacleCravings && aggressiveCut) {
    flags.push({
      code: "cravings_aggressive_pace",
      severity: "caution",
      message: "User self-reports food cravings as a top obstacle while asking for an aggressive deficit — adherence risk is high.",
      action:
        "Use moderate pace. Include one strategic refeed day per week and practical cravings-coping habits (protein floor at breakfast, volume foods, walk after meals)."
    });
  }
  if (hardRestrictionCount >= 3 && veryLowBudget) {
    flags.push({
      code: "restriction_budget_conflict",
      severity: "info",
      message: "Multiple dietary restrictions combined with a low food budget — meal plan must be built around 6–8 high-return staples only.",
      action: "Limit the grocery list to legumes, eggs (if allowed), oats, rice, frozen vegetables, and one rotating protein. Flag any meal that costs more than the average."
    });
  }

  // RED-S: female athletes with very low BF + low calories + hard training
  const highActivity = profile.activityLevel === "active";
  const highTrainingDays = profile.trainingDays >= 5;
  let redsConcern = false;
  if (profile.sex === "female" && (veryLean || profile.estimatedBodyFat <= 15) && (highActivity || highTrainingDays) && aggressiveCut) {
    redsConcern = true;
    flags.push({
      code: "reds_risk",
      severity: "refer",
      message:
        "Low body fat + high training load + aggressive deficit is the classic RED-S energy-availability pattern. Do not prescribe this combination.",
      action:
        "Hold calories at TDEE for 4 weeks (recomposition only), cap training at 4 sessions/week, and strongly recommend a physician or sports-medicine check-in before any deficit phase."
    });
  }

  // Recovery compounding
  if (profile.sleepHours < 6 && (profile.stressLevel === "high" || profile.stressLevel === "very_high")) {
    flags.push({
      code: "recovery_compound",
      severity: "caution",
      message: "Sleep <6h + high stress is a compounding recovery deficit — overtraining and injury risk are elevated.",
      action:
        "Cap sessions to 45 min, schedule mandatory deload weeks at 4 and 8, shift one strength day into a Zone-2 walk, and write a short sleep-hygiene block into the plan."
    });
  }

  // Cardio comorbidity risk (no clinical data — use age + pace + stress heuristic)
  if (profile.age >= 45 && profile.pace === "aggressive" && profile.experienceLevel === "beginner") {
    flags.push({
      code: "cv_prescreen_recommended",
      severity: "caution",
      message: "Age ≥45 + beginner + aggressive pace — AHA recommends a pre-exercise cardiovascular check before high-intensity work.",
      action: "Start with a 2-week ramp at RPE ≤7 and include a note recommending a standard CV check-up if the user has not had one this year."
    });
  }

  const requiresMedicalClearance = flags.some((f) => f.severity === "refer");
  const disallowAggressivePace =
    eatingDisorderConcern || redsConcern || flags.some((f) => f.code === "recovery_compound");
  const disallowHighIntensity = requiresMedicalClearance || flags.some((f) => f.code === "parq_chronic_condition");

  return {
    flags,
    requiresMedicalClearance,
    disallowAggressivePace,
    disallowHighIntensity,
    eatingDisorderConcern,
    redsConcern
  };
}

export function renderSafetyFlagsForPrompt(set: SafetyFlagSet): string {
  if (set.flags.length === 0) {
    return "Safety screening: ✅ no red flags detected. Standard protocol allowed.";
  }
  const header = set.requiresMedicalClearance
    ? "Safety screening: ⚠️ REFERRAL TRIGGER — plan MUST include medical-clearance note and MUST NOT prescribe aggressive pace or high-intensity work."
    : "Safety screening: ⚠️ caution flags — modify the plan as directed below, no exceptions.";
  const constraints: string[] = [];
  if (set.disallowAggressivePace) constraints.push("- Aggressive pace is BLOCKED. Use moderate or slow.");
  if (set.disallowHighIntensity) constraints.push("- High-intensity / near-failure work is BLOCKED. Cap every working set at RPE 8.");
  if (set.eatingDisorderConcern)
    constraints.push(
      "- No calorie targets below 90% of TDEE. Frame the plan as recomposition first. Include one-line non-alarmist note about seeking a registered dietitian if restrictive patterns persist."
    );
  if (set.redsConcern)
    constraints.push(
      "- Energy availability is the priority, not deficit. Hold at maintenance until recovery and cycle markers normalize. Recommend physician check-in."
    );
  const flagList = set.flags.map((f) => `• [${f.severity.toUpperCase()}] ${f.code}: ${f.message}\n  Action: ${f.action}`).join("\n");
  return `${header}\n${constraints.length > 0 ? `\nHard constraints:\n${constraints.join("\n")}\n` : ""}\nDetail:\n${flagList}`;
}

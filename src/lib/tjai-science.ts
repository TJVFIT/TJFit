import type { MetabolicType, QuizAnswers, TJAIMetrics } from "@/lib/tjai-types";

/**
 * Parse a value that may be a number, a range string ("25–34 years"),
 * or a bounded string ("Over 120 kg", "Under 50 kg").
 * Returns the numeric midpoint of a range, or the numeric boundary ± offset.
 */
export function parseRangeToNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  const s = String(v ?? "").replace(/,/g, "");
  // Extract all numbers from the string
  const nums = (s.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (nums.length >= 2) {
    // "25–34 years" → midpoint 29.5
    return (nums[0] + nums[1]) / 2;
  }
  if (nums.length === 1) {
    if (/over|above|more than|\+/i.test(s)) return nums[0] + 5;
    if (/under|below|less than/i.test(s)) return nums[0] - 3;
    return nums[0];
  }
  return fallback;
}

function asNum(v: unknown, fallback = 0): number {
  const n = parseRangeToNumber(v, NaN);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : [];
}

function estimateBodyFatFromType(bodyType: string): number {
  if (bodyType.startsWith("Very lean") || bodyType.startsWith("Very Lean")) return 10;
  if (bodyType.startsWith("Lean")) return 16;
  if (bodyType.startsWith("Average")) return 22;
  if (bodyType.startsWith("Overweight")) return 30;
  if (bodyType.startsWith("Obese")) return 38;
  return 22;
}

function activityMultiplier(activity: string): number {
  if (activity.startsWith("Very low")) return 1.2;
  if (activity.startsWith("Low")) return 1.375;
  if (activity.startsWith("Moderate")) return 1.55;
  if (activity.startsWith("Active")) return 1.725;
  if (activity.startsWith("Very active")) return 1.9;
  return 1.375;
}

function trainingDaysAdjustment(days: string, bmr: number): number {
  if (days.startsWith("1–2")) return bmr * 0.05;
  if (days.startsWith("3–4")) return bmr * 0.1;
  if (days.startsWith("5–6")) return bmr * 0.15;
  if (days.startsWith("7")) return bmr * 0.2;
  return 0;
}

function stepsAdjustment(steps: string): number {
  if (steps.startsWith("Under")) return 0;
  if (steps.startsWith("3,000")) return 100;
  if (steps.startsWith("7,000")) return 200;
  if (steps.startsWith("Over")) return 300;
  return 100;
}

function applyGoalCalories(tdee: number, goal: string, pace: string, gender: string): number {
  let cals = tdee;
  if (goal.startsWith("Lose fat")) {
    if (pace.startsWith("Slow")) cals = tdee - 250;
    if (pace.startsWith("Moderate")) cals = tdee - 500;
    if (pace.startsWith("Aggressive")) cals = tdee - 750;
    const floor = gender.startsWith("Female") ? 1200 : 1500;
    cals = Math.max(cals, floor);
  } else if (goal.startsWith("Gain muscle")) {
    if (pace.startsWith("Slow")) cals = tdee + 150;
    if (pace.startsWith("Moderate")) cals = tdee + 300;
    if (pace.startsWith("Aggressive")) cals = tdee + 500;
  } else if (goal.startsWith("Recomposition")) {
    cals = tdee;
  } else {
    cals = tdee;
  }
  return cals;
}

function applyStressSleepAdjustment(calories: number, stress: string, sleepQuality: string): number {
  const highStress = stress.startsWith("High") || stress.startsWith("Very high");
  const poorSleep = sleepQuality.startsWith("Poor");
  const goodSleep = sleepQuality.startsWith("Good");
  if (highStress && poorSleep) return calories * 0.95;
  if (!highStress && goodSleep) return calories * 1.02;
  return calories;
}

export function classifyMetabolicType(answers: QuizAnswers): MetabolicType {
  let fastScore = 0;
  let slowScore = 0;
  let stressScore = 0;
  let hormonalScore = 0;

  if (answers.s7_lose_easy === "Yes — I drop weight fast") fastScore += 2;
  if (answers.s7_gain_easy === "No — I struggle to gain") fastScore += 2;
  if (answers.s7_appetite === "Low — I forget to eat") fastScore += 1;
  if (asNum(answers.s8_hours, 7) >= 7) fastScore += 1;
  if (answers.s9_stress === "Low") fastScore += 1;

  if (answers.s7_gain_easy === "Yes — I gain weight fast") slowScore += 2;
  if (answers.s7_lose_easy === "No — I struggle to lose") slowScore += 2;
  if (answers.s7_appetite === "High — I'm always hungry") slowScore += 1;
  if (answers.s10_diet_result === "Gained weight consistently") slowScore += 2;
  if (answers.s10_diet_result === "Lost weight but gained it back") slowScore += 1;

  if (answers.s9_stress === "High" || answers.s9_stress === "Very high") stressScore += 3;
  if (answers.s8_quality === "Poor — I wake up often") stressScore += 2;
  if (asNum(answers.s8_hours, 7) < 6) stressScore += 2;
  if (answers.s3_fat_storage === "Belly / midsection") stressScore += 2;
  if (asArr(answers.s18_biggest_problem).some((item) => item.toLowerCase().includes("motivation"))) stressScore += 1;

  if (answers.s1_gender === "Female") {
    if (answers.s7_gain_easy === "Yes — I gain weight fast") hormonalScore += 2;
    if (answers.s3_fat_storage === "Lower body (hips, thighs)") hormonalScore += 3;
    if (answers.s9_stress === "High" || answers.s9_stress === "Very high") hormonalScore += 1;
    if (answers.s8_quality === "Poor — I wake up often") hormonalScore += 1;
  }

  const sorted = Object.entries({
    fast: fastScore,
    slow: slowScore,
    stress_dominant: stressScore,
    hormonal: hormonalScore
  }).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] as MetabolicType | undefined) ?? "slow";
}

export function detectReverseDietNeeded(answers: QuizAnswers): boolean {
  const didDiet = answers.s10_dieted === "Yes";
  const regainedWeight = answers.s10_diet_result === "Lost weight but gained it back";
  const slowMeta = answers.s7_lose_easy === "No — I struggle to lose";
  const gainEasy = answers.s7_gain_easy === "Yes — I gain weight fast";
  const aggressivePace = answers.s2_pace === "Aggressive";
  if (didDiet && regainedWeight && slowMeta) return true;
  if (didDiet && regainedWeight && gainEasy && aggressivePace) return true;
  return false;
}

export function predictPlateauWeek(
  _startWeight: number,
  _calorieTarget: number,
  _tdee: number,
  goal: string,
  metabolicType: MetabolicType
): number {
  if (goal === "Maintain weight") return 0;
  const adaptationRate = {
    fast: 0.08,
    slow: 0.18,
    stress_dominant: 0.15,
    hormonal: 0.14
  }[metabolicType];
  const plateauWeek = Math.round(1 / adaptationRate);
  return Math.min(10, Math.max(3, plateauWeek));
}

export function projectWeightCurve(
  startWeight: number,
  weeklyChange: number,
  plateauWeek: number,
  refeedWeeks: number[],
  totalWeeks: number
): number[] {
  const weights = [Number(startWeight.toFixed(1))];
  for (let w = 1; w <= totalWeeks; w++) {
    let change = weeklyChange;
    if (plateauWeek > 0 && w === plateauWeek) change = weeklyChange * 0.2;
    if (refeedWeeks.includes(w)) change = weeklyChange * 0.1;
    weights.push(Number((weights[w - 1] + change).toFixed(1)));
  }
  return weights;
}

export function calculateTJAIMetrics(answers: QuizAnswers): TJAIMetrics {
  const age = asNum(answers.s1_age, 25);
  const height = asNum(answers.s1_height, 170);
  const weight = asNum(answers.s1_weight, 70);
  const gender = asStr(answers.s1_gender);
  const goal = asStr(answers.s2_goal);
  const pace = asStr(answers.s2_pace);
  const activity = asStr(answers.s4_daily_activity);
  const steps = asStr(answers.s4_steps);
  const trains = asStr(answers.s5_trains);
  const trainDays = asStr(answers.s5_days);
  const stress = asStr(answers.s9_stress);
  const sleepQuality = asStr(answers.s8_quality);
  const dietStyle = asStr(answers.s12_diet_style);

  const maleBmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const femaleBmr = 10 * weight + 6.25 * height - 5 * age - 161;
  const bmr =
    gender.startsWith("Male")
      ? maleBmr
      : gender.startsWith("Female")
        ? femaleBmr
        : (maleBmr + femaleBmr) / 2;

  let tdee = bmr * activityMultiplier(activity);
  if (trains.startsWith("Yes")) {
    tdee += trainingDaysAdjustment(trainDays, bmr);
  }
  tdee += stepsAdjustment(steps);

  let calorieTarget = applyGoalCalories(tdee, goal, pace, gender);
  calorieTarget = applyStressSleepAdjustment(calorieTarget, stress, sleepQuality);

  const silhouetteBF = asNum(answers.s3_estimated_bf, NaN);
  const providedBodyFat = asNum(answers.s3_bf_percent, NaN);
  const bodyType = asStr(answers.s3_body_silhouette || answers.s3_body_type);
  const estimatedBodyFat = Number.isFinite(providedBodyFat)
    ? providedBodyFat
    : Number.isFinite(silhouetteBF)
      ? silhouetteBF
      : estimateBodyFatFromType(bodyType);

  const leanMass = weight * (1 - estimatedBodyFat / 100);
  const metabolicType = classifyMetabolicType(answers);

  let proteinPerKg = 1.8;
  if (goal.startsWith("Lose fat")) proteinPerKg = 2.2;
  if (goal.startsWith("Gain muscle")) proteinPerKg = 2.0;
  if (goal.startsWith("Recomposition")) proteinPerKg = 2.4;

  let protein = proteinPerKg * weight;
  if (bodyType.startsWith("Obese")) {
    protein = 2.0 * Math.max(leanMass, 45);
  }

  let fatPerKg = 1.0;
  if (dietStyle.toLowerCase().includes("keto") || dietStyle.toLowerCase().includes("low carb")) fatPerKg = 1.5;
  if (metabolicType === "hormonal" && gender.startsWith("Female")) {
    fatPerKg = Math.max(fatPerKg, 1.2);
  }
  fatPerKg = Math.max(0.8, fatPerKg);
  let fat = fatPerKg * weight;

  if (metabolicType === "fast") calorieTarget *= 1.05;
  if (metabolicType === "slow") calorieTarget *= 0.92;
  if (metabolicType === "stress_dominant") {
    calorieTarget *= 0.95;
    protein += 10;
  }
  if (metabolicType === "hormonal" && (goal.startsWith("Lose fat") || goal.startsWith("Recomposition"))) calorieTarget *= 0.95;

  const carbCalories = calorieTarget - protein * 4 - fat * 9;
  let carbs = carbCalories / 4;
  const carbFloor = dietStyle.toLowerCase().includes("low carb") || dietStyle.toLowerCase().includes("keto") ? 50 : 100;
  carbs = Math.max(carbFloor, carbs);

  let water = weight * 35;
  water += trains.startsWith("Yes") ? 500 : 0;
  if (activity.startsWith("Active") || activity.startsWith("Very active")) water += 300;
  water = Math.round(water / 100) * 100;

  const dailyDelta = calorieTarget - tdee;
  const weeklyWeightChange = Number(((dailyDelta * 7) / 7700).toFixed(2));
  const reverseDietNeeded = detectReverseDietNeeded(answers);
  const plateauWeek = predictPlateauWeek(weight, calorieTarget, tdee, goal, metabolicType);
  const refeedWeeks = goal.startsWith("Lose fat") ? [4, 8] : [];
  const deloadWeeks = [4, 8];
  const totalWeeks = reverseDietNeeded ? 14 : 12;
  const weightCurve = projectWeightCurve(weight, weeklyWeightChange, plateauWeek, refeedWeeks, totalWeeks);
  const projectedFinalWeight = weightCurve[weightCurve.length - 1] ?? weight;
  const projectedFinalBF = Math.max(5, Number((estimatedBodyFat + weeklyWeightChange * 0.65 * 12).toFixed(1)));

  const trainingDayCalories =
    goal.startsWith("Gain muscle") ? Math.round(calorieTarget + 200) : goal.startsWith("Maintain") ? Math.round(calorieTarget) : Math.round(calorieTarget + 150);
  const restDayCalories =
    goal.startsWith("Gain muscle") ? Math.round(calorieTarget - 100) : goal.startsWith("Maintain") ? Math.round(calorieTarget) : Math.round(calorieTarget - 150);

  const targetWeight = asNum(answers.s19_target_weight, weight);
  const diff = targetWeight - weight;
  let timeToGoal = "approximately 12 weeks";
  if (Math.abs(weeklyWeightChange) > 0.01) {
    const weeks = Math.max(1, Math.round(Math.abs(diff / weeklyWeightChange)));
    timeToGoal = `approximately ${weeks} weeks`;
  } else if (goal.startsWith("Recomposition")) {
    timeToGoal = "approximately 12-16 weeks";
  }

  const keyFields = [
    "s1_age",
    "s1_gender",
    "s1_height",
    "s1_weight",
    "s2_goal",
    "s2_pace",
    "s4_daily_activity",
    "s4_steps",
    "s8_hours",
    "s8_quality",
    "s9_stress",
    "s19_daily_routine"
  ];
  const completed = keyFields.filter((k) => {
    const v = answers[k];
    if (typeof v === "number") return true;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return false;
  }).length;
  const confidenceScore = Math.round((completed / keyFields.length) * 100);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget: Math.round(calorieTarget),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    water,
    estimatedBodyFat: Math.round(estimatedBodyFat),
    weeklyWeightChange,
    timeToGoal,
    metabolicType,
    plateauWeek,
    reverseDietNeeded,
    trainingDayCalories,
    restDayCalories,
    refeedWeeks,
    deloadWeeks,
    leanMass: Number(leanMass.toFixed(1)),
    projectedFinalWeight,
    projectedFinalBF,
    weightCurve,
    confidenceScore
  };
}


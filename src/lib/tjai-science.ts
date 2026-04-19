import { buildTjaiUserProfile } from "@/lib/tjai-intake";
import type { MetabolicType, QuizAnswers, TJAIMetrics, TjaiUserProfile } from "@/lib/tjai-types";

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

function activityMultiplier(activity: TjaiUserProfile["activityLevel"]): number {
  if (activity === "very_low") return 1.2;
  if (activity === "low") return 1.375;
  if (activity === "moderate") return 1.55;
  return 1.725;
}

function trainingDaysAdjustment(days: number, bmr: number): number {
  if (days <= 2) return bmr * 0.05;
  if (days <= 4) return bmr * 0.1;
  if (days <= 6) return bmr * 0.15;
  if (days >= 7) return bmr * 0.2;
  return 0;
}

function scheduleAdjustment(profile: TjaiUserProfile): number {
  if (profile.scheduleConstraint === "short_sessions") return -80;
  if (profile.scheduleConstraint === "shift_work") return -60;
  if (profile.scheduleConstraint === "travel") return -40;
  if (profile.scheduleConstraint === "family_load") return -50;
  return 0;
}

function applyGoalCalories(
  tdee: number,
  goal: TjaiUserProfile["goal"],
  pace: TjaiUserProfile["pace"],
  sex: TjaiUserProfile["sex"]
): number {
  let cals = tdee;
  if (goal === "fat_loss") {
    if (pace === "slow") cals = tdee - 250;
    if (pace === "moderate") cals = tdee - 450;
    if (pace === "aggressive") cals = tdee - 650;
    const floor = sex === "female" ? 1200 : 1500;
    cals = Math.max(cals, floor);
  } else if (goal === "muscle_gain") {
    if (pace === "slow") cals = tdee + 150;
    if (pace === "moderate") cals = tdee + 275;
    if (pace === "aggressive") cals = tdee + 425;
  } else if (goal === "recomposition") {
    cals = tdee - (pace === "aggressive" ? 150 : 50);
  } else if (goal === "fitness") {
    cals = tdee;
  } else {
    cals = tdee;
  }
  return cals;
}

function applyStressSleepAdjustment(
  calories: number,
  stress: TjaiUserProfile["stressLevel"],
  sleepHours: number
): number {
  const highStress = stress === "high" || stress === "very_high";
  const poorSleep = sleepHours < 6;
  const goodSleep = sleepHours >= 8;
  if (highStress && poorSleep) return calories * 0.95;
  if (!highStress && goodSleep) return calories * 1.02;
  return calories;
}

export function classifyMetabolicType(profile: TjaiUserProfile): MetabolicType {
  let fastScore = 0;
  let slowScore = 0;
  let stressScore = 0;
  let hormonalScore = 0;

  if (profile.goal === "muscle_gain" && profile.bodyType === "very_lean") fastScore += 2;
  if (profile.goal === "fitness" && profile.activityLevel === "active") fastScore += 1;
  if (profile.sleepHours >= 7) fastScore += 1;
  if (profile.stressLevel === "low" || profile.stressLevel === "very_low") fastScore += 1;

  if (profile.goal === "fat_loss" && (profile.bodyType === "overweight" || profile.bodyType === "obese")) slowScore += 2;
  if (profile.goal === "recomposition") slowScore += 1;
  if (profile.scheduleConstraint === "short_sessions" || profile.scheduleConstraint === "family_load") slowScore += 1;

  if (profile.stressLevel === "high" || profile.stressLevel === "very_high") stressScore += 3;
  if (profile.sleepHours < 6) stressScore += 2;
  if (profile.biggestObstacles.includes("stress") || profile.biggestObstacles.includes("recovery")) stressScore += 2;
  if (profile.scheduleConstraint === "shift_work") stressScore += 1;

  if (profile.sex === "female") {
    if (profile.bodyType === "overweight") hormonalScore += 2;
    if (profile.goal === "fat_loss" || profile.goal === "recomposition") hormonalScore += 1;
    if (profile.stressLevel === "high" || profile.stressLevel === "very_high") hormonalScore += 1;
    if (profile.sleepHours < 6) hormonalScore += 1;
  }

  const sorted = Object.entries({
    fast: fastScore,
    slow: slowScore,
    stress_dominant: stressScore,
    hormonal: hormonalScore
  }).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] as MetabolicType | undefined) ?? "slow";
}

export function detectReverseDietNeeded(profile: TjaiUserProfile): boolean {
  return (
    profile.goal === "fat_loss" &&
    profile.pace === "aggressive" &&
    profile.stressLevel !== "low" &&
    profile.sleepHours < 7 &&
    (profile.bodyType === "overweight" || profile.bodyType === "obese")
  );
}

export function predictPlateauWeek(
  _startWeight: number,
  _calorieTarget: number,
  _tdee: number,
  goal: string,
  metabolicType: MetabolicType
): number {
  if (goal === "fitness" || goal === "stay_active") return 0;
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
  const profile = buildTjaiUserProfile(answers);

  const maleBmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const femaleBmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
  const bmr =
    profile.sex === "male"
      ? maleBmr
      : profile.sex === "female"
        ? femaleBmr
        : (maleBmr + femaleBmr) / 2;

  let tdee = bmr * activityMultiplier(profile.activityLevel);
  tdee += trainingDaysAdjustment(profile.trainingDays, bmr);
  tdee += scheduleAdjustment(profile);

  let calorieTarget = applyGoalCalories(tdee, profile.goal, profile.pace, profile.sex);
  calorieTarget = applyStressSleepAdjustment(calorieTarget, profile.stressLevel, profile.sleepHours);

  const estimatedBodyFat = profile.estimatedBodyFat;
  const leanMass = profile.weightKg * (1 - estimatedBodyFat / 100);
  const metabolicType = classifyMetabolicType(profile);

  let proteinPerKg = 1.8;
  if (profile.goal === "fat_loss") proteinPerKg = 2.2;
  if (profile.goal === "muscle_gain") proteinPerKg = 2.0;
  if (profile.goal === "recomposition") proteinPerKg = 2.3;

  let protein = proteinPerKg * profile.weightKg;
  if (profile.bodyType === "obese") {
    protein = 2.0 * Math.max(leanMass, 45);
  }

  let fatPerKg = 1.0;
  if (profile.dietStyle === "low_carb") fatPerKg = 1.25;
  if (profile.dietStyle === "vegan" || profile.dietStyle === "vegetarian") fatPerKg = 0.9;
  if (metabolicType === "hormonal" && profile.sex === "female") {
    fatPerKg = Math.max(fatPerKg, 1.2);
  }
  fatPerKg = Math.max(0.8, fatPerKg);
  let fat = fatPerKg * profile.weightKg;

  if (metabolicType === "fast") calorieTarget *= 1.05;
  if (metabolicType === "slow") calorieTarget *= 0.92;
  if (metabolicType === "stress_dominant") {
    calorieTarget *= 0.95;
    protein += 10;
  }
  if (metabolicType === "hormonal" && (profile.goal === "fat_loss" || profile.goal === "recomposition")) calorieTarget *= 0.95;

  const carbCalories = calorieTarget - protein * 4 - fat * 9;
  let carbs = carbCalories / 4;
  const carbFloor = profile.dietStyle === "low_carb" ? 50 : 100;
  carbs = Math.max(carbFloor, carbs);

  let water = profile.weightKg * 35;
  water += profile.trainingDays > 0 ? 500 : 0;
  if (profile.activityLevel === "active") water += 300;
  water = Math.round(water / 100) * 100;

  const dailyDelta = calorieTarget - tdee;
  const weeklyWeightChange = Number(((dailyDelta * 7) / 7700).toFixed(2));
  const reverseDietNeeded = detectReverseDietNeeded(profile);
  const plateauWeek = predictPlateauWeek(profile.weightKg, calorieTarget, tdee, profile.goal, metabolicType);
  const refeedWeeks = profile.goal === "fat_loss" ? [4, 8] : [];
  const deloadWeeks = [4, 8];
  const totalWeeks = reverseDietNeeded ? 14 : 12;
  const weightCurve = projectWeightCurve(profile.weightKg, weeklyWeightChange, plateauWeek, refeedWeeks, totalWeeks);
  const projectedFinalWeight = weightCurve[weightCurve.length - 1] ?? profile.weightKg;
  const projectedFinalBF = Math.max(5, Number((estimatedBodyFat + weeklyWeightChange * 0.65 * 12).toFixed(1)));

  const trainingDayCalories =
    profile.goal === "muscle_gain"
      ? Math.round(calorieTarget + 200)
      : profile.goal === "fitness" || profile.goal === "stay_active"
        ? Math.round(calorieTarget)
        : Math.round(calorieTarget + 150);
  const restDayCalories =
    profile.goal === "muscle_gain"
      ? Math.round(calorieTarget - 100)
      : profile.goal === "fitness" || profile.goal === "stay_active"
        ? Math.round(calorieTarget)
        : Math.round(calorieTarget - 150);

  const targetWeight = profile.targetWeightKg ?? profile.weightKg;
  const diff = targetWeight - profile.weightKg;
  let timeToGoal = "approximately 12 weeks";
  if (Math.abs(weeklyWeightChange) > 0.01) {
    const weeks = Math.max(1, Math.round(Math.abs(diff / weeklyWeightChange)));
    timeToGoal = `approximately ${weeks} weeks`;
  } else if (profile.goal === "recomposition") {
    timeToGoal = "approximately 12-16 weeks";
  }

  const confidenceSignals = [
    profile.injuries.length > 0,
    profile.biggestObstacles.length > 0,
    profile.likedFoods.length > 0,
    profile.avoidedFoods.length > 0,
    profile.dailyRoutine.length > 15,
    Boolean(profile.targetWeightKg)
  ].filter(Boolean).length;
  const confidenceScore = Math.min(100, 70 + confidenceSignals * 5);

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


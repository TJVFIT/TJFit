/**
 * WHAT-IF projection models for the TJAI Progress tab.
 *
 * Pure, deterministic scenario math behind the sliders. Conservative
 * sports-science assumptions are stated inline. Every function returns
 * numbers plus a tier key (never prose) so all copy stays localizable.
 */

export const KCAL_PER_KG = 7700; // standard energy density of body-fat tissue
export const MAX_SAFE_WEEKLY_LOSS_PCT = 0.01; // cap fat loss at 1% of bodyweight per week
const OUTCOME_BAND_PCT = 0.25; // adherence + water shifts: real outcomes drift ~±25% around the model

export type WeightTier = "surplus" | "maintenance" | "gradual" | "standard" | "aggressive";

export interface WeightProjectionInput {
  currentKg: number;
  dailyDeficitKcal: number; // positive = deficit, negative = surplus
  weeks: number;
}

export interface WeightProjection {
  weeklyChangeKg: number; // raw energy-balance rate, negative = loss
  safeWeeklyChangeKg: number; // loss clamped at MAX_SAFE_WEEKLY_LOSS_PCT
  totalChangeKg: number;
  projectedKg: number;
  lowerBoundKg: number;
  upperBoundKg: number;
  rateClamped: boolean;
  tier: WeightTier;
}

function round(value: number, decimals: number) {
  const f = 10 ** decimals;
  const r = Math.round(value * f) / f;
  return r === 0 ? 0 : r;
}

export function projectWeightChange({ currentKg, dailyDeficitKcal, weeks }: WeightProjectionInput): WeightProjection {
  const safeWeeks = Math.max(0, weeks);
  const rawWeekly = -(dailyDeficitKcal * 7) / KCAL_PER_KG;
  const maxWeeklyLossKg = currentKg * MAX_SAFE_WEEKLY_LOSS_PCT;
  const cappedWeekly = Math.max(rawWeekly, -maxWeeklyLossKg);
  const rateClamped = cappedWeekly > rawWeekly;
  const totalChangeKg = cappedWeekly * safeWeeks;
  const projectedKg = Math.max(0, currentKg + totalChangeKg);
  const bandKg = Math.abs(totalChangeKg) * OUTCOME_BAND_PCT;

  let tier: WeightTier;
  if (dailyDeficitKcal < 0) tier = "surplus";
  else if (dailyDeficitKcal === 0) tier = "maintenance";
  else if (rateClamped) tier = "aggressive";
  else if (Math.abs(rawWeekly) <= currentKg * 0.005) tier = "gradual";
  else tier = "standard";

  return {
    weeklyChangeKg: round(rawWeekly, 2),
    safeWeeklyChangeKg: round(cappedWeekly, 2),
    totalChangeKg: round(totalChangeKg, 1),
    projectedKg: round(projectedKg, 1),
    lowerBoundKg: round(Math.max(0, projectedKg - bandKg), 1),
    upperBoundKg: round(projectedKg + bandKg, 1),
    rateClamped,
    tier
  };
}

export type ProteinGoal = "fat_loss" | "muscle_gain" | "recomposition" | "fitness" | "stay_active";
export type ProteinTier = "preserve" | "build" | "maintain";

export interface ProteinTargetResult {
  perKgMin: number;
  perKgMax: number;
  minGrams: number;
  maxGrams: number;
  tier: ProteinTier;
}

// Evidence-based 1.6-2.2 g/kg window; the top end protects lean mass in a deficit.
const PROTEIN_RANGE_PER_KG: Record<ProteinTier, { min: number; max: number }> = {
  preserve: { min: 2.0, max: 2.2 },
  build: { min: 1.8, max: 2.2 },
  maintain: { min: 1.6, max: 1.8 }
};

const GOAL_TO_PROTEIN_TIER: Record<ProteinGoal, ProteinTier> = {
  fat_loss: "preserve",
  recomposition: "preserve",
  muscle_gain: "build",
  fitness: "maintain",
  stay_active: "maintain"
};

export function proteinTarget({ weightKg, goal }: { weightKg: number; goal: ProteinGoal }): ProteinTargetResult {
  const tier = GOAL_TO_PROTEIN_TIER[goal];
  const range = PROTEIN_RANGE_PER_KG[tier];
  return {
    perKgMin: range.min,
    perKgMax: range.max,
    minGrams: Math.round(weightKg * range.min),
    maxGrams: Math.round(weightKg * range.max),
    tier
  };
}

export type VolumeTier = "minimal" | "foundation" | "solid" | "high";

export interface TrainingVolumeResult {
  weeklyMinutes: number;
  tier: VolumeTier;
}

// WHO adult guideline: 150 min/week is the floor; 300+ is where physique
// progress lives; past ~480 recovery becomes the limiting factor.
export function trainingVolumeTier({
  sessionsPerWeek,
  minutesPerSession
}: {
  sessionsPerWeek: number;
  minutesPerSession: number;
}): TrainingVolumeResult {
  const weeklyMinutes = Math.max(0, sessionsPerWeek) * Math.max(0, minutesPerSession);
  const tier: VolumeTier =
    weeklyMinutes < 150 ? "minimal" : weeklyMinutes < 300 ? "foundation" : weeklyMinutes <= 480 ? "solid" : "high";
  return { weeklyMinutes, tier };
}

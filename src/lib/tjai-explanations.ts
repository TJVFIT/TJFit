import { buildTjaiUserProfile } from "@/lib/tjai-intake";
import type { QuizAnswers, TJAIMetrics } from "@/lib/tjai-types";

export function buildTjaiDecisionReasons(answers: QuizAnswers, metrics: TJAIMetrics): string[] {
  const profile = buildTjaiUserProfile(answers);
  const reasons: string[] = [];

  reasons.push(
    `TJAI set your calories around ${metrics.calorieTarget} kcal because your current profile points to a ${profile.goal.replaceAll("_", " ")} objective with a ${profile.pace} pace.`
  );

  if (profile.trainingLocation === "home") {
    reasons.push(`Your training plan is biased toward home-friendly work because you mainly train at home and reported ${profile.equipment.length} usable equipment options.`);
  } else if (profile.trainingLocation === "gym") {
    reasons.push("Your program leans into full gym progression because you have gym access, which gives TJAI more room for overload and exercise rotation.");
  } else {
    reasons.push("Your plan is built as a hybrid system so you can stay consistent across both home and gym weeks.");
  }

  if (profile.stressLevel === "high" || profile.stressLevel === "very_high" || profile.sleepHours < 6) {
    reasons.push("TJAI softened recovery demand because your sleep/stress profile suggests that pushing too hard would likely backfire.");
  }

  if (profile.injuries.length > 0) {
    reasons.push(`TJAI is treating your injury profile (${profile.injuries.join(", ").replaceAll("_", " ")}) as a first-class constraint, not a footnote, so exercise selection and volume are intentionally safer.`);
  }

  if (profile.biggestObstacles.includes("time") || profile.scheduleConstraint !== "none") {
    reasons.push("Your schedule constraints are shaping workout density, meal simplicity, and adherence strategy so the plan is realistic enough to survive a normal week.");
  }

  if (profile.dietaryRestrictions.some((item) => item !== "none") || profile.avoidedFoods.length > 0) {
    reasons.push("Meal choices are filtered through your restrictions and disliked foods first, then optimized for macros, so the nutrition plan stays practical.");
  }

  return reasons.slice(0, 4);
}

export function buildTjaiRegenerationReasons(
  summary: {
    actualWeeklyChange?: number | null;
    projectedWeeklyChange?: number | null;
    workoutsPerWeek?: number | null;
    regenReason?: string | null;
  }
): string[] {
  const reasons: string[] = [];
  if (typeof summary.actualWeeklyChange === "number" && typeof summary.projectedWeeklyChange === "number") {
    reasons.push(
      `Actual weekly change (${summary.actualWeeklyChange.toFixed(2)} kg/week) is now diverging from the original projection (${summary.projectedWeeklyChange.toFixed(2)} kg/week).`
    );
  }
  if (typeof summary.workoutsPerWeek === "number") {
    reasons.push(`Recent adherence is about ${summary.workoutsPerWeek.toFixed(1)} workouts/week, so regeneration should respect your real consistency, not the ideal version of it.`);
  }
  if (summary.regenReason) {
    reasons.push(summary.regenReason);
  }
  return reasons;
}

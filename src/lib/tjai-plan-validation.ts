import type { TJAIPlan } from "@/lib/tjai-types";

export function validateTjaiPlan(candidate: unknown): candidate is TJAIPlan {
  if (!candidate || typeof candidate !== "object") return false;
  const plan = candidate as Record<string, unknown>;
  const summary = plan.summary as Record<string, unknown> | undefined;
  const diet = plan.diet as Record<string, unknown> | undefined;
  const program = plan.program as Record<string, unknown> | undefined;

  if (!summary || typeof summary.greeting !== "string") return false;
  if (typeof summary.calorieTarget !== "number" || !Number.isFinite(summary.calorieTarget)) return false;
  if (typeof summary.protein !== "number" || !Number.isFinite(summary.protein)) return false;
  if (!diet || !Array.isArray(diet.weeks) || diet.weeks.length === 0) return false;
  if (!program || !Array.isArray(program.weeks) || program.weeks.length === 0) return false;

  const hasDietDays = (diet.weeks as Array<Record<string, unknown>>).some((week) => Array.isArray(week.days) && week.days.length > 0);
  const hasProgramDays = (program.weeks as Array<Record<string, unknown>>).some((week) => Array.isArray(week.days) && week.days.length > 0);
  return hasDietDays && hasProgramDays;
}

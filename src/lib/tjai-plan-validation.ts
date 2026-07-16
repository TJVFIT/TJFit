import type { TJAIPlan } from "@/lib/tjai-types";

function clampNumber(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function shortString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function shortStringArray(value: unknown, maxItems: number, maxLength: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((item) => shortString(item, maxLength))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems);
  return items.length > 0 ? items : undefined;
}

function setOrDelete(target: Record<string, unknown>, key: string, value: unknown) {
  if (value === undefined) delete target[key];
  else target[key] = value;
}

/**
 * Normalize the professional-detail fields (all optional/additive) in place.
 * Out-of-range or malformed values are clamped or dropped — never a hard
 * failure, so legacy plans and sloppy LLM output keep passing exactly as before.
 */
function sanitizeProfessionalFields(plan: Record<string, unknown>) {
  const program = plan.program as Record<string, unknown> | undefined;
  if (program) {
    if ("progressionModel" in program) setOrDelete(program, "progressionModel", shortString(program.progressionModel, 900));
    if ("testWeekGuidance" in program) setOrDelete(program, "testWeekGuidance", shortString(program.testWeekGuidance, 600));
    const weeks = Array.isArray(program.weeks) ? (program.weeks as Array<Record<string, unknown>>) : [];
    weeks.forEach((week) => {
      if (!week || typeof week !== "object") return;
      if ("coachRationale" in week) setOrDelete(week, "coachRationale", shortString(week.coachRationale, 700));
      if ("deloadGuidance" in week) setOrDelete(week, "deloadGuidance", shortString(week.deloadGuidance, 400));
      const days = Array.isArray(week.days) ? (week.days as Array<Record<string, unknown>>) : [];
      days.forEach((day) => {
        if (!day || typeof day !== "object") return;
        if ("focus" in day) setOrDelete(day, "focus", shortString(day.focus, 120));
        if ("estimatedMinutes" in day) setOrDelete(day, "estimatedMinutes", clampNumber(day.estimatedMinutes, 10, 180));
        const exercises = Array.isArray(day.exercises) ? (day.exercises as Array<Record<string, unknown>>) : [];
        exercises.forEach((exercise) => {
          if (!exercise || typeof exercise !== "object") return;
          if ("tempo" in exercise) setOrDelete(exercise, "tempo", shortString(exercise.tempo, 20));
          if ("rpe" in exercise) setOrDelete(exercise, "rpe", clampNumber(exercise.rpe, 5, 10));
          if ("restSeconds" in exercise) setOrDelete(exercise, "restSeconds", clampNumber(exercise.restSeconds, 15, 600));
          if ("warmupSets" in exercise) setOrDelete(exercise, "warmupSets", shortString(exercise.warmupSets, 120));
          if ("substitutions" in exercise) setOrDelete(exercise, "substitutions", shortStringArray(exercise.substitutions, 2, 90));
          if ("formCues" in exercise) setOrDelete(exercise, "formCues", shortStringArray(exercise.formCues, 2, 90));
        });
      });
    });
  }

  const diet = plan.diet as Record<string, unknown> | undefined;
  const dietWeeks = diet && Array.isArray(diet.weeks) ? (diet.weeks as Array<Record<string, unknown>>) : [];
  dietWeeks.forEach((week) => {
    if (!week || typeof week !== "object") return;
    if ("coachRationale" in week) setOrDelete(week, "coachRationale", shortString(week.coachRationale, 700));
  });
}

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
  if (!hasDietDays || !hasProgramDays) return false;

  sanitizeProfessionalFields(plan);
  return true;
}

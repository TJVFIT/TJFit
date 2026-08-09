/**
 * Contextual quick-reply selection for TJAI chat.
 *
 * Picks follow-up chip KEYS from the user's real state — plan, recent
 * workouts, weight trend — using data the chat route has already loaded.
 * Deliberately deterministic: no extra LLM call, no extra queries, fully unit
 * testable. The client maps keys to localized chip text and falls back to its
 * static topic chips when no keys apply.
 *
 * Server sends keys (not text) so localization stays client-side with the
 * rest of the chat copy.
 */

export type CoachSuggestionKey =
  | "generate_plan"
  | "restart_training"
  | "diagnose_progress"
  | "plan_checkin";

export type SuggestionInput = {
  hasPlan: boolean;
  /** Plan goal, e.g. "fat_loss" | "muscle_gain" — null when no plan. */
  goal: string | null;
  /** workout_date (ISO date) of recent logs, newest first. */
  workoutDates: readonly (string | null)[];
  /** Progress entries, newest first. */
  entries: readonly { weight_kg: number | null }[];
  /** Injectable clock for tests. */
  now?: Date;
};

const STALE_TRAINING_DAYS = 7;

function daysSince(iso: string | null, now: Date): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - then) / 86_400_000;
}

/**
 * Weight trend vs goal. Only speaks when there are at least two entries and
 * the direction clearly opposes the goal — a noisy single reading must not
 * generate a "diagnose" chip that reads as an accusation.
 */
function trendOpposesGoal(input: SuggestionInput): boolean {
  if (!input.goal || input.entries.length < 2) return false;
  const latest = Number(input.entries[0]?.weight_kg ?? NaN);
  const oldest = Number(input.entries[input.entries.length - 1]?.weight_kg ?? NaN);
  if (Number.isNaN(latest) || Number.isNaN(oldest)) return false;
  const diff = latest - oldest;
  if (input.goal === "fat_loss" && diff > 0.5) return true;
  if (input.goal === "muscle_gain" && diff < -0.5) return true;
  return false;
}

/**
 * Priority-ordered, max two — chips compete with the user's own next thought,
 * so fewer, sharper suggestions beat a menu.
 */
export function pickCoachSuggestionKeys(input: SuggestionInput): CoachSuggestionKey[] {
  const now = input.now ?? new Date();
  const keys: CoachSuggestionKey[] = [];

  if (!input.hasPlan) {
    // Without a plan every other suggestion is moot.
    return ["generate_plan"];
  }

  const newestWorkout = input.workoutDates[0] ?? null;
  if (daysSince(newestWorkout, now) > STALE_TRAINING_DAYS) {
    keys.push("restart_training");
  }

  if (trendOpposesGoal(input)) {
    keys.push("diagnose_progress");
  }

  // Engaged default: plan + recent training and nothing urgent above.
  if (keys.length === 0) {
    keys.push("plan_checkin");
  }

  return keys.slice(0, 2);
}

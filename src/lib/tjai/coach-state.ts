import type {
  ChatCoachPlanRow,
  ChatCoachProgressEntry,
  ChatCoachWorkoutLog
} from "@/lib/tjai/context/chat-coach-context";
import type { TjaiMemorySnapshot, TjaiReadinessProfile } from "@/lib/tjai-types";

/**
 * Compact, deterministic chat coach-state (TJFITV.10X PR3).
 *
 * Summarizes adherence, body trend, and the single next-best coaching action
 * from data the chat route already loads, so the model acts on a server-computed
 * decision instead of inferring state from raw logs. Safety escalation is handled
 * upstream by the medical guard, so it is not a mode here.
 */
export type CoachStateMode =
  | "continue_plan"
  | "log_data"
  | "rescue_missed_workout"
  | "regenerate_plan";

export type TjaiCoachState = {
  adherence: {
    workoutsLast14d: number;
    daysSinceLastWorkout: number | null;
    planTrainingDaysPerWeek: number | null;
  };
  body: {
    latestWeightKg: number | null;
    weightChangeKg: number | null;
    hasEnoughTrendData: boolean;
  };
  coachingMode: TjaiReadinessProfile["coachingMode"] | null;
  nextBestAction: { mode: CoachStateMode; reason: string };
};

function daysBetween(fromIso: string | null, now: Date): number | null {
  if (!fromIso) return null;
  const then = new Date(fromIso).getTime();
  if (!Number.isFinite(then)) return null;
  return Math.max(0, Math.floor((now.getTime() - then) / 86_400_000));
}

export function buildCoachState(input: {
  planRow: ChatCoachPlanRow | null;
  workouts: ChatCoachWorkoutLog[];
  entries: ChatCoachProgressEntry[];
  adaptiveCheckpoint: TjaiMemorySnapshot["adaptiveCheckpoint"];
  readiness?: TjaiReadinessProfile | null;
  now?: Date;
}): TjaiCoachState {
  const now = input.now ?? new Date();
  const cutoff = now.getTime() - 14 * 86_400_000;

  const workoutsLast14d = input.workouts.filter((w) => {
    const t = w.workout_date ? new Date(w.workout_date).getTime() : NaN;
    return Number.isFinite(t) && t >= cutoff;
  }).length;
  const daysSinceLastWorkout = daysBetween(input.workouts[0]?.workout_date ?? null, now);
  const planTrainingDaysPerWeek = input.planRow?.training_days_per_week ?? null;

  const latestWeightKg = input.entries[0]?.weight_kg != null ? Number(input.entries[0].weight_kg) : null;
  const hasEnoughTrendData = input.entries.filter((e) => e.weight_kg != null).length >= 2;
  const weightChangeKg =
    hasEnoughTrendData && latestWeightKg != null
      ? Number((latestWeightKg - Number(input.entries[input.entries.length - 1]?.weight_kg ?? latestWeightKg)).toFixed(1))
      : null;

  const expectedLast14d = planTrainingDaysPerWeek ? planTrainingDaysPerWeek * 2 : null;
  const farBelowTarget = expectedLast14d != null && workoutsLast14d < Math.ceil(expectedLast14d * 0.5);

  let nextBestAction: TjaiCoachState["nextBestAction"];
  if (input.adaptiveCheckpoint?.triggerRegen) {
    nextBestAction = {
      mode: "regenerate_plan",
      reason: input.adaptiveCheckpoint.regenReason ?? "Adaptive checkpoint flagged the plan for regeneration."
    };
  } else if ((daysSinceLastWorkout != null && daysSinceLastWorkout >= 5) || farBelowTarget) {
    nextBestAction = {
      mode: "rescue_missed_workout",
      reason:
        daysSinceLastWorkout != null
          ? `No workout logged for ${daysSinceLastWorkout} days — resume at the next planned session, no punishment.`
          : "Workout count is well below the plan target — restart gently at the next planned session."
    };
  } else if (input.entries.length < 2 || input.workouts.length === 0) {
    nextBestAction = {
      mode: "log_data",
      reason: "Not enough logged data to diagnose progress — prompt one quick log (weight or last workout)."
    };
  } else {
    nextBestAction = {
      mode: "continue_plan",
      reason: "Adherence and data look on track — reinforce the current plan and the next session."
    };
  }

  return {
    adherence: { workoutsLast14d, daysSinceLastWorkout, planTrainingDaysPerWeek },
    body: { latestWeightKg, weightChangeKg, hasEnoughTrendData },
    coachingMode: input.readiness?.coachingMode ?? null,
    nextBestAction
  };
}

/** Compact prompt block; the model should act on this decision, not re-derive it. */
export function formatCoachStateForPrompt(state: TjaiCoachState): string {
  const lines = [
    "══ COACH STATE (server-derived decision — act on this) ══",
    `Workouts last 14d: ${state.adherence.workoutsLast14d}${
      state.adherence.planTrainingDaysPerWeek ? ` (plan target ~${state.adherence.planTrainingDaysPerWeek}/wk)` : ""
    } | Days since last workout: ${state.adherence.daysSinceLastWorkout ?? "n/a"}`,
    `Weight: ${state.body.latestWeightKg ?? "not logged"}kg | Trend change: ${
      state.body.weightChangeKg != null ? `${state.body.weightChangeKg}kg` : "insufficient data"
    }`,
    state.coachingMode ? `Coaching mode: ${state.coachingMode}` : null,
    `NEXT BEST ACTION → ${state.nextBestAction.mode}: ${state.nextBestAction.reason}`
  ].filter(Boolean);
  return lines.join("\n");
}

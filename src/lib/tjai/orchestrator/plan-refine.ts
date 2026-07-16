import { withTiming } from "@/lib/tjai/observability";
import { runEnhancedPlanCoherenceChecks } from "@/lib/tjai/validation/enhanced-plan-checks";
import { validateTjaiPlanSemantics } from "@/lib/tjai/validation/semantic-plan-checks";
import { validateTjaiPlan } from "@/lib/tjai-plan-validation";
import { llmCall } from "@/lib/tjai/llm";
import { safeParseJSON } from "@/lib/tjai-openai";
import type { ExecutionStage, TjaiRunTrace } from "@/lib/tjai/types/execution";
import type { TJAIPlan, TJAIMetrics, TjaiUserProfile, TjaiReadinessProfile } from "@/lib/tjai-types";

export type PlanRefineResult =
  | { plan: TJAIPlan; refined: true }
  | { plan: TJAIPlan; refined: false; reason: string };

type PlanRefineStageName = Extract<ExecutionStage, "refine_started" | "refined" | "refine_skipped">;

export function pushRefineStage(trace: TjaiRunTrace, stage: PlanRefineStageName, meta?: Record<string, unknown>): void {
  trace.stages.push({ stage, atMs: Date.now(), meta });
}

const REFINE_SYSTEM_PROMPT =
  "You are TJAI's senior strength-and-conditioning reviewer. Another coach drafted a complete " +
  "12-week plan for this client, and it already passed schema and safety validation. Your job is " +
  "a final expert review pass that catches weaknesses a single-shot draft tends to miss.\n\n" +
  "Review process (do this reasoning internally — never output it):\n" +
  "1. Identify up to 5 concrete weaknesses in the draft, checking specifically:\n" +
  "   - Weekly volume distribution per muscle group (undertrained or overtrained groups)\n" +
  "   - Progression logic across the weeks (load and volume should progress sensibly)\n" +
  "   - Exercise order and redundancy within each session\n" +
  "   - Conflicts with the client's injuries, limitations, or available equipment\n" +
  "   - Session length versus the client's available time per session\n" +
  "   - Deload placement and recovery management\n" +
  "2. Apply minimal, targeted corrections that fix ONLY those weaknesses.\n\n" +
  "Output rules (strict):\n" +
  "- Return ONLY the full corrected plan as a single JSON object with EXACTLY the same schema, " +
  "structure, and field names as the draft.\n" +
  "- Keep everything that is already good — do not rewrite, rename, restructure, or trim sections " +
  "that have no identified weakness. Every week and every day in the draft must still exist.\n" +
  "- Never change the calorie target or macro targets.\n" +
  "- Never introduce foods that violate the client's dietary restrictions, and never add exercises " +
  "that conflict with their injuries or equipment.\n" +
  "- Never program the client's banned/disliked exercises or close variants anywhere in the plan.\n" +
  "- Every training day's estimatedMinutes must stay at or under the client's session-minute cap.\n" +
  "- No markdown fences, no commentary, no critique text — the corrected plan JSON only.";

function buildRefineUserPrompt(params: {
  plan: TJAIPlan;
  profile: TjaiUserProfile;
  metrics: TJAIMetrics;
  readiness: TjaiReadinessProfile;
}): string {
  const banned = params.profile.dislikedExercises ?? [];
  const sessionCap = params.profile.sessionLengthMinutes;
  const hardRules: string[] = [];
  if (banned.length > 0) hardRules.push(`banned exercises (never program these or close variants): ${banned.join(", ")}`);
  if (sessionCap) hardRules.push(`session cap: ${sessionCap} minutes per training day including warmup`);
  return (
    "CLIENT PROFILE:\n" +
    JSON.stringify(params.profile) +
    "\n\nCOMPUTED TARGETS (do not change these):\n" +
    JSON.stringify(params.metrics) +
    "\n\nREADINESS ASSESSMENT:\n" +
    JSON.stringify(params.readiness) +
    (hardRules.length > 0
      ? "\n\nHARD RULES (violating any of these makes the output invalid):\n- " + hardRules.join("\n- ")
      : "") +
    "\n\nDRAFT PLAN TO REVIEW AND CORRECT:\n" +
    JSON.stringify(params.plan)
  );
}

// Enum slugs from the quiz mapped to name fragments that identify the exercise
// (and its common variants) in a generated plan. Over-broad matching is safe:
// a false hit only rejects the refined draft and keeps the validated original.
const BANNED_EXERCISE_KEYWORDS: Record<string, string[]> = {
  burpees: ["burpee"],
  running: ["running", "jog", "treadmill", "sprint"],
  jumping: ["jump", "plyo", "bound"],
  overhead_press: ["overhead press", "military press", "shoulder press", "push press"],
  deep_squats: ["squat"],
  deadlifts: ["deadlift", "romanian", "rdl"],
  pull_ups: ["pull-up", "pull up", "pullup", "chin-up", "chin up", "chinup"],
  planks: ["plank"]
};

/**
 * Deterministic backstops the LLM prompt cannot guarantee: the refined plan
 * must keep the locked targets, keep every week/day of the draft, respect the
 * user's banned exercises, and respect the session-length cap.
 */
function violatesHardRules(refined: TJAIPlan, draft: TJAIPlan, profile: TjaiUserProfile): string | null {
  const a = refined.summary;
  const b = draft.summary;
  if (a.calorieTarget !== b.calorieTarget || a.protein !== b.protein || a.carbs !== b.carbs || a.fat !== b.fat) {
    return "targets_changed";
  }

  const shapePreserved =
    refined.program.weeks.length === draft.program.weeks.length &&
    refined.diet.weeks.length === draft.diet.weeks.length &&
    refined.program.weeks.every((w, i) => (w.days?.length ?? 0) >= (draft.program.weeks[i]?.days?.length ?? 0)) &&
    refined.diet.weeks.every((w, i) => (w.days?.length ?? 0) >= (draft.diet.weeks[i]?.days?.length ?? 0));
  if (!shapePreserved) return "completeness_regression";

  const bannedFragments = (profile.dislikedExercises ?? []).flatMap((slug) => BANNED_EXERCISE_KEYWORDS[slug] ?? []);
  const sessionCap = profile.sessionLengthMinutes;
  for (const week of refined.program.weeks) {
    for (const day of week.days ?? []) {
      if (sessionCap && typeof day.estimatedMinutes === "number" && day.estimatedMinutes > sessionCap) {
        return "session_cap_exceeded";
      }
      if (bannedFragments.length > 0) {
        for (const exercise of day.exercises ?? []) {
          const name = exercise.name.toLowerCase();
          if (bannedFragments.some((fragment) => name.includes(fragment))) {
            return "banned_exercise";
          }
        }
      }
    }
  }
  return null;
}

/**
 * Critique-and-refine pass over a validated draft plan. Fail-open by design:
 * any LLM error, parse failure, or validation failure returns the original
 * validated draft untouched — this stage can improve a plan but never lose one.
 */
export async function runPlanRefineStage(params: {
  plan: TJAIPlan;
  profile: TjaiUserProfile;
  metrics: TJAIMetrics;
  readiness: TjaiReadinessProfile;
  userId: string;
  trace: TjaiRunTrace;
}): Promise<PlanRefineResult> {
  const { plan, profile, metrics, readiness, userId, trace } = params;
  try {
    const rawText = await withTiming(trace, "openai_plan_refine", () =>
      llmCall({
        task: "plan_generate",
        system: REFINE_SYSTEM_PROMPT,
        user: buildRefineUserPrompt({ plan, profile, metrics, readiness }),
        maxTokens: 12000,
        jsonMode: true,
        route: "tjai/generate-refine",
        userId
      })
    );

    let parsed: unknown;
    try {
      parsed = safeParseJSON(rawText);
    } catch {
      return { plan, refined: false, reason: "parse_failed" };
    }

    if (!validateTjaiPlan(parsed)) {
      return { plan, refined: false, reason: "structural_validation_failed" };
    }
    const refined = parsed as TJAIPlan;

    const semantic = validateTjaiPlanSemantics({ plan: refined, profile });
    if (!semantic.ok) {
      return { plan, refined: false, reason: "semantic_validation_failed" };
    }

    const coherence = runEnhancedPlanCoherenceChecks(refined, metrics);
    if (!coherence.ok) {
      return { plan, refined: false, reason: "coherence_failed" };
    }

    // The coherence check above is env-gated in prod, and the prompt alone
    // can't guarantee the locked invariants — enforce them deterministically.
    const violation = violatesHardRules(refined, plan, profile);
    if (violation) {
      return { plan, refined: false, reason: violation };
    }

    return { plan: refined, refined: true };
  } catch {
    return { plan, refined: false, reason: "refine_error" };
  }
}

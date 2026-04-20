import type { SupabaseClient } from "@supabase/supabase-js";

import { recordPlanGeneration, getSimilarUserInsight } from "@/lib/tjai-analytics";
import { buildProgramDesignerMessages } from "@/lib/tjai/agents/program-designer";
import { appendTraceError, createRunTrace, logPipelineTrace, pushStage, withTiming } from "@/lib/tjai/observability";
import { TJAI_PROMPT_VERSION } from "@/lib/tjai/prompts";
import { TJAI_SKILL_IDS } from "@/lib/tjai/registry/skills";
import type { TjaiRunTrace } from "@/lib/tjai/types/execution";
import { runEnhancedPlanCoherenceChecks } from "@/lib/tjai/validation/enhanced-plan-checks";
import type { TjaiUserProfile } from "@/lib/tjai-intake";
import { validateTjaiPlan } from "@/lib/tjai-plan-validation";
import { buildTjaiMemorySnapshot, saveTjaiStructuredMemory } from "@/lib/tjai-plan-store";
import { callOpenAI, safeParseJSON } from "@/lib/tjai-openai";
import type { QuizAnswers, TJAIPlan, TJAIMetrics } from "@/lib/tjai-types";

export type PlanGenerationPipelineInput = {
  userId: string;
  adminClient: SupabaseClient;
  quizAnswers: QuizAnswers;
  profile: TjaiUserProfile;
  metrics: TJAIMetrics;
};

export type PlanGenerationSuccessBody = {
  plan: unknown;
  metrics: TJAIMetrics;
  generatedAt: string;
  planId: string | null;
};

export type PlanGenerationPipelineResult =
  | { ok: true; body: PlanGenerationSuccessBody; trace: TjaiRunTrace }
  | { ok: false; status: number; error: string; trace: TjaiRunTrace };

/**
 * Central orchestration for 12-week plan generation — stages, timings, optional strict checks.
 */
export async function runPlanGenerationPipeline(input: PlanGenerationPipelineInput): Promise<PlanGenerationPipelineResult> {
  const trace = createRunTrace(TJAI_SKILL_IDS.CREATE_PROGRAM, TJAI_PROMPT_VERSION);
  pushStage(trace, "received", { userId: input.userId });
  pushStage(trace, "classified", { skill: TJAI_SKILL_IDS.CREATE_PROGRAM });

  if (!process.env.OPENAI_API_KEY) {
    pushStage(trace, "failed", { reason: "no_openai_key" });
    appendTraceError(trace, "OPENAI_API_KEY is not set");
    logPipelineTrace(input.userId, trace);
    return { ok: false, status: 503, error: "AI not configured. Please contact support.", trace };
  }

  let learningInsight: string | null = null;
  let memory = await withTiming(trace, "memory_snapshot", () => buildTjaiMemorySnapshot(input.adminClient, input.userId));

  try {
    learningInsight = await withTiming(trace, "similar_user_insight", () =>
      getSimilarUserInsight(input.adminClient, input.quizAnswers)
    );
  } catch (e) {
    appendTraceError(trace, e instanceof Error ? e.message : "similar_user_insight_failed");
    learningInsight = null;
  }

  pushStage(trace, "context_built", { hasInsight: Boolean(learningInsight) });
  pushStage(trace, "tools_run", { tools: ["memory_snapshot", "similar_user_insight"] });

  const { system: systemPrompt, user: userPrompt } = buildProgramDesignerMessages({
    profile: input.profile,
    metrics: input.metrics,
    memory,
    learningInsight
  });

  let rawText: string;
  try {
    rawText = await withTiming(trace, "openai_plan_json", () =>
      callOpenAI({
        system: systemPrompt,
        user: userPrompt,
        maxTokens: 16000,
        jsonMode: true,
        onUsage: (usage) => {
          trace.tokenUsage = usage;
        }
      })
    );
  } catch (aiError) {
    pushStage(trace, "failed", { phase: "openai" });
    appendTraceError(trace, aiError instanceof Error ? aiError.message : "AI generation failed");
    logPipelineTrace(input.userId, trace);
    const msg = aiError instanceof Error ? aiError.message : "AI generation failed";
    return { ok: false, status: 502, error: `AI generation failed: ${msg}`, trace };
  }

  pushStage(trace, "draft_generated", { chars: rawText.length });

  let plan: unknown;
  try {
    plan = safeParseJSON(rawText);
  } catch (parseError) {
    pushStage(trace, "failed", { phase: "json_parse" });
    appendTraceError(trace, parseError instanceof Error ? parseError.message : "JSON parse error");
    logPipelineTrace(input.userId, trace);
    return { ok: false, status: 502, error: "AI returned an invalid response. Please try again.", trace };
  }

  if (!validateTjaiPlan(plan)) {
    pushStage(trace, "failed", { phase: "structural_validation" });
    appendTraceError(trace, "validateTjaiPlan failed");
    logPipelineTrace(input.userId, trace);
    return { ok: false, status: 502, error: "AI returned an incomplete plan. Please try again.", trace };
  }

  const coherence = runEnhancedPlanCoherenceChecks(plan as TJAIPlan, input.metrics);
  if (!coherence.ok) {
    pushStage(trace, "failed", { phase: "enhanced_validation", reason: coherence.reason });
    appendTraceError(trace, coherence.reason);
    logPipelineTrace(input.userId, trace);
    return {
      ok: false,
      status: 502,
      error: "Plan failed quality checks against your profile. Please try again.",
      trace
    };
  }

  pushStage(trace, "validated");

  const { count: existingCount } = await input.adminClient
    .from("saved_tjai_plans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId);

  const versionNumber = (existingCount ?? 0) + 1;

  const { data: savedPlan, error: saveError } = await input.adminClient
    .from("saved_tjai_plans")
    .insert({
      user_id: input.userId,
      version_number: versionNumber,
      answers_json: input.quizAnswers,
      metrics_json: input.metrics,
      plan_json: plan,
      goal: input.profile.goal,
      daily_calories: Number(input.metrics.calorieTarget ?? 0),
      protein_g: Number(input.metrics.protein ?? 0),
      carbs_g: Number(input.metrics.carbs ?? 0),
      fat_g: Number(input.metrics.fat ?? 0),
      water_ml: Number(input.metrics.water ?? 0),
      training_days_per_week: input.profile.trainingDays,
      training_location: input.profile.trainingLocation,
      updated_at: new Date().toISOString()
    })
    .select("id")
    .maybeSingle();

  if (saveError) {
    appendTraceError(trace, saveError.message);
  }

  void recordPlanGeneration(
    input.adminClient,
    input.quizAnswers,
    Number(input.metrics.calorieTarget ?? 0),
    Number(input.metrics.protein ?? 0)
  );
  void saveTjaiStructuredMemory(input.adminClient, input.userId, input.quizAnswers);

  pushStage(trace, "delivered", { planId: savedPlan?.id ?? null });
  logPipelineTrace(input.userId, trace);

  return {
    ok: true,
    body: {
      plan,
      metrics: input.metrics,
      generatedAt: new Date().toISOString(),
      planId: savedPlan?.id ?? null
    },
    trace
  };
}

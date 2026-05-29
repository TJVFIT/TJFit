import type { SupabaseClient } from "@supabase/supabase-js";

import { recordPlanGeneration, getSimilarUserInsight } from "@/lib/tjai-analytics";
import { buildProgramDesignerMessages } from "@/lib/tjai/agents/program-designer";
import { recordTjaiEvent } from "@/lib/tjai/events";
import { buildReadinessProfile } from "@/lib/tjai/readiness";
import { appendTraceError, createRunTrace, logPipelineTrace, pushStage, withTiming } from "@/lib/tjai/observability";
import { TJAI_PROMPT_VERSION } from "@/lib/tjai/prompts";
import { TJAI_SKILL_IDS } from "@/lib/tjai/registry/skills";
import type { TjaiRunTrace } from "@/lib/tjai/types/execution";
import { runEnhancedPlanCoherenceChecks } from "@/lib/tjai/validation/enhanced-plan-checks";
import { formatValidationIssuesForRepair, validateTjaiPlanSemantics } from "@/lib/tjai/validation/semantic-plan-checks";
import { validateTjaiPlan } from "@/lib/tjai-plan-validation";
import { buildTjaiMemorySnapshot, saveTjaiStructuredMemory } from "@/lib/tjai-plan-store";
import { callOpenAI, safeParseJSON } from "@/lib/tjai-openai";
import type { QuizAnswers, TJAIPlan, TJAIMetrics, TjaiUserProfile } from "@/lib/tjai-types";

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

  const readiness = buildReadinessProfile(input.profile);

  pushStage(trace, "context_built", {
    hasInsight: Boolean(learningInsight),
    readinessConfidence: readiness.confidence,
    readinessFlags: readiness.flags.map((flag) => flag.code)
  });
  pushStage(trace, "tools_run", { tools: ["memory_snapshot", "similar_user_insight", "readiness_profile"] });

  const { system: systemPrompt, user: userPrompt } = buildProgramDesignerMessages({
    profile: input.profile,
    metrics: input.metrics,
    memory,
    learningInsight,
    readiness
  });

  // Structured-output reliability (Cycle 009): attempt generation, and on a
  // parse OR structural-schema failure, retry ONCE with a correction hint
  // appended. Coherence (semantic) failures are not retried — those need a
  // graceful fail + refund, not a re-roll. Hard limit of 2 attempts so a
  // pathological model can't burn tokens or stall past the function budget.
  const REPAIR_INSTRUCTION =
    "\n\nIMPORTANT: Your previous response could not be parsed as a valid plan. " +
    "Return ONLY a single valid JSON object that matches the required plan schema exactly — " +
    "no markdown fences, no commentary, every required field populated.";

  let plan: unknown = null;
  let lastFailPhase: "json_parse" | "structural_validation" | "semantic_validation" | null = null;
  let lastSemanticCodes: string[] = [];
  // The retry's correction hint: generic for parse/shape failures, or specific
  // issue paths when semantic safety validation rejects the draft.
  let repairHint = REPAIR_INSTRUCTION;

  for (let attempt = 1; attempt <= 2; attempt++) {
    let rawText: string;
    try {
      rawText = await withTiming(trace, attempt === 1 ? "openai_plan_json" : "openai_plan_json_retry", () =>
        callOpenAI({
          system: systemPrompt,
          user: attempt === 1 ? userPrompt : userPrompt + "\n\n" + repairHint,
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
      // Generic message — never leak the upstream error text to the client.
      return { ok: false, status: 502, error: "AI generation failed. Please try again.", trace };
    }

    pushStage(trace, "draft_generated", { chars: rawText.length, attempt });

    let parsed: unknown;
    try {
      parsed = safeParseJSON(rawText);
    } catch (parseError) {
      lastFailPhase = "json_parse";
      repairHint = REPAIR_INSTRUCTION;
      appendTraceError(trace, parseError instanceof Error ? parseError.message : "JSON parse error");
      continue; // retry (or fall through to graceful fail after attempt 2)
    }

    if (!validateTjaiPlan(parsed)) {
      lastFailPhase = "structural_validation";
      repairHint = REPAIR_INSTRUCTION;
      appendTraceError(trace, `validateTjaiPlan failed (attempt ${attempt})`);
      continue;
    }

    // Always-on semantic safety: forbidden foods, drug/PED content, HTML/script,
    // impossible macros. A plan with these errors must never be saved.
    const semantic = validateTjaiPlanSemantics({ plan: parsed as TJAIPlan, profile: input.profile });
    lastSemanticCodes = semantic.issues.map((issue) => issue.code);
    if (!semantic.ok) {
      lastFailPhase = "semantic_validation";
      repairHint = formatValidationIssuesForRepair(semantic);
      pushStage(trace, "semantic_validation_failed", { attempt, codes: semantic.issues.map((issue) => issue.code) });
      appendTraceError(trace, `semantic validation failed (attempt ${attempt})`);
      if (attempt < 2) pushStage(trace, "repair_attempted", { reason: "semantic" });
      continue;
    }

    plan = parsed;
    lastFailPhase = null;
    break;
  }

  if (plan === null) {
    pushStage(trace, "failed", { phase: lastFailPhase ?? "structural_validation" });
    logPipelineTrace(input.userId, trace);
    recordTjaiEvent(input.adminClient, {
      event: lastFailPhase === "semantic_validation" ? "plan_validation_failed" : "plan_generation_failed",
      userId: input.userId,
      promptVersion: TJAI_PROMPT_VERSION,
      outcome: "failure",
      metadata: {
        phase: lastFailPhase ?? "structural_validation",
        goal: input.profile.goal,
        issue_codes: lastSemanticCodes.join(",")
      }
    });
    const error =
      lastFailPhase === "json_parse"
        ? "AI returned an invalid response. Please try again."
        : lastFailPhase === "semantic_validation"
          ? "Plan failed safety checks against your restrictions. Please try again."
          : "AI returned an incomplete plan. Please try again.";
    return { ok: false, status: 502, error, trace };
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
      readiness_json: readiness,
      prompt_version: TJAI_PROMPT_VERSION,
      validation_json: { ok: true, issue_codes: lastSemanticCodes },
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

  recordTjaiEvent(input.adminClient, {
    event: "plan_generated",
    userId: input.userId,
    planId: savedPlan?.id ?? null,
    promptVersion: TJAI_PROMPT_VERSION,
    outcome: "success",
    metadata: {
      goal: input.profile.goal,
      experience: input.profile.experienceLevel,
      readiness_confidence: readiness.confidence,
      injury_risk: readiness.injuryRisk,
      adherence_risk: readiness.adherenceRisk,
      training_days: input.profile.trainingDays,
      warn_codes: lastSemanticCodes.join(",")
    }
  });

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

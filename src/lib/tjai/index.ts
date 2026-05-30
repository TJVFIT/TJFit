export { runPlanGenerationPipeline } from "@/lib/tjai/orchestrator/plan-generation-pipeline";
export type { PlanGenerationPipelineInput, PlanGenerationPipelineResult, PlanGenerationSuccessBody } from "@/lib/tjai/orchestrator/plan-generation-pipeline";

export { TJAI_PROMPT_VERSION } from "@/lib/tjai/prompts";
export { TJAI_SKILL_IDS, TJAI_SKILL_REGISTRY } from "@/lib/tjai/registry/skills";
export type { TjaiSkillId, TjaiSkillMeta } from "@/lib/tjai/registry/skills";

export { isTjaiStrictPlanValidation, isTjaiDebugPipeline } from "@/lib/tjai/feature-flags";
export { createRunTrace, pushStage, logPipelineTrace, logChatCoachContextBuilt } from "@/lib/tjai/observability";
export type { TjaiRunTrace, ExecutionStage } from "@/lib/tjai/types/execution";

export { isLikelyFitnessQuestion, fallbackCoachReply, TJAI_CHAT_DOMAIN_GUARD } from "@/lib/tjai/guards/fitness-domain";
export {
  detectMedicalRisk,
  medicalSafetyResponse,
  MEDICAL_SAFETY_SYSTEM_ADDENDUM
} from "@/lib/tjai/guards/medical-safety";
export type { MedicalRisk, MedicalRiskCategory } from "@/lib/tjai/guards/medical-safety";

export { TJAI_PERSONAS, TJAI_PERSONA_META, isTjaiPersona, personaSystemFragment } from "@/lib/tjai/persona";
export type { TjaiPersona } from "@/lib/tjai/persona";

export { loadTjaiUserSettings, saveTjaiUserSettings } from "@/lib/tjai/user-settings";
export type { TjaiUserSettings } from "@/lib/tjai/user-settings";

export {
  loadLongMemoryFacts,
  formatMemoryBlock,
  extractFactsFromMessage,
  persistFacts
} from "@/lib/tjai/long-memory";
export type { LongMemoryRow, LongMemoryCategory } from "@/lib/tjai/long-memory";
export { buildChatCoachSystemPrompt } from "@/lib/tjai/context/chat-coach-context";
export type {
  ChatCoachPlanRow,
  ChatCoachWorkoutLog,
  ChatCoachProgressEntry,
  ChatCoachPreferenceRow
} from "@/lib/tjai/context/chat-coach-context";

export { runEnhancedPlanCoherenceChecks } from "@/lib/tjai/validation/enhanced-plan-checks";
export {
  validateTjaiPlanSemantics,
  buildTjaiFoodConstraints,
  mergeValidationResults,
  formatValidationIssuesForRepair
} from "@/lib/tjai/validation/semantic-plan-checks";
export type {
  TjaiValidationIssue,
  TjaiValidationResult,
  TjaiValidationSeverity,
  TjaiFoodConstraints
} from "@/lib/tjai/validation/semantic-plan-checks";

export { routeCoachChatIntent, coachChatIntentSystemAddendum } from "@/lib/tjai/orchestrator/chat-intent";
export type { CoachChatIntent } from "@/lib/tjai/orchestrator/chat-intent";

export { buildCoachState, formatCoachStateForPrompt } from "@/lib/tjai/coach-state";
export type { TjaiCoachState, CoachStateMode } from "@/lib/tjai/coach-state";

export { computeAdaptiveAdjustment, formatAdjustmentForPrompt } from "@/lib/tjai/adaptive-adjustment";
export type { AdaptiveAdjustment, AdaptiveCheckIn, AdaptiveIntensityAction } from "@/lib/tjai/adaptive-adjustment";

export { recordTjaiEvent, sanitizeEventMetadata, toEventRow } from "@/lib/tjai/events";
export type { TjaiEvent, TjaiEventName, TjaiEventScalar } from "@/lib/tjai/events";

export {
  PROVIDER_POLICY,
  TJAI_AI_TASKS,
  TJAI_PROVIDER_UNAVAILABLE,
  isOpenAIConfigured,
  isAnthropicConfigured,
  isProviderConfigured,
  isTaskAvailable,
  providerUnavailableBody
} from "@/lib/tjai/provider-policy";
export type { TjaiProvider, TjaiAiTask, TjaiProviderDecision, TjaiProviderFallback } from "@/lib/tjai/provider-policy";

export {
  toolBuildTjaiProfile,
  toolCalculateTjaiMetrics,
  toolTjaiMemorySnapshot,
  toolSimilarUserInsight
} from "@/lib/tjai/tools";
export type { ToolResult } from "@/lib/tjai/tools/types";

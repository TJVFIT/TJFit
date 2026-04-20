export { runPlanGenerationPipeline } from "@/lib/tjai/orchestrator/plan-generation-pipeline";
export type { PlanGenerationPipelineInput, PlanGenerationPipelineResult, PlanGenerationSuccessBody } from "@/lib/tjai/orchestrator/plan-generation-pipeline";

export { TJAI_PROMPT_VERSION } from "@/lib/tjai/prompts";
export { TJAI_SKILL_IDS, TJAI_SKILL_REGISTRY } from "@/lib/tjai/registry/skills";
export type { TjaiSkillId, TjaiSkillMeta } from "@/lib/tjai/registry/skills";

export { isTjaiStrictPlanValidation, isTjaiDebugPipeline } from "@/lib/tjai/feature-flags";
export { createRunTrace, pushStage, logPipelineTrace, logChatCoachContextBuilt } from "@/lib/tjai/observability";
export type { TjaiRunTrace, ExecutionStage } from "@/lib/tjai/types/execution";

export { isLikelyFitnessQuestion, fallbackCoachReply, TJAI_CHAT_DOMAIN_GUARD } from "@/lib/tjai/guards/fitness-domain";
export { buildChatCoachSystemPrompt } from "@/lib/tjai/context/chat-coach-context";
export type {
  ChatCoachPlanRow,
  ChatCoachWorkoutLog,
  ChatCoachProgressEntry,
  ChatCoachPreferenceRow
} from "@/lib/tjai/context/chat-coach-context";

export { runEnhancedPlanCoherenceChecks } from "@/lib/tjai/validation/enhanced-plan-checks";

export { routeCoachChatIntent, coachChatIntentSystemAddendum } from "@/lib/tjai/orchestrator/chat-intent";
export type { CoachChatIntent } from "@/lib/tjai/orchestrator/chat-intent";

export {
  toolBuildTjaiProfile,
  toolCalculateTjaiMetrics,
  toolTjaiMemorySnapshot,
  toolSimilarUserInsight
} from "@/lib/tjai/tools";
export type { ToolResult } from "@/lib/tjai/tools/types";

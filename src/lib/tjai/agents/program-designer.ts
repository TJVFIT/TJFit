import type { TjaiUserProfile } from "@/lib/tjai-intake";
import { buildTJAISystemPrompt, buildTJAIUserPrompt } from "@/lib/tjai/prompts";
import type { TjaiMemorySnapshot, TJAIMetrics } from "@/lib/tjai-types";

/**
 * Program Designer Agent — composes plan-generation prompts from profile, metrics, and memory.
 * Canonical copy lives in `@/lib/tjai-prompts`; this is the orchestration hook for future splits.
 */
export function buildProgramDesignerMessages(params: {
  profile: TjaiUserProfile;
  metrics: TJAIMetrics;
  memory: TjaiMemorySnapshot;
  learningInsight: string | null;
}): { system: string; user: string } {
  const system = buildTJAISystemPrompt();
  const user =
    buildTJAIUserPrompt(params.profile, params.metrics, params.memory) +
    (params.learningInsight ? `\n\n== LEARNING FROM SIMILAR USERS ==\n${params.learningInsight}` : "");
  return { system, user };
}

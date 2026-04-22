import { buildTJAISystemPrompt, buildTJAIUserPrompt } from "@/lib/tjai/prompts";
import { screenUserProfile } from "@/lib/tjai/safety/screening";
import type { TjaiMemorySnapshot, TJAIMetrics, TjaiUserProfile } from "@/lib/tjai-types";

/**
 * Program Designer Agent — composes plan-generation prompts from profile, metrics, memory,
 * and a pre-computed safety flag set (PAR-Q+ / SCOFF / RED-S) that hard-constrains the plan.
 * Canonical copy lives in `@/lib/tjai-prompts`; this is the orchestration hook for future splits.
 */
export function buildProgramDesignerMessages(params: {
  profile: TjaiUserProfile;
  metrics: TJAIMetrics;
  memory: TjaiMemorySnapshot;
  learningInsight: string | null;
}): { system: string; user: string } {
  const safetySet = screenUserProfile(params.profile);
  const system = buildTJAISystemPrompt();
  const user =
    buildTJAIUserPrompt(params.profile, params.metrics, params.memory, safetySet) +
    (params.learningInsight ? `\n\n== LEARNING FROM SIMILAR USERS ==\n${params.learningInsight}` : "");
  return { system, user };
}

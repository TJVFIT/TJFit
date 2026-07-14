/**
 * TJAI provider strategy (TJFITV.10X PR7 / doc PR4 — Option A: explicit dual-provider).
 *
 * TJAI intentionally runs two providers: OpenAI for the safety-critical paths
 * (paid plan generation, streaming chat) where the structured-output contract and
 * consistency matter most, and Anthropic for long-form/extraction helper features.
 * This module is the single source of truth for that routing so route code stops
 * drifting on ad-hoc provider/model strings, and it defines how each task degrades
 * when its provider key is absent — a missing optional key must never break core
 * chat or plan generation.
 *
 * 2026-07-14 (owner directive): an open-source gateway (llm-gateway.ts — Ollama /
 * vLLM / Groq / OpenRouter / any OpenAI-compatible server running open-weight
 * models) now outranks BOTH legacy providers for every task when configured.
 * Legacy keys remain a fallback so production never breaks during the switch.
 */

import { isOpenLLMConfigured } from "./llm-gateway";

export type TjaiProvider = "open" | "openai" | "anthropic" | "guard" | "none";

export type TjaiAiTask =
  | "plan_generate"
  | "chat_stream"
  | "chat_preference_extract"
  | "progress_evaluate"
  | "meal_swap"
  | "grocery_list"
  | "meal_prep"
  | "adaptive_suggestion"
  | "long_memory_extract"
  | "blog_generate"
  | "pro_renewal_email"
  | "eval_chat";

export type TjaiProviderFallback =
  | "generic_503" // shaped unavailable response, no raw provider detail
  | "static_fallback" // deterministic non-AI output
  | "fail_closed" // silently degrade (e.g. no facts extracted); core path continues
  | "disabled";

export type TjaiProviderDecision = {
  task: TjaiAiTask;
  provider: TjaiProvider;
  reason: string;
  fallback: TjaiProviderFallback;
};

/** Stable string constants to prevent route-specific task-name drift. */
export const TJAI_AI_TASKS = {
  PLAN_GENERATE: "plan_generate",
  CHAT_STREAM: "chat_stream",
  CHAT_PREFERENCE_EXTRACT: "chat_preference_extract",
  PROGRESS_EVALUATE: "progress_evaluate",
  MEAL_SWAP: "meal_swap",
  GROCERY_LIST: "grocery_list",
  MEAL_PREP: "meal_prep",
  ADAPTIVE_SUGGESTION: "adaptive_suggestion",
  LONG_MEMORY_EXTRACT: "long_memory_extract",
  BLOG_GENERATE: "blog_generate",
  PRO_RENEWAL_EMAIL: "pro_renewal_email",
  EVAL_CHAT: "eval_chat"
} as const satisfies Record<string, TjaiAiTask>;

export const PROVIDER_POLICY: Record<TjaiAiTask, TjaiProviderDecision> = {
  plan_generate: { task: "plan_generate", provider: "openai", reason: "JSON-mode plan contract + consistency", fallback: "generic_503" },
  chat_stream: { task: "chat_stream", provider: "openai", reason: "Streaming coach chat", fallback: "static_fallback" },
  chat_preference_extract: { task: "chat_preference_extract", provider: "openai", reason: "Cheap utility extraction (mini)", fallback: "fail_closed" },
  progress_evaluate: { task: "progress_evaluate", provider: "openai", reason: "Progress analysis", fallback: "generic_503" },
  meal_swap: { task: "meal_swap", provider: "anthropic", reason: "Long-form meal rewrite", fallback: "generic_503" },
  grocery_list: { task: "grocery_list", provider: "anthropic", reason: "Structured list generation", fallback: "generic_503" },
  meal_prep: { task: "meal_prep", provider: "anthropic", reason: "Timeline generation", fallback: "generic_503" },
  adaptive_suggestion: { task: "adaptive_suggestion", provider: "anthropic", reason: "Coaching suggestion synthesis", fallback: "fail_closed" },
  long_memory_extract: { task: "long_memory_extract", provider: "anthropic", reason: "Fact extraction from chat", fallback: "fail_closed" },
  blog_generate: { task: "blog_generate", provider: "anthropic", reason: "Admin-only long-form content", fallback: "generic_503" },
  pro_renewal_email: { task: "pro_renewal_email", provider: "anthropic", reason: "Renewal email copy", fallback: "static_fallback" },
  eval_chat: { task: "eval_chat", provider: "openai", reason: "Eval harness mirrors chat", fallback: "disabled" }
};

/** Shaped error code surfaced to clients when a provider key is missing. */
export const TJAI_PROVIDER_UNAVAILABLE = "TJAI_PROVIDER_UNAVAILABLE";

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function isProviderConfigured(provider: TjaiProvider): boolean {
  if (provider === "open") return isOpenLLMConfigured();
  if (provider === "openai") return isOpenAIConfigured();
  if (provider === "anthropic") return isAnthropicConfigured();
  return true;
}

/**
 * The provider that will actually serve a task right now: the open-source
 * gateway when configured, else the task's legacy policy provider, else the
 * other legacy provider as a last resort (any configured LLM beats a 503).
 */
export function resolveTaskProvider(task: TjaiAiTask): TjaiProvider {
  if (isOpenLLMConfigured()) return "open";
  const legacy = PROVIDER_POLICY[task].provider;
  if (isProviderConfigured(legacy)) return legacy;
  // Streaming is only implemented for open + openai; Anthropic can't rescue chat.
  const streamingTask = task === "chat_stream" || task === "eval_chat";
  if (legacy === "openai" && !streamingTask && isAnthropicConfigured()) return "anthropic";
  if (legacy === "anthropic" && isOpenAIConfigured()) return "openai";
  return "none";
}

/** Whether a task can run given current env, per the routing policy. */
export function isTaskAvailable(task: TjaiAiTask): boolean {
  return resolveTaskProvider(task) !== "none";
}

/** Standard JSON body for a shaped 503 when a task's provider is unavailable. */
export function providerUnavailableBody(): { error: string; code: string } {
  return {
    error: "This AI feature is temporarily unavailable. Please try again later.",
    code: TJAI_PROVIDER_UNAVAILABLE
  };
}

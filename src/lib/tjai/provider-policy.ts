/**
 * TJAI release policy: approved free Groq inference only.
 * Plan generation and chat require the provider and retention gates. Legacy
 * paid-provider keys never activate a fallback; optional AI tasks remain closed.
 * Deterministic saved-plan and progress features do not require an AI provider.
 */

import { isFreeGroqConfigured } from "./free-provider";

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
  plan_generate: { task: "plan_generate", provider: "open", reason: "JSON-mode plan contract + consistency", fallback: "generic_503" },
  chat_stream: { task: "chat_stream", provider: "open", reason: "Streaming coach chat", fallback: "static_fallback" },
  chat_preference_extract: { task: "chat_preference_extract", provider: "none", reason: "Cheap utility extraction (mini)", fallback: "fail_closed" },
  progress_evaluate: { task: "progress_evaluate", provider: "none", reason: "Progress analysis", fallback: "generic_503" },
  meal_swap: { task: "meal_swap", provider: "none", reason: "Long-form meal rewrite", fallback: "generic_503" },
  grocery_list: { task: "grocery_list", provider: "none", reason: "Structured list generation", fallback: "generic_503" },
  meal_prep: { task: "meal_prep", provider: "none", reason: "Timeline generation", fallback: "generic_503" },
  adaptive_suggestion: { task: "adaptive_suggestion", provider: "none", reason: "Coaching suggestion synthesis", fallback: "fail_closed" },
  long_memory_extract: { task: "long_memory_extract", provider: "none", reason: "Fact extraction from chat", fallback: "fail_closed" },
  blog_generate: { task: "blog_generate", provider: "none", reason: "Admin-only long-form content", fallback: "generic_503" },
  pro_renewal_email: { task: "pro_renewal_email", provider: "none", reason: "Renewal email copy", fallback: "static_fallback" },
  eval_chat: { task: "eval_chat", provider: "none", reason: "Eval harness mirrors chat", fallback: "disabled" }
};

/** Shaped error code surfaced to clients when a provider key is missing. */
export const TJAI_PROVIDER_UNAVAILABLE = "TJAI_PROVIDER_UNAVAILABLE";

export function isOpenAIConfigured(): boolean { return false; }
export function isAnthropicConfigured(): boolean { return false; }
export function isProviderConfigured(provider: TjaiProvider): boolean { return provider === "open" && isFreeGroqConfigured(); }
export function resolveTaskProvider(task: TjaiAiTask): TjaiProvider {
  return (task === "plan_generate" || task === "chat_stream") && isFreeGroqConfigured() ? "open" : "none";
}
export function isTaskAvailable(task: TjaiAiTask): boolean { return resolveTaskProvider(task) !== "none"; }

/** Standard JSON body for a shaped 503 when a task's provider is unavailable. */
export function providerUnavailableBody(): { error: string; code: string } {
  return {
    error: "This AI feature is temporarily unavailable. Please try again later.",
    code: TJAI_PROVIDER_UNAVAILABLE
  };
}

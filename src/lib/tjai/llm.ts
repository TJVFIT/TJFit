import { callClaude, type ClaudeTask } from "@/lib/tjai-anthropic";
import { callOpenAI, streamOpenAI, type OpenAIUsageSnapshot } from "@/lib/tjai-openai";

import { callOpenLLM, streamOpenLLM, type OpenLLMKind } from "./llm-gateway";
import { PROVIDER_POLICY, resolveTaskProvider, type TjaiAiTask } from "./provider-policy";

/**
 * Unified LLM dispatch for every TJAI task. Call sites say WHAT they need
 * (task + prompt); this module decides WHO serves it: the open-source gateway
 * when configured (owner directive — no OpenAI dependency), otherwise the
 * task's legacy provider per provider-policy.ts. Availability checks stay in
 * provider-policy (isTaskAvailable); this module assumes the task is servable
 * and throws if nothing is configured.
 */

/** Model-capability tier each task needs on the open gateway. */
const TASK_KIND: Record<TjaiAiTask, OpenLLMKind> = {
  plan_generate: "json",
  chat_stream: "chat",
  chat_preference_extract: "mini",
  progress_evaluate: "json",
  meal_swap: "longform",
  grocery_list: "longform",
  meal_prep: "longform",
  adaptive_suggestion: "longform",
  long_memory_extract: "mini",
  blog_generate: "longform",
  pro_renewal_email: "longform",
  eval_chat: "chat"
};

/** Anthropic task label per TJAI task (drives Claude model tier + call logs). */
const CLAUDE_TASK: Record<TjaiAiTask, ClaudeTask> = {
  plan_generate: "plan",
  chat_stream: "chat",
  chat_preference_extract: "extract",
  progress_evaluate: "classify",
  meal_swap: "swap",
  grocery_list: "extract",
  meal_prep: "extract",
  // suggestions.ts historically ran this on the opus tier ("plan") — keep it.
  adaptive_suggestion: "plan",
  long_memory_extract: "extract",
  blog_generate: "blog",
  pro_renewal_email: "creative",
  eval_chat: "chat"
};

export async function llmCall({
  task,
  system,
  user,
  maxTokens,
  jsonMode = false,
  route = "unknown",
  userId,
  openaiModel,
  onUsage
}: {
  task: TjaiAiTask;
  system: string;
  user: string;
  maxTokens?: number;
  jsonMode?: boolean;
  route?: string;
  userId?: string | null;
  /** Legacy OpenAI model override (e.g. "gpt-4o-mini") — ignored on the open gateway. */
  openaiModel?: string;
  onUsage?: (usage: OpenAIUsageSnapshot) => void;
}): Promise<string> {
  const provider = resolveTaskProvider(task);

  if (provider === "open") {
    return callOpenLLM({
      system,
      user,
      maxTokens,
      jsonMode,
      kind: TASK_KIND[task],
      route,
      task,
      userId
    });
  }

  if (provider === "openai") {
    return callOpenAI({ system, user, maxTokens, jsonMode, model: openaiModel, onUsage });
  }

  if (provider === "anthropic") {
    return callClaude({
      system,
      user,
      maxTokens,
      task: CLAUDE_TASK[task],
      route,
      userId
    });
  }

  throw new Error(`No LLM provider configured for TJAI task "${task}" (policy: ${PROVIDER_POLICY[task].provider}).`);
}

/**
 * Streaming dispatch (OpenAI SSE wire format from either backend, so the
 * chat route's delta parser works unchanged).
 */
export async function llmStream({
  task,
  system,
  user,
  messages,
  maxTokens
}: {
  task: TjaiAiTask;
  system: string;
  user?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const provider = resolveTaskProvider(task);

  if (provider === "open") {
    return streamOpenLLM({ system, user, messages, maxTokens, kind: TASK_KIND[task] });
  }

  if (provider === "openai") {
    return streamOpenAI({ system, user, messages, maxTokens });
  }

  throw new Error(`No streaming LLM provider configured for TJAI task "${task}".`);
}

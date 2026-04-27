/**
 * OpenAI wrapper for TJAI generation + streaming chat.
 *
 * Drop-in equivalent to the legacy `callClaude()` API: same
 * { task, route, userId, system, user, maxTokens } shape so generators
 * can be swapped without touching call sites. Logs every call to
 * `tjai_ai_call_logs` with provider="openai".
 */

import { getSupabaseServerClient } from "@/lib/supabase-server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MAX_RETRIES = 2;

export type OpenAITask = "chat" | "extract" | "classify" | "swap" | "plan" | "creative" | "blog";

// Model selection per task, mirrors the Anthropic routing.
// "Heavy" tasks → gpt-4o. "Light" tasks → gpt-4o-mini.
const MODELS = {
  full: process.env.OPENAI_MODEL_FULL ?? "gpt-4o",
  mini: process.env.OPENAI_MODEL_MINI ?? "gpt-4o-mini"
} as const;

function modelForTask(task: OpenAITask): string {
  switch (task) {
    case "plan":
    case "creative":
    case "blog":
      return MODELS.full;
    case "chat":
    case "extract":
    case "classify":
    case "swap":
    default:
      return MODELS.mini;
  }
}

// Per-million-token USD list prices. OpenAI publishes these on their
// pricing page; verify before billing changes.
const MODEL_PRICING: Record<string, { input: number; output: number; cacheRead: number }> = {
  "gpt-4o": { input: 2.5, output: 10, cacheRead: 1.25 },
  "gpt-4o-2024-08-06": { input: 2.5, output: 10, cacheRead: 1.25 },
  "gpt-4o-mini": { input: 0.15, output: 0.6, cacheRead: 0.075 },
  "gpt-4o-mini-2024-07-18": { input: 0.15, output: 0.6, cacheRead: 0.075 }
};

type OpenAIUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number };
};

function pricingFor(model: string): { input: number; output: number; cacheRead: number } {
  if (MODEL_PRICING[model]) return MODEL_PRICING[model];
  if (model.includes("mini")) return MODEL_PRICING["gpt-4o-mini"];
  return MODEL_PRICING["gpt-4o"];
}

function computeCostUsd(model: string, usage: OpenAIUsage): number {
  const price = pricingFor(model);
  const cacheRead = usage.prompt_tokens_details?.cached_tokens ?? 0;
  const fullInput = Math.max(0, (usage.prompt_tokens ?? 0) - cacheRead);
  const output = usage.completion_tokens ?? 0;
  return (fullInput * price.input + cacheRead * price.cacheRead + output * price.output) / 1_000_000;
}

async function logCall(row: {
  user_id?: string | null;
  route: string;
  task: OpenAITask;
  model: string;
  usage: OpenAIUsage;
  latency_ms: number;
  ok: boolean;
  error?: string;
}): Promise<void> {
  try {
    const admin = getSupabaseServerClient();
    if (!admin) return;
    const cacheRead = row.usage.prompt_tokens_details?.cached_tokens ?? 0;
    await admin.from("tjai_ai_call_logs").insert({
      user_id: row.user_id ?? null,
      route: row.route,
      task: row.task,
      provider: "openai",
      model: row.model,
      input_tokens: Math.max(0, (row.usage.prompt_tokens ?? 0) - cacheRead),
      output_tokens: row.usage.completion_tokens ?? 0,
      cache_creation_tokens: 0, // OpenAI doesn't bill cache writes separately
      cache_read_tokens: cacheRead,
      latency_ms: row.latency_ms,
      cost_usd: Number(computeCostUsd(row.model, row.usage).toFixed(6)),
      ok: row.ok,
      error: row.error ?? null
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[tjai-openai] failed to log call", err);
    }
  }
}

export type OpenAIUsageSnapshot = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

/**
 * Drop-in equivalent of the Anthropic `callClaude()` signature.
 * Backwards-compatible with the original `callOpenAI({ system, user })`
 * call sites — extra fields are optional.
 */
export async function callOpenAI({
  system,
  user,
  maxTokens = 4000,
  jsonMode = false,
  task = "chat",
  route = "unknown",
  userId,
  onUsage
}: {
  system: string;
  user: string;
  maxTokens?: number;
  jsonMode?: boolean;
  task?: OpenAITask;
  route?: string;
  userId?: string | null;
  /** Legacy compat hook from the previous OpenAI wrapper. */
  onUsage?: (usage: OpenAIUsageSnapshot) => void;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  // jsonMode forces a model that supports response_format=json_object.
  // gpt-4o + gpt-4o-mini both support it, so model selection is
  // independent. We just include the response_format flag.
  const model = modelForTask(task);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const t0 = Date.now();
    try {
      const body: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        temperature: jsonMode ? 0.3 : 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      };
      if (jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        const err = `OpenAI API error ${response.status}: ${errorText.slice(0, 500)}`;
        void logCall({
          user_id: userId,
          route,
          task,
          model,
          usage: {},
          latency_ms: Date.now() - t0,
          ok: false,
          error: err
        });
        throw new Error(err);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: OpenAIUsage;
      };
      const text = (data?.choices?.[0]?.message?.content ?? "") as string;
      if (!text) throw new Error("OpenAI returned an empty response.");

      const u = data?.usage ?? {};
      void logCall({
        user_id: userId,
        route,
        task,
        model,
        usage: u,
        latency_ms: Date.now() - t0,
        ok: true
      });

      if (onUsage) {
        onUsage({
          promptTokens: u.prompt_tokens ?? 0,
          completionTokens: u.completion_tokens ?? 0,
          totalTokens: u.total_tokens ?? (u.prompt_tokens ?? 0) + (u.completion_tokens ?? 0)
        });
      }

      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt <= MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }

  throw lastError ?? new Error("All AI generation attempts failed.");
}

/**
 * Returns a raw ReadableStream of SSE data from OpenAI.
 * Caller is responsible for piping/transforming.
 */
export async function streamOpenAI({
  system,
  user,
  messages,
  maxTokens = 1000
}: {
  system: string;
  user?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const body = {
    model: MODELS.full,
    max_tokens: maxTokens,
    temperature: 0.7,
    stream: true,
    messages: [
      { role: "system" as const, content: system },
      ...(messages ?? []),
      ...(user ? [{ role: "user" as const, content: user }] : [])
    ]
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI stream error ${response.status}: ${err.slice(0, 300)}`);
  }

  if (!response.body) throw new Error("No response body from OpenAI stream.");
  return response.body;
}

/**
 * Parse JSON safely — works with json_object mode (already valid JSON)
 * or as a fallback extractor for free-form responses.
 */
export function safeParseJSON<T = unknown>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        let depth = 0;
        let start = -1;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === "{") {
            if (start === -1) start = i;
            depth++;
          } else if (text[i] === "}") {
            depth--;
            if (depth === 0 && start !== -1) {
              try {
                return JSON.parse(text.slice(start, i + 1)) as T;
              } catch {
                // continue
              }
            }
          }
        }
      }
    }
    throw new Error(`Could not parse AI response as JSON. Response was: ${text.slice(0, 300)}`);
  }
}

/** Legacy alias used by some older code — keep extracting JSON from prose. */
export function extractJsonBlock(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

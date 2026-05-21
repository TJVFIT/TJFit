import { getSupabaseServerClient } from "@/lib/supabase-server";

// Anthropic API model IDs.
//
// Pinned to the current Claude 4.x family (May 2026). IDs from 4.6 onward
// are dateless but still pinned snapshots, not evergreen pointers — when a
// new release lands, override via env without code changes:
//   ANTHROPIC_MODEL_OPUS=claude-opus-4-...
//   ANTHROPIC_MODEL_SONNET=claude-sonnet-4-...
//   ANTHROPIC_MODEL_HAIKU=claude-haiku-4-...
export const CLAUDE_MODELS = {
  opus: process.env.ANTHROPIC_MODEL_OPUS ?? "claude-opus-4-7",
  sonnet: process.env.ANTHROPIC_MODEL_SONNET ?? "claude-sonnet-4-6",
  haiku: process.env.ANTHROPIC_MODEL_HAIKU ?? "claude-haiku-4-5"
} as const;

// Pricing keyed by model FAMILY rather than full ID, so dated/aliased model
// strings still match. Per-million-token USD list prices.
// Cache ratios (write = 1.25× input, read = 0.1× input) are Anthropic-wide.
// Opus prices dropped from $15/$75 (Opus 3) to $5/$25 with the 4.x family.
const FAMILY_PRICING: Record<"opus" | "sonnet" | "haiku", { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  opus: { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  sonnet: { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  haiku: { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 }
};

const ANTHROPIC_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;

function isRetryableStatus(status: number): boolean {
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

function modelFamily(model: string): "opus" | "sonnet" | "haiku" {
  if (model.includes("opus")) return "opus";
  if (model.includes("sonnet")) return "sonnet";
  return "haiku";
}

export type ClaudeTask = "chat" | "extract" | "classify" | "swap" | "plan" | "creative" | "blog";

// Route each task to the cheapest model that can do it well.
// Plans / blog / creative writing → Opus. Everything else → Haiku.
function modelForTask(task: ClaudeTask): string {
  switch (task) {
    case "plan":
    case "creative":
    case "blog":
      return CLAUDE_MODELS.opus;
    case "chat":
    case "extract":
    case "classify":
    case "swap":
    default:
      return CLAUDE_MODELS.haiku;
  }
}

type AnthropicUsage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
};

function computeCostUsd(model: string, usage: AnthropicUsage): number {
  const price = FAMILY_PRICING[modelFamily(model)];
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  return (
    (input * price.input + output * price.output + cacheWrite * price.cacheWrite + cacheRead * price.cacheRead) /
    1_000_000
  );
}

async function logCall(row: {
  user_id?: string | null;
  route: string;
  task: ClaudeTask;
  model: string;
  usage: AnthropicUsage;
  latency_ms: number;
  ok: boolean;
  error?: string;
}): Promise<void> {
  try {
    const admin = getSupabaseServerClient();
    if (!admin) return;
    await admin.from("tjai_ai_call_logs").insert({
      user_id: row.user_id ?? null,
      route: row.route,
      task: row.task,
      provider: "anthropic",
      model: row.model,
      input_tokens: row.usage.input_tokens ?? 0,
      output_tokens: row.usage.output_tokens ?? 0,
      cache_creation_tokens: row.usage.cache_creation_input_tokens ?? 0,
      cache_read_tokens: row.usage.cache_read_input_tokens ?? 0,
      latency_ms: row.latency_ms,
      cost_usd: Number(computeCostUsd(row.model, row.usage).toFixed(6)),
      ok: row.ok,
      error: row.error ?? null
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[tjai] failed to log AI call", err);
    }
  }
}

export async function callClaude({
  system,
  user,
  maxTokens = 2000,
  task = "chat",
  cacheSystem = true,
  route = "unknown",
  userId
}: {
  system: string;
  user: string;
  maxTokens?: number;
  task?: ClaudeTask;
  cacheSystem?: boolean;
  route?: string;
  userId?: string | null;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing");

  const model = modelForTask(task);
  const t0 = Date.now();

  // System prompt with cache_control breakpoint so repeated calls with the
  // same system text only pay the cheap cache-read price after the first hit.
  const systemBlocks = cacheSystem
    ? [{ type: "text", text: system, cache_control: { type: "ephemeral" } }]
    : [{ type: "text", text: system }];

  let lastErr: Error | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), ANTHROPIC_TIMEOUT_MS);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: systemBlocks,
          messages: [{ role: "user", content: user }]
        }),
        signal: ctrl.signal
      });

      if (!response.ok) {
        const raw = await response.text();
        const errMsg = `Claude error ${response.status}: ${raw.slice(0, 400)}`;
        if (isRetryableStatus(response.status) && attempt <= MAX_RETRIES) {
          lastErr = new Error(errMsg);
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }
        void logCall({
          user_id: userId,
          route,
          task,
          model,
          usage: {},
          latency_ms: Date.now() - t0,
          ok: false,
          error: errMsg
        });
        throw new Error(errMsg);
      }

      const data = (await response.json()) as { content?: Array<{ text?: string }>; usage?: AnthropicUsage };
      const text = data?.content?.[0]?.text ?? "";

      void logCall({
        user_id: userId,
        route,
        task,
        model,
        usage: data?.usage ?? {},
        latency_ms: Date.now() - t0,
        ok: true
      });

      return text;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      // Re-throw fatal non-retryable errors (already-logged Claude HTTP errors).
      if (lastErr.message.startsWith("Claude error ")) throw lastErr;
      // Retry on AbortError (timeout) and network errors.
      if (attempt <= MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
        continue;
      }
      void logCall({
        user_id: userId,
        route,
        task,
        model,
        usage: {},
        latency_ms: Date.now() - t0,
        ok: false,
        error: lastErr.message
      });
      throw lastErr;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  // Unreachable — loop above either returns or throws.
  throw lastErr ?? new Error("Claude call failed");
}

export function extractJsonBlock(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

import { getSupabaseServerClient } from "@/lib/supabase-server";

// Latest Claude 4.x family — see env doc.
export const CLAUDE_MODELS = {
  opus: "claude-opus-4-7",
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5-20251001"
} as const;

// Per-million-token USD list prices. Update when Anthropic publishes new rates.
const MODEL_PRICING: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  "claude-opus-4-7": { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
  "claude-sonnet-4-6": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 }
};

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
  const price = MODEL_PRICING[model];
  if (!price) return 0;
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
      })
    });

    if (!response.ok) {
      const raw = await response.text();
      const err = `Claude error: ${raw.slice(0, 400)}`;
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
    if (err instanceof Error && err.message.startsWith("Claude error:")) throw err;
    void logCall({
      user_id: userId,
      route,
      task,
      model,
      usage: {},
      latency_ms: Date.now() - t0,
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    });
    throw err;
  }
}

export function extractJsonBlock(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

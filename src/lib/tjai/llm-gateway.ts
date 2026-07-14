import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Open-source LLM gateway (owner directive 2026-07-14: move TJAI off OpenAI).
 *
 * Talks to any OpenAI-compatible inference server — Ollama, vLLM, llama.cpp,
 * LM Studio, Groq, OpenRouter, Together — so every TJAI task can run on
 * open-weight models (Llama, Qwen, DeepSeek, Mistral). Configuration:
 *
 *   TJAI_LLM_PRESET=ollama|lmstudio|groq|openrouter|together|vllm
 *   TJAI_LLM_BASE_URL=...      overrides the preset base URL (required for vllm)
 *   TJAI_LLM_API_KEY=...       omit for local Ollama / LM Studio
 *   TJAI_LLM_MODEL=...         default model for every task kind
 *   TJAI_LLM_MODEL_CHAT / _JSON / _MINI / _LONGFORM   per-kind overrides
 *
 * When configured this gateway takes priority over the legacy OpenAI/Anthropic
 * clients (see provider-policy.ts); when absent, every task degrades exactly
 * as before. The wire protocol is OpenAI chat-completions, including SSE
 * streaming, which all supported servers emit natively.
 */

export type OpenLLMKind = "chat" | "json" | "mini" | "longform";

type PresetName = "ollama" | "lmstudio" | "groq" | "openrouter" | "together" | "vllm";

type Preset = {
  baseUrl: string | null;
  models: Partial<Record<OpenLLMKind, string>>;
};

const PRESETS: Record<PresetName, Preset> = {
  ollama: {
    baseUrl: "http://127.0.0.1:11434/v1",
    models: { chat: "llama3.1", json: "llama3.1", mini: "llama3.1", longform: "llama3.1" }
  },
  lmstudio: {
    baseUrl: "http://127.0.0.1:1234/v1",
    models: {}
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    models: {
      chat: "llama-3.3-70b-versatile",
      json: "llama-3.3-70b-versatile",
      mini: "llama-3.1-8b-instant",
      longform: "llama-3.3-70b-versatile"
    }
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    models: {
      chat: "meta-llama/llama-3.3-70b-instruct",
      json: "meta-llama/llama-3.3-70b-instruct",
      mini: "meta-llama/llama-3.1-8b-instruct",
      longform: "meta-llama/llama-3.3-70b-instruct"
    }
  },
  together: {
    baseUrl: "https://api.together.xyz/v1",
    models: {
      chat: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      json: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      mini: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      longform: "meta-llama/Llama-3.3-70B-Instruct-Turbo"
    }
  },
  vllm: { baseUrl: null, models: {} }
};

export type OpenLLMConfig = {
  baseUrl: string;
  apiKey: string | null;
  models: Record<OpenLLMKind, string>;
  presetName: string;
};

/** Resolve gateway config from env; null when the gateway is not configured. */
export function resolveOpenLLMConfig(): OpenLLMConfig | null {
  const presetName = (process.env.TJAI_LLM_PRESET ?? "").trim().toLowerCase();
  const preset: Preset | null = presetName in PRESETS ? PRESETS[presetName as PresetName] : null;

  const baseUrl = (process.env.TJAI_LLM_BASE_URL ?? preset?.baseUrl ?? "").trim().replace(/\/+$/, "");
  if (!baseUrl) return null;

  const defaultModel = (process.env.TJAI_LLM_MODEL ?? "").trim();
  const kindModel = (kind: OpenLLMKind, envKey: string): string =>
    (process.env[envKey] ?? "").trim() || defaultModel || preset?.models[kind] || "";

  const models: Record<OpenLLMKind, string> = {
    chat: kindModel("chat", "TJAI_LLM_MODEL_CHAT"),
    json: kindModel("json", "TJAI_LLM_MODEL_JSON"),
    mini: kindModel("mini", "TJAI_LLM_MODEL_MINI"),
    longform: kindModel("longform", "TJAI_LLM_MODEL_LONGFORM")
  };
  if (!models.chat || !models.json || !models.mini || !models.longform) return null;

  return {
    baseUrl,
    apiKey: (process.env.TJAI_LLM_API_KEY ?? "").trim() || null,
    models,
    presetName: presetName || "custom"
  };
}

export function isOpenLLMConfigured(): boolean {
  return resolveOpenLLMConfig() !== null;
}

const OPEN_LLM_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;

function isRetryableStatus(status: number): boolean {
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

function requestHeaders(config: OpenLLMConfig): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
  return headers;
}

type OpenLLMUsage = { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };

async function logCall(row: {
  user_id?: string | null;
  route: string;
  task: string;
  model: string;
  preset: string;
  usage: OpenLLMUsage;
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
      provider: `open:${row.preset}`,
      model: row.model,
      input_tokens: row.usage.prompt_tokens ?? 0,
      output_tokens: row.usage.completion_tokens ?? 0,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      latency_ms: row.latency_ms,
      cost_usd: 0,
      ok: row.ok,
      error: row.error ?? null
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[tjai] failed to log open-LLM call", err);
    }
  }
}

class OpenLLMNonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenLLMNonRetryableError";
  }
}

export async function callOpenLLM({
  system,
  user,
  messages,
  maxTokens = 2000,
  jsonMode = false,
  kind = "chat",
  route = "unknown",
  task = "unknown",
  userId
}: {
  system: string;
  user?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  jsonMode?: boolean;
  kind?: OpenLLMKind;
  route?: string;
  task?: string;
  userId?: string | null;
}): Promise<string> {
  const config = resolveOpenLLMConfig();
  if (!config) throw new Error("Open LLM gateway is not configured (set TJAI_LLM_PRESET or TJAI_LLM_BASE_URL).");

  const model = config.models[kind];
  const t0 = Date.now();
  // Some OpenAI-compatible servers reject response_format — on a 400 that
  // mentions it, retry once relying on prompt-side JSON instructions instead.
  let useResponseFormat = jsonMode;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), OPEN_LLM_TIMEOUT_MS);
    try {
      const body: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        temperature: jsonMode ? 0.3 : 0.7,
        messages: [
          { role: "system", content: system },
          ...(messages ?? []),
          ...(user ? [{ role: "user", content: user }] : [])
        ]
      };
      if (useResponseFormat) body.response_format = { type: "json_object" };

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: requestHeaders(config),
        body: JSON.stringify(body),
        signal: ctrl.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        const msg = `Open LLM error ${response.status}: ${errorText.slice(0, 500)}`;
        if (response.status === 400 && useResponseFormat && /response_format/i.test(errorText)) {
          useResponseFormat = false;
          lastError = new Error(msg);
          continue;
        }
        if (!isRetryableStatus(response.status)) throw new OpenLLMNonRetryableError(msg);
        throw new Error(msg);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: OpenLLMUsage;
      };
      const text = data?.choices?.[0]?.message?.content ?? "";
      if (!text) throw new Error("Open LLM returned an empty response.");

      void logCall({
        user_id: userId,
        route,
        task,
        model,
        preset: config.presetName,
        usage: data?.usage ?? {},
        latency_ms: Date.now() - t0,
        ok: true
      });

      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError instanceof OpenLLMNonRetryableError) {
        void logCall({
          user_id: userId,
          route,
          task,
          model,
          preset: config.presetName,
          usage: {},
          latency_ms: Date.now() - t0,
          ok: false,
          error: lastError.message
        });
        throw lastError;
      }
      if (attempt <= MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
        continue;
      }
      void logCall({
        user_id: userId,
        route,
        task,
        model,
        preset: config.presetName,
        usage: {},
        latency_ms: Date.now() - t0,
        ok: false,
        error: lastError.message
      });
      throw lastError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error("All open LLM attempts failed.");
}

/**
 * Raw OpenAI-format SSE stream from the open LLM server. Same wire shape as
 * streamOpenAI, so the chat route's delta parser works unchanged.
 */
export async function streamOpenLLM({
  system,
  user,
  messages,
  maxTokens = 1000,
  kind = "chat"
}: {
  system: string;
  user?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  kind?: OpenLLMKind;
}): Promise<ReadableStream<Uint8Array>> {
  const config = resolveOpenLLMConfig();
  if (!config) throw new Error("Open LLM gateway is not configured.");

  const body = {
    model: config.models[kind],
    max_tokens: maxTokens,
    temperature: 0.7,
    stream: true,
    messages: [
      { role: "system" as const, content: system },
      ...(messages ?? []),
      ...(user ? [{ role: "user" as const, content: user }] : [])
    ]
  };

  // Timeout guards only the handshake; once streaming starts the route's
  // maxDuration bounds total time.
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), OPEN_LLM_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: requestHeaders(config),
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Open LLM stream error ${response.status}: ${err.slice(0, 300)}`);
  }
  if (!response.body) throw new Error("No response body from open LLM stream.");
  return response.body;
}

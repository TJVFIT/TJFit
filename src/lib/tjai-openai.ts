/**
 * OpenAI GPT-4o wrapper for TJAI plan generation and streaming chat.
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL_JSON = "gpt-4o-2024-08-06"; // structured outputs / json_object
const MODEL_CHAT = "gpt-4o";            // chat / streaming
const MAX_RETRIES = 2;
const OPENAI_TIMEOUT_MS = 30_000;

export type OpenAIUsageSnapshot = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

/** Thrown for HTTP 4xx (except 408/429) — caller should not retry these. */
class OpenAINonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAINonRetryableError";
  }
}

function isRetryableStatus(status: number): boolean {
  // Retry on 5xx, 408 (timeout), 429 (rate limit). 4xx otherwise is a client
  // error (bad request, auth, content policy) and retrying just wastes calls.
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

export async function callOpenAI({
  system,
  user,
  maxTokens = 16000,
  jsonMode = false,
  model,
  onUsage
}: {
  system: string;
  user: string;
  maxTokens?: number;
  jsonMode?: boolean;
  /** Override the default model (e.g. "gpt-4o-mini" for cheap JSON extractions). */
  model?: string;
  /** Optional hook for observability (plan generation, small JSON extractions, etc.). */
  onUsage?: (usage: OpenAIUsageSnapshot) => void;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Add it to your environment variables.");

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), OPENAI_TIMEOUT_MS);
    try {
      const body: Record<string, unknown> = {
        model: model ?? (jsonMode ? MODEL_JSON : MODEL_CHAT),
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
        body: JSON.stringify(body),
        signal: ctrl.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        const msg = `OpenAI API error ${response.status}: ${errorText.slice(0, 500)}`;
        if (!isRetryableStatus(response.status)) {
          throw new OpenAINonRetryableError(msg);
        }
        throw new Error(msg);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      };
      const text = (data?.choices?.[0]?.message?.content ?? "") as string;

      if (!text) throw new Error("OpenAI returned an empty response.");

      const u = data?.usage;
      if (onUsage && u && typeof u.prompt_tokens === "number" && typeof u.completion_tokens === "number") {
        onUsage({
          promptTokens: u.prompt_tokens,
          completionTokens: u.completion_tokens,
          totalTokens: typeof u.total_tokens === "number" ? u.total_tokens : u.prompt_tokens + u.completion_tokens
        });
      }

      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Don't retry 4xx (auth, content policy, bad request) — just wastes calls.
      if (lastError instanceof OpenAINonRetryableError) {
        console.error("TJAI OpenAI non-retryable:", lastError.message);
        throw lastError;
      }
      console.error(`TJAI OpenAI attempt ${attempt} failed:`, lastError.message);
      if (attempt <= MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    } finally {
      clearTimeout(timeoutId);
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
    model: MODEL_CHAT,
    max_tokens: maxTokens,
    temperature: 0.7,
    stream: true,
    messages: [
      { role: "system" as const, content: system },
      ...(messages ?? []),
      ...(user ? [{ role: "user" as const, content: user }] : [])
    ]
  };

  // Timeout only guards the initial fetch/headers handshake — once OpenAI
  // starts streaming we let it run to completion (the route's maxDuration
  // is the upper bound on total time).
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), OPENAI_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }

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
                // continue searching
              }
            }
          }
        }
      }
    }
    throw new Error(`Could not parse AI response as JSON. Response was: ${text.slice(0, 300)}`);
  }
}

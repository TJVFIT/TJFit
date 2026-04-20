/**
 * OpenAI GPT-4o wrapper for TJAI plan generation and streaming chat.
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL_JSON = "gpt-4o-2024-08-06"; // structured outputs / json_object
const MODEL_CHAT = "gpt-4o";            // chat / streaming
const MAX_RETRIES = 2;

export type OpenAIUsageSnapshot = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export async function callOpenAI({
  system,
  user,
  maxTokens = 16000,
  jsonMode = false,
  onUsage
}: {
  system: string;
  user: string;
  maxTokens?: number;
  jsonMode?: boolean;
  /** Optional hook for observability (plan generation, small JSON extractions, etc.). */
  onUsage?: (usage: OpenAIUsageSnapshot) => void;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Add it to your environment variables.");

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const body: Record<string, unknown> = {
        model: jsonMode ? MODEL_JSON : MODEL_CHAT,
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
        throw new Error(`OpenAI API error ${response.status}: ${errorText.slice(0, 500)}`);
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
      console.error(`TJAI OpenAI attempt ${attempt} failed:`, lastError.message);
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

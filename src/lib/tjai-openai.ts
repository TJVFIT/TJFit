/**
 * OpenAI GPT-4o wrapper for TJAI plan generation.
 * Uses response_format: json_object for guaranteed valid JSON output.
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";
const MAX_RETRIES = 2;

export async function callOpenAI({
  system,
  user,
  maxTokens = 16000,
  jsonMode = false
}: {
  system: string;
  user: string;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Add it to your environment variables.");

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const body: Record<string, unknown> = {
        model: MODEL,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      };

      if (jsonMode) {
        body.response_format = { type: "json_object" };
        body.temperature = 0.3; // Lower temp for more reliable JSON
      }

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${errorText.slice(0, 500)}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content ?? "";

      if (!text) throw new Error("OpenAI returned an empty response.");

      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`TJAI OpenAI attempt ${attempt} failed:`, lastError.message);
      if (attempt <= MAX_RETRIES) {
        // Exponential backoff: 1s, 2s
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }

  throw lastError ?? new Error("All AI generation attempts failed.");
}

/**
 * Parse JSON safely — works with json_object mode (already valid JSON)
 * or as a fallback extractor for free-form responses.
 */
export function safeParseJSON<T = unknown>(text: string): T {
  // First try direct parse (works perfectly with json_object mode)
  try {
    return JSON.parse(text) as T;
  } catch {
    // Fallback: extract first {...} block (for non-json_object responses)
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // Try to find a valid JSON substring
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

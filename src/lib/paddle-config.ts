/**
 * Paddle Billing env helpers (server + public env names documented in .env.example).
 */

export type PaddleEnvironment = "sandbox" | "production";

export function getPaddleEnvironment(): PaddleEnvironment {
  const raw = (
    process.env.PADDLE_ENVIRONMENT ??
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ??
    process.env.NEXT_PUBLIC_PADDLE_ENV ??
    "production"
  )
    .trim()
    .toLowerCase();
  return raw === "sandbox" ? "sandbox" : "production";
}

export function getPaddleApiBase(): "https://api.paddle.com" | "https://sandbox-api.paddle.com" {
  return getPaddleEnvironment() === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";
}

export function getPaddleApiKey(): string | null {
  const k = process.env.PADDLE_API_KEY?.trim();
  return k || null;
}

export function parsePaddlePriceMap(): Record<string, string> {
  const raw = process.env.PADDLE_PRICE_MAP?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof val === "string" && val.length > 0) {
        out[key] = val;
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Resolve catalog `pri_…` id for a program slug; optional default for all programs. */
export function resolvePaddlePriceId(programSlug: string): string | null {
  const map = parsePaddlePriceMap();
  const mapped = map[programSlug]?.trim();
  if (mapped) return mapped;
  const fallback = process.env.PADDLE_DEFAULT_PRICE_ID?.trim();
  return fallback || null;
}

export function isPaddleServerConfigured(): boolean {
  return !!getPaddleApiKey();
}

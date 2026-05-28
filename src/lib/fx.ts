// Live USD→TRY conversion for bundle checkout. The store charges in TRY,
// but bundle prices are authored in USD (owner directive). We fetch a live
// rate, cache it in-memory for an hour, and fall back to a conservative
// fixed rate if the FX API is unreachable so checkout never hard-fails.

const FALLBACK_USD_TRY = 34; // conservative floor; only used if the API is down
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const FX_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

let cached: { rate: number; at: number } | null = null;

async function fetchUsdToTryRate(): Promise<number> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.rate;

  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(FX_ENDPOINT, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`FX ${res.status}`);
    const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
    const rate = data?.rates?.TRY;
    if (data?.result === "success" && typeof rate === "number" && rate > 0) {
      cached = { rate, at: now };
      return rate;
    }
    throw new Error("FX payload missing TRY");
  } catch (err) {
    console.error("[fx] live USD→TRY fetch failed, using fallback:", err instanceof Error ? err.message : err);
    // Cache the fallback briefly so we don't hammer a down API on every checkout.
    cached = { rate: FALLBACK_USD_TRY, at: now };
    return FALLBACK_USD_TRY;
  }
}

/** Convert a USD amount to whole TRY using the live rate (rounded up to the lira). */
export async function convertUsdToTry(usd: number): Promise<number> {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  const rate = await fetchUsdToTryRate();
  return Math.ceil(usd * rate);
}

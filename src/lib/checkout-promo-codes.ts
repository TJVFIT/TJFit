/**
 * Optional checkout promo codes (any authenticated user).
 *
 * Configure one or more of (first match wins per code when looking up):
 * - CHECKOUT_PROMO_CODES — JSON object, e.g. {"JOSEPH1407":99}
 * - CHECKOUT_PROMO_PAIRS — comma-separated CODE:PERCENT (no JSON; reliable on Vercel), e.g. JOSEPH1407:99
 * - CHECKOUT_PROMO_CODE + CHECKOUT_PROMO_PERCENT — single code, e.g. JOSEPH1407 and 99
 *
 * Codes are matched case-insensitively. prepare-session needs PADDLE_WALLET_DISCOUNT_ID (dsc_…) matching that % in Paddle.
 */

function parsePercent(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(n)) return Math.min(100, Math.max(0, n));
  }
  return null;
}

function mergeJsonPromos(map: Map<string, number>, raw: string): void {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k !== "string") continue;
      const pct = parsePercent(v);
      if (pct !== null) map.set(k.trim().toUpperCase(), pct);
    }
  } catch {
    /* ignore invalid JSON */
  }
}

function mergePairsPromos(map: Map<string, number>, raw: string): void {
  for (const segment of raw.split(",")) {
    const s = segment.trim();
    if (!s) continue;
    const idx = s.indexOf(":");
    if (idx <= 0) continue;
    const code = s.slice(0, idx).trim().toUpperCase();
    const pct = parsePercent(s.slice(idx + 1).trim());
    if (code && pct !== null) map.set(code, pct);
  }
}

function buildPromoMap(): Map<string, number> {
  const map = new Map<string, number>();

  const jsonRaw = process.env.CHECKOUT_PROMO_CODES?.trim();
  if (jsonRaw) mergeJsonPromos(map, jsonRaw);

  const pairsRaw = process.env.CHECKOUT_PROMO_PAIRS?.trim();
  if (pairsRaw) mergePairsPromos(map, pairsRaw);

  const singleCode = process.env.CHECKOUT_PROMO_CODE?.trim().toUpperCase();
  const singlePct = parsePercent(process.env.CHECKOUT_PROMO_PERCENT);
  if (singleCode && singlePct !== null) {
    map.set(singleCode, singlePct);
  }

  return map;
}

export function resolvePromoDiscountPercent(submittedCode: string): number | null {
  const upper = submittedCode.trim().toUpperCase();
  if (!upper) return null;
  const map = buildPromoMap();
  return map.get(upper) ?? null;
}

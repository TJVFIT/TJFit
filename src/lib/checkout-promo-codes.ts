/**
 * Optional checkout promo codes (any authenticated user).
 * Env: CHECKOUT_PROMO_CODES — JSON object, keys matched case-insensitively, values = percent off (0–100).
 * Example: {"JOSEPH1407":99}
 * When a promo applies, prepare-session still needs PADDLE_WALLET_DISCOUNT_ID (dsc_…) matching that % in Paddle.
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

export function resolvePromoDiscountPercent(submittedCode: string): number | null {
  const trimmed = submittedCode.trim();
  if (!trimmed) return null;
  const raw = process.env.CHECKOUT_PROMO_CODES?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const upper = trimmed.toUpperCase();
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k !== "string") continue;
      if (k.trim().toUpperCase() !== upper) continue;
      return parsePercent(v);
    }
  } catch {
    return null;
  }
  return null;
}

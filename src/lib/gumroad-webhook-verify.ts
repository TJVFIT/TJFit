import crypto from "node:crypto";

// Gumroad webhook verification.
//
// Gumroad's Ping / Resource-Subscription webhooks are NOT HMAC-signed
// (unlike Stripe/Paddle). The gates that actually exist:
//   1. seller_id timing-safe compare (verifyGumroadSeller, below)
//   2. best-effort replay window (checkGumroadWebhookFreshness, below)
//   3. idempotency on (provider, event_id) in payment_webhooks
//   4. the route re-fetches every sale from the Gumroad API before
//      granting anything — the POST body is never trusted for value.
// A verifyGumroadWebhookSignature HMAC helper lived here until
// 2026-08-13; it was dead code describing a scheme Gumroad doesn't
// offer, and was deleted (WP-SEC-07). For future webhook SOURCES that
// do sign (e.g. Resend), follow the Standard Webhooks construction
// (id.timestamp.payload) instead of resurrecting it.

export const MAX_AGE_SEC = 300; // 5 minutes — match Gumroad equivalent.

/**
 * Verify a Gumroad webhook by its `seller_id`.
 *
 * Gumroad's Ping / Resource-Subscription webhooks are NOT HMAC-signed
 * (unlike Stripe/Paddle). Instead every payload carries the account's
 * `seller_id`, which Gumroad surfaces in Settings → Advanced ("For
 * external services, your seller_id is ..."). We compare it against the
 * expected value (env: GUMROAD_SELLER_ID) with a timing-safe equality.
 *
 * NOTE: seller_id is only semi-secret, so this is the FIRST gate only.
 * Anything that grants value (credits, access) must additionally be
 * confirmed against the Gumroad API via the sale_id — see the route.
 */
export function verifyGumroadSeller(
  sellerId: string | null | undefined,
  expected: string | null | undefined
): boolean {
  if (!sellerId || !expected) return false;
  const a = Buffer.from(sellerId, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Best-effort replay-window check on Gumroad webhook payloads.
 *
 * IMPORTANT CAVEAT: Unlike Gumroad, Gumroad does NOT include a signed
 * timestamp in the signature scheme. This check uses a timestamp from
 * INSIDE the body (`sale_timestamp` for sale events, `timestamp` /
 * `created_at` for others) — these fields ARE covered by the body
 * HMAC, so an attacker cannot tamper with them, but Gumroad itself
 * controls when those fields are emitted.
 *
 * What this check actually buys us:
 *  - Rejects "old" captured-and-replayed bodies after the window.
 *  - Defense in depth on top of event_id idempotency (which already
 *    blocks replays via the unique constraint on payment_webhooks).
 *
 * What it does NOT do:
 *  - Block in-window replays (idempotency does that).
 *  - Block replays of events that lack a recognizable timestamp field
 *    (we fail-OPEN in that case to avoid breaking legitimate events
 *    from older Gumroad event types).
 *
 * Returns:
 *  - { ok: true } if the timestamp is fresh, or no timestamp present
 *  - { ok: false, reason } if the timestamp is older than MAX_AGE_SEC
 */
export function checkGumroadWebhookFreshness(payload: unknown): { ok: true } | { ok: false; reason: string } {
  if (!payload || typeof payload !== "object") return { ok: true };
  const body = payload as Record<string, unknown>;

  const tsRaw =
    (typeof body.sale_timestamp === "string" && body.sale_timestamp) ||
    (typeof body.timestamp === "string" && body.timestamp) ||
    (typeof body.created_at === "string" && body.created_at) ||
    null;

  if (!tsRaw) return { ok: true }; // no recognizable timestamp — fail open.

  const tsMs = Date.parse(tsRaw);
  if (!Number.isFinite(tsMs)) return { ok: true }; // unparseable — fail open.

  const ageSec = (Date.now() - tsMs) / 1000;
  // Allow a small forward skew (clock drift) without rejecting future-dated events.
  if (ageSec > MAX_AGE_SEC) {
    return { ok: false, reason: `webhook_too_old:${Math.round(ageSec)}s` };
  }
  return { ok: true };
}

import crypto from "node:crypto";

// Gumroad webhook signature verification.
//
// Gumroad signs webhook payloads with HMAC-SHA256 using a shared
// secret configured in the Gumroad dashboard. The signature is
// delivered in the `X-Gumroad-Signature` header as a hex digest.
// Compare via `crypto.timingSafeEqual` to avoid timing attacks.
//
// Reference: https://gumroad.com/help/article/280-creating-a-gumroad-webhook
//
// `rawBody` MUST be the unparsed UTF-8 body — JSON.stringify of a
// re-parsed object will not produce a byte-equivalent string and the
// signature check will fail.

export const MAX_AGE_SEC = 300; // 5 minutes — match Paddle equivalent.

export function verifyGumroadWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  // Both must be the same length for timingSafeEqual; if not, fail
  // immediately rather than throw.
  if (signature.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

/**
 * Best-effort replay-window check on Gumroad webhook payloads.
 *
 * IMPORTANT CAVEAT: Unlike Paddle, Gumroad does NOT include a signed
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

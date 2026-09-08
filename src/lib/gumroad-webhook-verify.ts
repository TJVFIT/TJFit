import crypto from "node:crypto";

// The active route checks the seller and verifies sales through Gumroad's API.
// The legacy HMAC helper below is not used to authenticate incoming Gumroad pings.

export const MAX_AGE_SEC = 300; // Application policy, not a provider authentication guarantee.

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
 * This checks an untrusted body timestamp, not a signed delivery timestamp.
 * It cannot authenticate an event or stop a sender from altering the time.
 * Delayed legitimate events may also exceed this application-defined window.
 *
 * What this check actually buys us:
 *  - Rejects bodies whose supplied timestamp is older than the window.
 *
 * What it does NOT do:
 *  - Authenticate the sender or prevent tampering/replays.
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

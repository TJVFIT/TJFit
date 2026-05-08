import { timingSafeEqual } from "crypto";

/**
 * Constant-time secret comparison. Use for any header/bearer secret check
 * (cron, internal API tokens). String `===` short-circuits on first byte
 * mismatch and leaks the matched-prefix length over the network.
 *
 * Length mismatch is also handled in constant time: we always run
 * `timingSafeEqual` over a buffer sized to the expected secret, then AND
 * with a length check. Total work depends on `expected.length` only.
 */
export function timingSafeStringEqual(provided: string | null | undefined, expected: string): boolean {
  if (!provided || !expected) return false;
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.alloc(expectedBuf.length);
  Buffer.from(provided, "utf8").copy(providedBuf, 0, 0, expectedBuf.length);
  const equal = timingSafeEqual(providedBuf, expectedBuf);
  return equal && Buffer.byteLength(provided, "utf8") === expectedBuf.length;
}

/**
 * Authorization check for cron / internal endpoints. Accepts the secret
 * via either `Authorization: Bearer <secret>` or `x-cron-secret: <secret>`.
 * Returns false if no secret is configured server-side.
 */
export function isAuthorizedCron(request: { headers: Headers }, envVar = "CRON_SECRET"): boolean {
  const secret = process.env[envVar]?.trim();
  if (!secret) return false;
  const header = request.headers.get("x-cron-secret");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  return timingSafeStringEqual(header, secret) || timingSafeStringEqual(bearer, secret);
}

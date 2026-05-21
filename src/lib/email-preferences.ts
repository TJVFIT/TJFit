import crypto from "crypto";

// Refuse to load with a public-knowledge default in production. The previous
// hardcoded fallback meant anyone reading the repo could forge unsubscribe
// tokens for any userId — silently opting victims out of marketing emails.
function resolveSecret(): string | null {
  const fromEnv = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || "";
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return null;
  return "dev-only-unsubscribe-secret-do-not-use-in-prod";
}

const secret = resolveSecret();

// Unsubscribe links land in user inboxes and can sit for months. We allow a
// generous TTL but bound it — a token from a 2-year-old email shouldn't still
// work because the user's account might have changed hands or been recycled.
const TOKEN_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export function signUnsubscribeToken(userId: string) {
  if (!secret) {
    throw new Error("EMAIL_UNSUBSCRIBE_SECRET (or equivalent) is required in production.");
  }
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyUnsubscribeToken(token: string) {
  if (!secret) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [userId, ts, sig] = raw.split(".");
    if (!userId || !ts || !sig) return null;

    // Bound the lifetime — previously the timestamp was stored but never checked.
    const tsNum = Number(ts);
    if (!Number.isFinite(tsNum)) return null;
    const age = Date.now() - tsNum;
    if (age < 0 || age > TOKEN_MAX_AGE_MS) return null;

    const payload = `${userId}.${ts}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    // Timing-safe compare so attackers can't byte-by-byte guess the HMAC.
    let expectedBuf: Buffer;
    let sigBuf: Buffer;
    try {
      expectedBuf = Buffer.from(expected, "hex");
      sigBuf = Buffer.from(sig, "hex");
    } catch {
      return null;
    }
    if (expectedBuf.length !== sigBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, sigBuf)) return null;

    return { userId };
  } catch {
    return null;
  }
}

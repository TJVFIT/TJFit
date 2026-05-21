import crypto from "crypto";

// Refuse to load with a public-knowledge default in production. A hardcoded
// fallback meant anyone reading the repo could forge confirmation tokens.
function resolveSecret(): string | null {
  const fromEnv =
    process.env.NEWSLETTER_CONFIRM_SECRET ||
    process.env.EMAIL_UNSUBSCRIBE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "";
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return null;
  // Dev-only fallback so local builds still work without secrets configured.
  return "dev-only-newsletter-secret-do-not-use-in-prod";
}

const secret = resolveSecret();

type Payload = {
  email: string;
  source: string;
  locale: string;
  exp: number;
};

export function signNewsletterConfirmToken(input: { email: string; source: string; locale: string; ttlMinutes?: number }) {
  if (!secret) {
    throw new Error("NEWSLETTER_CONFIRM_SECRET (or equivalent) is required in production.");
  }
  const ttl = Math.max(5, input.ttlMinutes ?? 60 * 24);
  const payload: Payload = {
    email: input.email.trim().toLowerCase(),
    source: input.source.trim().toLowerCase(),
    locale: input.locale.trim().toLowerCase(),
    exp: Date.now() + ttl * 60_000
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(encoded).digest("hex");
  return `${encoded}.${sig}`;
}

export function verifyNewsletterConfirmToken(token: string): Payload | null {
  if (!secret) return null;
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const expected = crypto.createHmac("sha256", secret).update(encoded).digest("hex");
    // Timing-safe compare so an attacker cannot byte-by-byte guess the HMAC
    // via response-time deltas. timingSafeEqual requires equal-length buffers.
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
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Payload;
    if (!payload?.email || !payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

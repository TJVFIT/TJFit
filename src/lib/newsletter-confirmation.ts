import crypto from "crypto";

const secret =
  process.env.NEWSLETTER_CONFIRM_SECRET ||
  process.env.EMAIL_UNSUBSCRIBE_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "tjfit-newsletter-confirm-secret";

type Payload = {
  email: string;
  source: string;
  locale: string;
  exp: number;
};

export function signNewsletterConfirmToken(input: { email: string; source: string; locale: string; ttlMinutes?: number }) {
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
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const expected = crypto.createHmac("sha256", secret).update(encoded).digest("hex");
    if (expected !== sig) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Payload;
    if (!payload?.email || !payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

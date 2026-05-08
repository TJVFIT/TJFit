import crypto from "crypto";

const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || "tjfit-default-unsubscribe-secret";
const TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function signUnsubscribeToken(userId: string, sequenceId?: string) {
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlJson({
    userId,
    sequenceId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  });
  const unsigned = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

export function verifyUnsubscribeToken(token: string) {
  try {
    const [header, jwtPayload, signature] = token.split(".");
    if (header && jwtPayload && signature) {
      const expected = crypto.createHmac("sha256", secret).update(`${header}.${jwtPayload}`).digest("base64url");
      if (!timingSafeEqual(expected, signature)) return null;
      const parsed = JSON.parse(Buffer.from(jwtPayload, "base64url").toString("utf8")) as {
        userId?: string;
        sequenceId?: string;
        exp?: number;
      };
      if (!parsed.userId || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
      return { userId: parsed.userId, sequenceId: parsed.sequenceId ?? null };
    }

    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [userId, ts, sig] = raw.split(".");
    if (!userId || !ts || !sig) return null;
    const legacyPayload = `${userId}.${ts}`;
    const expected = crypto.createHmac("sha256", secret).update(legacyPayload).digest("hex");
    if (!timingSafeEqual(expected, sig)) return null;
    return { userId, sequenceId: null };
  } catch {
    return null;
  }
}


import crypto from "crypto";

const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || "tjfit-default-unsubscribe-secret";

export function signUnsubscribeToken(userId: string) {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyUnsubscribeToken(token: string) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [userId, ts, sig] = raw.split(".");
    if (!userId || !ts || !sig) return null;
    const payload = `${userId}.${ts}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (expected !== sig) return null;
    return { userId };
  } catch {
    return null;
  }
}


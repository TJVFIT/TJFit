import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_SEC = 300;

/**
 * Verifies Paddle Billing `Paddle-Signature` header (HMAC-SHA256 over `ts:rawBody`).
 */
export function verifyPaddleWebhookSignature(
  rawBody: string,
  paddleSignatureHeader: string | null,
  secretKey: string
): boolean {
  if (!paddleSignatureHeader || !secretKey) return false;

  const parts = paddleSignatureHeader.split(";").map((p) => p.trim());
  let ts: string | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const [k, v] = part.split("=");
    if (!v) continue;
    if (k === "ts") ts = v;
    if (k === "h1") signatures.push(v);
  }

  if (!ts || signatures.length === 0) return false;

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - tsNum) > MAX_AGE_SEC) {
    return false;
  }

  const signedPayload = `${ts}:${rawBody}`;
  const expected = createHmac("sha256", secretKey).update(signedPayload, "utf8").digest("hex");

  try {
    const expectedBuf = Buffer.from(expected, "hex");
    return signatures.some((sig) => {
      try {
        const sigBuf = Buffer.from(sig, "hex");
        if (sigBuf.length !== expectedBuf.length) return false;
        return timingSafeEqual(sigBuf, expectedBuf);
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

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

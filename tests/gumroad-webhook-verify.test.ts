import crypto from "node:crypto";

import { describe, it, expect } from "vitest";

import {
  verifyGumroadWebhookSignature,
  checkGumroadWebhookFreshness,
  MAX_AGE_SEC
} from "@/lib/gumroad-webhook-verify";

/**
 * The webhook signature check is the gate that stops forged "sale" events
 * from granting bundles/credits for free. A regression = payment fraud, so
 * the accept/reject behavior is pinned here.
 */
const secret = "test_secret_123";
const sign = (body: string, s = secret) => crypto.createHmac("sha256", s).update(body, "utf8").digest("hex");

describe("verifyGumroadWebhookSignature", () => {
  const body = JSON.stringify({ sale_id: "abc", product_id: "p1", price: 1000 });

  it("accepts a correctly-signed body", () => {
    expect(verifyGumroadWebhookSignature(body, sign(body), secret)).toBe(true);
  });

  it("rejects a tampered body (HMAC no longer matches)", () => {
    const sig = sign(body); // signature for the original body
    const tampered = body.replace("1000", "1"); // attacker lowers the price
    expect(verifyGumroadWebhookSignature(tampered, sig, secret)).toBe(false);
  });

  it("rejects a signature forged with the wrong secret", () => {
    expect(verifyGumroadWebhookSignature(body, sign(body, "attacker_secret"), secret)).toBe(false);
  });

  it("rejects missing signature or secret (fails closed)", () => {
    expect(verifyGumroadWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyGumroadWebhookSignature(body, undefined, secret)).toBe(false);
    expect(verifyGumroadWebhookSignature(body, sign(body), "")).toBe(false);
  });

  it("rejects a wrong-length signature without throwing", () => {
    expect(verifyGumroadWebhookSignature(body, "deadbeef", secret)).toBe(false);
  });
});

describe("checkGumroadWebhookFreshness", () => {
  it("accepts a fresh timestamp", () => {
    expect(checkGumroadWebhookFreshness({ sale_timestamp: new Date().toISOString() }).ok).toBe(true);
  });

  it("rejects a replayed body older than the window", () => {
    const old = new Date(Date.now() - (MAX_AGE_SEC + 60) * 1000).toISOString();
    expect(checkGumroadWebhookFreshness({ sale_timestamp: old }).ok).toBe(false);
  });

  it("fails open when no recognizable timestamp is present", () => {
    expect(checkGumroadWebhookFreshness({ sale_id: "x" }).ok).toBe(true);
    expect(checkGumroadWebhookFreshness({ timestamp: "not-a-date" }).ok).toBe(true);
    expect(checkGumroadWebhookFreshness(null).ok).toBe(true);
  });
});

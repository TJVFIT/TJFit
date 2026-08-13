import { describe, it, expect } from "vitest";

import {
  verifyGumroadSeller,
  checkGumroadWebhookFreshness,
  MAX_AGE_SEC
} from "@/lib/gumroad-webhook-verify";

/**
 * The seller_id gate + freshness window + (provider, event_id) idempotency
 * are what stop forged "sale" events from granting bundles/credits for
 * free — Gumroad does not HMAC-sign webhooks, so there is no signature to
 * verify (the dead HMAC helper and its tests were removed 2026-08-13,
 * WP-SEC-07). A regression here = payment fraud, so accept/reject
 * behavior stays pinned.
 */

describe("verifyGumroadSeller", () => {
  const expected = "h8_Y4JLPWq9Pm3yj4QSVIA==";

  it("accepts a matching seller_id", () => {
    expect(verifyGumroadSeller(expected, expected)).toBe(true);
  });

  it("rejects a mismatched seller_id", () => {
    expect(verifyGumroadSeller("someone_elses_id", expected)).toBe(false);
  });

  it("rejects missing seller_id or expected (fails closed)", () => {
    expect(verifyGumroadSeller(null, expected)).toBe(false);
    expect(verifyGumroadSeller(undefined, expected)).toBe(false);
    expect(verifyGumroadSeller(expected, "")).toBe(false);
    expect(verifyGumroadSeller(expected, undefined)).toBe(false);
  });

  it("rejects a different-length id without throwing", () => {
    expect(verifyGumroadSeller("short", expected)).toBe(false);
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

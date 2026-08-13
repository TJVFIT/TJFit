/**
 * evaluateTestCheckoutTripwire (WP-SEC-06) — boot-time gate that mirrors the
 * request-time gate in complete-order/route.ts. Pins the exact combinations
 * that must / must not fire.
 */

import { describe, it, expect } from "vitest";
import { evaluateTestCheckoutTripwire } from "@/lib/test-checkout-tripwire";

describe("evaluateTestCheckoutTripwire", () => {
  it("fires when ALLOW_TEST_CHECKOUT=true and VERCEL_ENV=production", () => {
    const result = evaluateTestCheckoutTripwire({ ALLOW_TEST_CHECKOUT: "true", VERCEL_ENV: "production" });
    expect(result.fire).toBe(true);
    expect(result.message).toMatch(/TRIPWIRE/);
  });

  it("fires when ALLOW_TEST_CHECKOUT=true, VERCEL_ENV is unset, and NODE_ENV=production (non-Vercel deploy)", () => {
    const result = evaluateTestCheckoutTripwire({ ALLOW_TEST_CHECKOUT: "true", NODE_ENV: "production" });
    expect(result.fire).toBe(true);
  });

  it("does not fire on a Vercel preview deployment even with the flag on", () => {
    const result = evaluateTestCheckoutTripwire({
      ALLOW_TEST_CHECKOUT: "true",
      VERCEL_ENV: "preview",
      NODE_ENV: "production"
    });
    expect(result.fire).toBe(false);
  });

  it("does not fire in production when the flag is off", () => {
    const result = evaluateTestCheckoutTripwire({ ALLOW_TEST_CHECKOUT: "false", VERCEL_ENV: "production" });
    expect(result.fire).toBe(false);
  });

  it("does not fire when the flag is unset entirely in production", () => {
    const result = evaluateTestCheckoutTripwire({ VERCEL_ENV: "production" });
    expect(result.fire).toBe(false);
  });

  it("does not fire in local dev (NODE_ENV=development, no VERCEL_ENV)", () => {
    const result = evaluateTestCheckoutTripwire({ ALLOW_TEST_CHECKOUT: "true", NODE_ENV: "development" });
    expect(result.fire).toBe(false);
  });

  it("VERCEL_ENV, when set, takes precedence over NODE_ENV even if NODE_ENV says production", () => {
    const result = evaluateTestCheckoutTripwire({
      ALLOW_TEST_CHECKOUT: "true",
      VERCEL_ENV: "development",
      NODE_ENV: "production"
    });
    expect(result.fire).toBe(false);
  });
});

import { describe, it, expect, afterEach } from "vitest";

import { resolvePromoDiscountPercent } from "@/lib/checkout-promo-codes";

/**
 * Promo codes are owner-configured via env (not user-injectable) and the
 * percent is clamped 0–100. Pins that a discount can't exceed 100% (revenue
 * leak) or go negative, and that only configured codes resolve.
 */
const ENV_KEYS = ["CHECKOUT_PROMO_CODES", "CHECKOUT_PROMO_PAIRS", "CHECKOUT_PROMO_CODE", "CHECKOUT_PROMO_PERCENT"];

describe("resolvePromoDiscountPercent", () => {
  afterEach(() => {
    for (const k of ENV_KEYS) delete process.env[k];
  });

  it("resolves a configured code case-insensitively (and trims)", () => {
    process.env.CHECKOUT_PROMO_PAIRS = "SAVE20:20,WELCOME:10";
    expect(resolvePromoDiscountPercent("SAVE20")).toBe(20);
    expect(resolvePromoDiscountPercent("save20")).toBe(20);
    expect(resolvePromoDiscountPercent(" welcome ")).toBe(10);
  });

  it("returns null for unknown or empty codes", () => {
    process.env.CHECKOUT_PROMO_PAIRS = "SAVE20:20";
    expect(resolvePromoDiscountPercent("NOPE")).toBeNull();
    expect(resolvePromoDiscountPercent("")).toBeNull();
    expect(resolvePromoDiscountPercent("   ")).toBeNull();
  });

  it("clamps the discount to 0–100 (no >100% or negative)", () => {
    process.env.CHECKOUT_PROMO_PAIRS = "OVER:150,NEG:-10";
    expect(resolvePromoDiscountPercent("OVER")).toBe(100);
    expect(resolvePromoDiscountPercent("NEG")).toBe(0);
  });

  it("supports the JSON and single-code config formats", () => {
    process.env.CHECKOUT_PROMO_CODES = '{"JSONCODE":33}';
    expect(resolvePromoDiscountPercent("jsoncode")).toBe(33);
    delete process.env.CHECKOUT_PROMO_CODES;

    process.env.CHECKOUT_PROMO_CODE = "SINGLE";
    process.env.CHECKOUT_PROMO_PERCENT = "45";
    expect(resolvePromoDiscountPercent("single")).toBe(45);
  });

  it("returns null when no promo codes are configured", () => {
    expect(resolvePromoDiscountPercent("ANYTHING")).toBeNull();
  });
});

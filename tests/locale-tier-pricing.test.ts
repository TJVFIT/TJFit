import { describe, it, expect } from "vitest";

import { resolveTier, getPrice, formatTierPrice } from "@/lib/pricing/locale-tier";

/**
 * Regional pricing must "never undercharge": an unknown/unmapped country
 * resolves to Tier 1 (full USD), and the discounted Tier 2/3 only apply when
 * explicitly enabled via env flags (off by default). Pins that safety default
 * plus the price tables + formatting.
 */
describe("resolveTier — never-undercharge default", () => {
  it("defaults missing / unknown countries to Tier 1 (full price)", () => {
    expect(resolveTier(null)).toBe(1);
    expect(resolveTier(undefined)).toBe(1);
    expect(resolveTier("")).toBe(1);
    expect(resolveTier("ZZ")).toBe(1); // unmapped
    expect(resolveTier("US")).toBe(1);
    expect(resolveTier(" us ")).toBe(1); // normalized
  });

  it("keeps Tier 2/3 markets at Tier 1 unless the live flag is set (default off)", () => {
    // NEXT_PUBLIC_TIER_2_LIVE / _3_LIVE are unset in the test env (prod default),
    // so discounted tiers stay gated — full price everywhere.
    expect(resolveTier("TR")).toBe(1); // Tier 2 market, gated
    expect(resolveTier("IN")).toBe(1); // Tier 3 market, gated
  });
});

describe("getPrice / formatTierPrice", () => {
  it("returns the configured price per tier + item", () => {
    expect(getPrice("proMonthly", 1)).toBe(10);
    expect(getPrice("tjaiPlan", 1)).toBe(8);
    expect(getPrice("proMonthly", 2)).toBe(4.99);
    expect(getPrice("diet", 3)).toBe(1.49);
  });

  it("formats integer vs decimal USD prices", () => {
    expect(formatTierPrice(10)).toBe("$10");
    expect(formatTierPrice(9.99)).toBe("$9.99");
    expect(formatTierPrice(159)).toBe("$159");
  });
});

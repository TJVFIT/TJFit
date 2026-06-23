import { describe, it, expect } from "vitest";

import { buildGumroadTrackedUrl } from "@/lib/gumroad/client";
import { computeShareUSD, type ResolvedCommission } from "@/lib/gumroad/commission";

/**
 * Money-path pure functions. A bug in the tracked URL breaks the webhook's
 * order correlation (so fulfillment can't attribute a sale); a bug in the
 * split mispays coaches. Both are pinned here.
 */
describe("buildGumroadTrackedUrl", () => {
  const base = "https://josephfit1.gumroad.com/l/recomp";

  it("appends wanted + order tracking params and preserves the base", () => {
    const url = buildGumroadTrackedUrl(base, { orderId: "ord_1", programSlug: "recomp" });
    expect(url).not.toBeNull();
    const u = new URL(url as string);
    expect(u.origin + u.pathname).toBe("https://josephfit1.gumroad.com/l/recomp");
    expect(u.searchParams.get("wanted")).toBe("true");
    expect(u.searchParams.get("tjfit_order_id")).toBe("ord_1");
    expect(u.searchParams.get("tjfit_program_slug")).toBe("recomp");
  });

  it("includes optional userId / locale / email only when provided", () => {
    const withOpts = new URL(
      buildGumroadTrackedUrl(base, {
        orderId: "o", programSlug: "p", userId: "u1", locale: "tr", email: "a@b.com"
      }) as string
    );
    expect(withOpts.searchParams.get("tjfit_user_id")).toBe("u1");
    expect(withOpts.searchParams.get("tjfit_locale")).toBe("tr");
    expect(withOpts.searchParams.get("email")).toBe("a@b.com");

    const without = new URL(buildGumroadTrackedUrl(base, { orderId: "o", programSlug: "p" }) as string);
    expect(without.searchParams.has("tjfit_user_id")).toBe(false);
    expect(without.searchParams.has("email")).toBe(false);
  });

  it("returns null for empty or invalid base URLs", () => {
    expect(buildGumroadTrackedUrl("", { orderId: "o", programSlug: "p" })).toBeNull();
    expect(buildGumroadTrackedUrl("   ", { orderId: "o", programSlug: "p" })).toBeNull();
    expect(buildGumroadTrackedUrl("not a url", { orderId: "o", programSlug: "p" })).toBeNull();
  });
});

describe("computeShareUSD", () => {
  const rule = (coachPct: number, tjfitPct: number): ResolvedCommission => ({
    coachPct, tjfitPct, ruleSource: "global", ruleId: "r"
  });

  it("splits an even net correctly", () => {
    expect(computeShareUSD(rule(50, 50), 10)).toEqual({ coachUsd: 5, tjfitUsd: 5 });
    expect(computeShareUSD(rule(70, 30), 10)).toEqual({ coachUsd: 7, tjfitUsd: 3 });
  });

  it("rounds to 2 decimals", () => {
    const { coachUsd } = computeShareUSD(rule(33.33, 66.67), 10);
    expect(coachUsd).toBeCloseTo(3.33, 2);
  });

  it("zero net pays nothing", () => {
    expect(computeShareUSD(rule(50, 50), 0)).toEqual({ coachUsd: 0, tjfitUsd: 0 });
  });
});

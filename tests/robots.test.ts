import { describe, it, expect, beforeAll } from "vitest";

import robots from "@/app/robots";
import { MIDDLEWARE_GUARDS, ROBOTS_ONLY_DISALLOW } from "@/lib/route-guards";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tjfit.org";
});

describe("robots.txt", () => {
  it("allows the root for all user agents", () => {
    const out = robots();
    expect(out.rules).toBeDefined();
    const rule = Array.isArray(out.rules) ? out.rules[0] : out.rules;
    expect(rule?.userAgent).toBe("*");
    expect(rule?.allow).toBe("/");
  });

  it("disallows the API surface", () => {
    const out = robots();
    const rule = Array.isArray(out.rules) ? out.rules[0] : out.rules!;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow!];
    expect(disallow).toContain("/api/");
  });

  it("disallows every middleware-gated auth path (SSOT-enforced, cannot drift)", () => {
    const out = robots();
    const rule = Array.isArray(out.rules) ? out.rules[0] : out.rules!;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow!];

    // Both middleware and robots consume src/lib/route-guards.ts. This test
    // pins the guarantee: EVERY guard family the middleware protects (plus
    // the page-level-only auth surfaces) must appear in the crawler
    // disallow list. Adding a guard without robots coverage fails here.
    for (const guard of MIDDLEWARE_GUARDS) {
      expect(disallow).toContain(`/*${guard.prefix}`);
    }
    for (const path of ROBOTS_ONLY_DISALLOW) {
      expect(disallow).toContain(`/*${path}`);
    }
    // The two fixed regressions stay pinned explicitly:
    expect(disallow).toContain("/*/blog/write");
    expect(disallow).toContain("/*/ai");
  });

  it("disallows /coming-soon (launch gate landing)", () => {
    const out = robots();
    const rule = Array.isArray(out.rules) ? out.rules[0] : out.rules!;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow!];
    expect(disallow).toContain("/coming-soon");
  });

  it("points the sitemap at the configured site URL", () => {
    const out = robots();
    expect(out.sitemap).toBe("https://tjfit.org/sitemap.xml");
  });

  it("does NOT disallow /bundles or any product surface", () => {
    const out = robots();
    const rule = Array.isArray(out.rules) ? out.rules[0] : out.rules!;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow!];
    // Sanity: nothing in the list mentions the bundle catalog.
    for (const entry of disallow) {
      expect(entry).not.toContain("bundles");
      expect(entry).not.toContain("coaches");
      expect(entry).not.toContain("community");
    }
  });
});

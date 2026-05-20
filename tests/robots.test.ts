import { describe, it, expect, beforeAll } from "vitest";

import robots from "@/app/robots";

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

  it("disallows every middleware-gated auth path", () => {
    const out = robots();
    const rule = Array.isArray(out.rules) ? out.rules[0] : out.rules!;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow!];

    // These match the matchHtmlGuard list in src/middleware.ts.
    const required = [
      "/*/admin",
      "/*/coach-dashboard",
      "/*/dashboard",
      "/*/messages",
      "/*/feed",
      "/*/profile/edit",
      "/*/settings",
      "/*/checkout",
      "/*/purchase",
      "/*/payment",
      "/*/progress",
      "/*/verify-email",
      "/*/forgot-password"
    ];
    for (const path of required) {
      expect(disallow).toContain(path);
    }
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

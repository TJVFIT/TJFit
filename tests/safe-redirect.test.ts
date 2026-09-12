import { describe, it, expect } from "vitest";

import { isSafeRedirect, sanitizeRedirectParam } from "@/lib/safe-redirect";

/**
 * Open-redirect protection for post-auth `?redirect=` params. A regression here
 * is a phishing vector, so the allow/deny behavior is pinned.
 */
describe("isSafeRedirect", () => {
  it("rejects routing normalization and backslash bypasses", () => {
    for (const value of ["/en/../../api/secret", "/en/%2e%2e/api/secret", "/en/..%2fapi/secret", "/en/\\evil", "/en/ai\n", "/en/api", "/en/%61pi/private"]) {
      expect(isSafeRedirect(value, "en"), value).toBe(false);
    }
  });
  it("allows same-locale internal paths", () => {
    expect(isSafeRedirect("/en", "en")).toBe(true);
    expect(isSafeRedirect("/en/ai", "en")).toBe(true);
    expect(isSafeRedirect("/en/tjai/credits", "en")).toBe(true);
  });

  it("blocks absolute / external URLs", () => {
    expect(isSafeRedirect("https://evil.com", "en")).toBe(false);
    expect(isSafeRedirect("http://evil.com/en", "en")).toBe(false);
  });

  it("blocks protocol-relative and embedded // tricks", () => {
    expect(isSafeRedirect("//evil.com", "en")).toBe(false);
    expect(isSafeRedirect("/en//evil.com", "en")).toBe(false);
  });

  it("blocks /api/ paths anywhere in the path", () => {
    expect(isSafeRedirect("/api/secret", "en")).toBe(false);
    expect(isSafeRedirect("/en/api/leak", "en")).toBe(false);
  });

  it("blocks cross-locale and non-rooted paths", () => {
    expect(isSafeRedirect("/fr/ai", "en")).toBe(false);
    expect(isSafeRedirect("/enmalicious", "en")).toBe(false);
    expect(isSafeRedirect("ai", "en")).toBe(false);
    expect(isSafeRedirect("/", "en")).toBe(false);
  });

  it("blocks empty / non-string input", () => {
    expect(isSafeRedirect("", "en")).toBe(false);
    // @ts-expect-error testing runtime guard
    expect(isSafeRedirect(null, "en")).toBe(false);
  });
});

describe("sanitizeRedirectParam", () => {
  it("preserves existing query encoding after URLSearchParams has decoded the outer parameter", () => {
    const target = "/en/ai?tab=my-plan&label=a%26b%3Dc&start=1&resume=1";
    expect(sanitizeRedirectParam(new URLSearchParams({ redirect: target }).get("redirect"), "en")).toBe(target);
    expect(sanitizeRedirectParam(encodeURIComponent(target), "en")).toBe(target);
  });
  it("returns a decoded safe path", () => {
    expect(sanitizeRedirectParam("%2Fen%2Fai", "en")).toBe("/en/ai");
    expect(sanitizeRedirectParam("/en/tjai", "en")).toBe("/en/tjai");
  });

  it("returns null for unsafe or empty input", () => {
    expect(sanitizeRedirectParam(null, "en")).toBeNull();
    expect(sanitizeRedirectParam("", "en")).toBeNull();
    expect(sanitizeRedirectParam("https://evil.com", "en")).toBeNull();
    // encoded //evil.com
    expect(sanitizeRedirectParam("%2F%2Fevil.com", "en")).toBeNull();
  });

  it("returns null for malformed percent-encoding (decode throws)", () => {
    expect(sanitizeRedirectParam("%E0%A4%A", "en")).toBeNull();
  });
});

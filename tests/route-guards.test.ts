import { describe, it, expect } from "vitest";

import { MIDDLEWARE_GUARDS, matchHtmlGuard } from "@/lib/route-guards";

// Pins the exact semantics the middleware relied on when matchHtmlGuard was
// an inline if-chain (extracted to the SSOT module 2026-08-13, WP-SEC-05
// follow-up). A drift here means real routes gain or lose auth guarding.
describe("matchHtmlGuard", () => {
  it("guards every family at its root and below", () => {
    expect(matchHtmlGuard("/en/admin")).toEqual({ locale: "en", kind: "admin" });
    expect(matchHtmlGuard("/en/admin/tjai")).toEqual({ locale: "en", kind: "admin" });
    expect(matchHtmlGuard("/tr/coach-dashboard")).toEqual({ locale: "tr", kind: "coach_area" });
    expect(matchHtmlGuard("/ar/dashboard")).toEqual({ locale: "ar", kind: "auth_user" });
    expect(matchHtmlGuard("/es/messages/abc-123")).toEqual({ locale: "es", kind: "auth_user" });
    expect(matchHtmlGuard("/fr/feed")).toEqual({ locale: "fr", kind: "auth_user" });
    expect(matchHtmlGuard("/en/blog/write")).toEqual({ locale: "en", kind: "auth_user" });
    expect(matchHtmlGuard("/en/profile/edit")).toEqual({ locale: "en", kind: "auth_user" });
    expect(matchHtmlGuard("/en/settings/profile")).toEqual({ locale: "en", kind: "auth_user" });
    expect(matchHtmlGuard("/en/settings")).toEqual({ locale: "en", kind: "auth_user" });
    expect(matchHtmlGuard("/en/checkout")).toEqual({ locale: "en", kind: "auth_user" });
    expect(matchHtmlGuard("/en/progress")).toEqual({ locale: "en", kind: "auth_user" });
  });

  it("matches /coach/terms exactly and nothing beneath it", () => {
    expect(matchHtmlGuard("/en/coach/terms")).toEqual({ locale: "en", kind: "coach_terms" });
    // Pre-extraction behavior: the old chain used === only for this path.
    expect(matchHtmlGuard("/en/coach/terms/anything")).toBeNull();
    // No /coach catch-all exists — a bare coach page is unguarded here.
    expect(matchHtmlGuard("/en/coach")).toBeNull();
  });

  it("returns null for api, bad locales, short paths, and public routes", () => {
    expect(matchHtmlGuard("/api/tjai/chat")).toBeNull();
    expect(matchHtmlGuard("/xx/dashboard")).toBeNull();
    expect(matchHtmlGuard("/en")).toBeNull();
    expect(matchHtmlGuard("/")).toBeNull();
    expect(matchHtmlGuard("/en/tjai")).toBeNull();
    expect(matchHtmlGuard("/en/bundles/fat-loss")).toBeNull();
    expect(matchHtmlGuard("/en/blog/some-post")).toBeNull();
    // Prefix must match on a segment boundary, not as a substring:
    expect(matchHtmlGuard("/en/dashboard-tips")).toBeNull();
    expect(matchHtmlGuard("/en/settingsfoo")).toBeNull();
  });

  it("every SSOT entry is reachable through the matcher", () => {
    for (const guard of MIDDLEWARE_GUARDS) {
      const hit = matchHtmlGuard(`/en${guard.prefix}`);
      expect(hit).toEqual({ locale: "en", kind: guard.kind });
    }
  });
});

import { describe, it, expect } from "vitest";

import { signNewsletterConfirmToken, verifyNewsletterConfirmToken } from "@/lib/newsletter-confirmation";

/**
 * The unsubscribe endpoint only honors tokens minted with source="unsubscribe"
 * (so a confirmation token can't double as a one-click unsubscribe). This pins
 * the round-trip + that purpose separation + forgery rejection.
 */
describe("newsletter email tokens", () => {
  it("round-trips an unsubscribe token (email normalized, source + locale intact)", () => {
    const t = signNewsletterConfirmToken({ email: "User@Example.com", source: "unsubscribe", locale: "tr" });
    const p = verifyNewsletterConfirmToken(t);
    expect(p?.email).toBe("user@example.com");
    expect(p?.source).toBe("unsubscribe");
    expect(p?.locale).toBe("tr");
  });

  it("keeps a confirmation token distinguishable from an unsubscribe token", () => {
    const confirm = signNewsletterConfirmToken({ email: "a@b.com", source: "homepage-newsletter", locale: "en" });
    // Endpoint requires source === "unsubscribe", so a confirm token won't pass.
    expect(verifyNewsletterConfirmToken(confirm)?.source).toBe("homepage-newsletter");
  });

  it("rejects malformed or tampered tokens", () => {
    expect(verifyNewsletterConfirmToken("garbage.payload.sig")).toBeNull();
    expect(verifyNewsletterConfirmToken("")).toBeNull();
    const t = signNewsletterConfirmToken({ email: "a@b.com", source: "unsubscribe", locale: "en" });
    // Flip the first payload char so the HMAC no longer matches the signature.
    const tampered = (t[0] === "a" ? "b" : "a") + t.slice(1);
    expect(verifyNewsletterConfirmToken(tampered)).toBeNull();
  });
});

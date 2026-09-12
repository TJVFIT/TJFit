import { describe, expect, it } from "vitest";
import { getPrivacyCopy, getRefundCopy, getTermsCopy } from "@/lib/legal-copy";
import { getLegalHubCopy } from "@/lib/legal-hub-copy";
import { LEGAL_SERVICES } from "@/lib/legal-service-copy";
import { BILLING_PROVIDER, getBillingAcceptanceCopy, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";

const locales = ["en", "tr", "ar", "es", "fr"] as const;

describe("public payment transition disclosures", () => {
  it("dates new acceptances and identifies the intended new digital provider", () => {
    expect(TERMS_VERSION).toBe("2026-09-12");
    expect(PRIVACY_VERSION).toBe("2026-09-12");
    expect(BILLING_PROVIDER).toBe("Lemon Squeezy");
  });

  it.each(locales)("%s shares checkout status and preserves earlier purchase terms", (locale) => {
    const service = LEGAL_SERVICES[locale];
    const refund = getRefundCopy(locale);
    const terms = getTermsCopy(locale, "Gumroad", "test");
    const hub = getLegalHubCopy(locale);
    expect(service.checkout).toContain("Lemon Squeezy");
    expect(service.checkout).toContain("Shopify");
    expect(getBillingAcceptanceCopy(locale)).toContain("Lemon Squeezy");
    expect(getBillingAcceptanceCopy(locale)).toContain("Shopify");
    expect(service.historical).toContain("Gumroad");
    expect(refund.paragraphs).toEqual([service.checkout, service.historical, service.refunds]);
    expect(terms.sections[3].body).toEqual(refund.paragraphs);
    expect(terms.sections[1].body).toContain(service.adult);
    expect(terms.sections[3].title).not.toContain("Gumroad");
    expect(hub.faq.find(({ id }) => id === "payments")?.a).toContain(service.checkout);
    expect(hub.userTermsParagraphs.join(" ")).toContain(service.historical);
    expect(refund.paragraphs.join(" ")).not.toMatch(/14|decision is final|Merchant of Record/);
    expect(refund.lastUpdatedLabel).toBe(service.updated);
  });

  it.each(locales)("%s gives the current conditional AI and payment data disclosure", (locale) => {
    const privacy = getPrivacyCopy(locale);
    const service = LEGAL_SERVICES[locale];
    expect(privacy.paragraphs).toContain(service.sharing);
    expect(privacy.paragraphs).toContain(service.ai);
    expect(privacy.paragraphs).toContain(service.paymentData);
    expect(privacy.paragraphs).toContain(service.adult);
    expect(privacy.paragraphs.join(" ")).not.toMatch(/Claude|Anthropic|OpenAI/);
    expect(getLegalHubCopy(locale).faq.find(({ id }) => id === "privacy-data")?.a).toBe(service.sharing);
  });
});

/**
 * Legal Hub FAQ localization pins.
 *
 * faqAr/faqEs/faqFr shipped as literal English clones (`faqEn.map(...)`) — a
 * failure mode that typechecks, greps clean, and passes every existence check.
 * These tests make that regression impossible to reintroduce, and pin the
 * load-bearing product facts across every locale's rewording.
 */
import { describe, it, expect } from "vitest";

import { getLegalHubCopy } from "@/lib/legal-hub-copy";

const LOCALES = ["tr", "ar", "es", "fr"] as const;

describe("legal hub FAQ localization", () => {
  const en = getLegalHubCopy("en").faq;

  it.each(LOCALES)("%s keeps the English FAQ ids in order", (locale) => {
    const faq = getLegalHubCopy(locale).faq;
    expect(faq.map((f) => f.id)).toEqual(en.map((f) => f.id));
  });

  it.each(LOCALES)("%s is not a literal English clone", (locale) => {
    const faq = getLegalHubCopy(locale).faq;
    const identical = faq.filter((f, i) => f.q === en[i]!.q || f.a === en[i]!.a);
    expect(identical.map((f) => f.id), `${locale} FAQ entries still in English`).toEqual([]);
  });

  it("Arabic FAQ is actually written in Arabic script", () => {
    for (const f of getLegalHubCopy("ar").faq) {
      expect(f.q, f.id).toMatch(/[؀-ۿ]/);
      expect(f.a, f.id).toMatch(/[؀-ۿ]/);
    }
  });

  it("every locale keeps the load-bearing facts through rewording", () => {
    for (const locale of ["en", ...LOCALES] as const) {
      const byId = new Map(getLegalHubCopy(locale).faq.map((f) => [f.id, f]));
      expect(byId.get("support")!.a, `${locale}:support`).toContain("support@tjfit.org");
      expect(byId.get("payments")!.a, `${locale}:payments`).toContain("Gumroad");
      expect(byId.get("delete")!.a, `${locale}:delete`).toMatch(/30/);
      // Free programs are 4-week starters, paid are 12-week systems — the
      // week counts must survive any rewording in every locale.
      expect(byId.get("free-vs-paid")!.a, `${locale}:weeks`).toMatch(/\b4\b/);
      expect(byId.get("free-vs-paid")!.a, `${locale}:weeks`).toMatch(/\b12\b/);
    }
  });

  it("pricing qualifiers survive per locale: two free programs, no credit card", () => {
    // A translation that drifts "two" into "several" or flips "no credit
    // card" must fail here. Patterns are diacritic-tolerant so the pending
    // TR diacritics sweep does not break them.
    const PINS: Record<string, { two: RegExp[]; noCard: RegExp }> = {
      en: {
        two: [/two complete training programs/i, /two full diet plans/i],
        noCard: /no credit card/i
      },
      tr: {
        two: [/iki tam antrenman program/i, /iki tam diyet plan/i],
        noCard: /kredi kart\S* gerekmez/i
      },
      ar: { two: [/برنامجين/, /خطتين/], noCard: /دون[^.]*بطاقة ائتمان/ },
      es: { two: [/dos programas/i, /dos planes/i], noCard: /sin tarjeta/i },
      fr: { two: [/deux programmes/i, /deux plans/i], noCard: /sans carte/i }
    };
    for (const [locale, pins] of Object.entries(PINS)) {
      const freeStart = getLegalHubCopy(locale as "en")!.faq.find((f) => f.id === "free-start")!;
      for (const re of pins.two) {
        expect(freeStart.a, `${locale}:free-start two-programs claim`).toMatch(re);
      }
      expect(freeStart.a, `${locale}:free-start no-credit-card claim`).toMatch(pins.noCard);
    }
  });
});

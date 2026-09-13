import { describe, expect, it } from "vitest";
import { buildQuoteRequest, STORE_COPY, STORE_EMAIL } from "../src/lib/store/catalog";

describe("equipment quote requests", () => {
  it("keeps the complete nine-row package and its agreed quantities in the request", () => {
    const { body } = buildQuoteRequest("en", "package", "Gölbaşı, Ankara", "Ground floor");

    expect(body.match(/^\d+\. /gm)).toHaveLength(9);
    for (const line of [
      "1. Commercial treadmill — 2 units",
      "2. Multi press — 1 unit",
      "3. Lat pulldown / low row — 1 unit",
      "4. Leg extension / curl — 1 unit",
      "5. Pec fly / rear delt — 1 unit",
      "6. Hip abductor / adductor — 1 unit",
      "7. Equipment rack — 1 unit",
      "8. TPU dumbbell set — 390 kg",
      "9. Adjustable FID bench — 2 units",
    ]) {
      expect(body).toContain(line);
    }
    expect(body).toContain("the proposed 2.5–30 kg pairs are not yet agreed");
    expect(body).toContain("VAT, freight, unloading and installation");
    expect(body).toContain("All equipment must be new");
    expect(body).toContain("no compact substitutes");
    expect(body).toContain("warranty terms for shared residential use");
    expect(body).toContain("Please confirm site access");
    expect(body).toContain("not an order or payment authorisation");
  });

  for (const locale of ["en", "tr", "ar", "es", "fr"] as const) {
    it(`preserves the complete localized package and email content for ${locale}`, () => {
      const request = buildQuoteRequest(locale, "package", "Ankara / أنقرة", "Confirm access & installation + VAT?");
      const url = new URL(request.mailto);

      expect(request.body.match(/^\d+\. /gm)).toHaveLength(9);
      for (const product of STORE_COPY[locale].products) {
        const singular = { en: "unit", tr: "adet", ar: "وحدة", es: "unidad", fr: "unité" };
        const unit = product.unit === "kg"
          ? STORE_COPY[locale].kgLabel
          : product.quantity === 1 ? singular[locale] : STORE_COPY[locale].unitLabel;
        expect(request.body).toContain(`${product.name} — ${product.quantity} ${unit}`);
      }
      expect(url.pathname).toBe(STORE_EMAIL);
      expect(url.searchParams.get("subject")).toBe(request.subject);
      expect(url.searchParams.get("body")).toBe(request.body);
      expect(Array.from(url.searchParams.keys())).toEqual(["subject", "body"]);
      expect(request.mailto).not.toContain("+");
    });
  }

  it("limits an individual request to the selected equipment while retaining its package quantity", () => {
    const request = buildQuoteRequest("en", "bench", "", "");

    expect(request.body.match(/^\d+\. /gm)).toHaveLength(1);
    expect(request.body).toContain("Adjustable FID bench — 2 units");
    expect(request.body).not.toContain("Commercial treadmill");
    expect(request.body).not.toContain("TPU dumbbell set");
    expect(request.body).toContain("Project location: To be confirmed");
  });

  it("asks to define a custom list instead of adding the full package", () => {
    const { body, subject } = buildQuoteRequest("en", "custom", "  Ankara  ", "  Please discuss the room layout.  ");

    expect(subject).toContain("Custom equipment project");
    expect(body).not.toMatch(/^\d+\. /m);
    expect(body).toContain("confirm the equipment list and quantities");
    expect(body).toContain("Project location: Ankara\n");
    expect(body).toContain("Project notes:\nPlease discuss the room layout.\n");
  });

  it("keeps pasted header-like text and reserved characters inside the body", () => {
    const notes = "Quote & review + #1?\r\nBcc: another@example.com\n&subject=changed&to=other@example.com\nالعربية — français — Türkçe";
    const request = buildQuoteRequest("fr", "rack", "Gölbaşı?cc=other@example.com", notes);
    const url = new URL(request.mailto);

    expect(url.pathname).toBe("vexafit.co@gmail.com");
    expect(url.searchParams.size).toBe(2);
    expect(url.searchParams.get("body")).toContain(notes);
    expect(url.searchParams.get("subject")).toBe(request.subject);
    expect(request.subject).not.toContain("changed");
    expect(url.hash).toBe("");
  });

  it("prepares a usable draft even when pasted text contains an unpaired UTF-16 surrogate", () => {
    const request = buildQuoteRequest("en", "custom", "", "Pasted \ud800 text");
    expect(new URL(request.mailto).searchParams.get("body")).toContain("Pasted \ufffd text");
  });
});

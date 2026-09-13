import { describe, expect, it } from "vitest";
import { ACCESSORY_COPY, buildAccessoryRequest, normalizeAccessoryQuantity } from "../src/lib/store/accessories";

describe("accessory enquiry", () => {
  it("includes only selected catalogue items and bounds quantities", () => {
    const request = buildAccessoryRequest("en", { "speed-rope": 200, "training-gloves": 2.9 }, "Ankara & İzmir");
    expect(request.count).toBe(2);
    expect(request.body).toContain("Adjustable speed rope × 20");
    expect(request.body).toContain("Training gloves × 2");
    expect(request.body).not.toContain("Ankle resistance set");
    expect(new URL(request.mailto).searchParams.get("body")).toBe(request.body);
    expect(normalizeAccessoryQuantity(Infinity)).toBe(1);
  });
  it("supports empty selection and safe malformed Unicode", () => {
    expect(buildAccessoryRequest("tr", {}, "\uD800").count).toBe(0);
    expect(() => buildAccessoryRequest("ar", { "ankle-bands": 1 }, "\uD800")).not.toThrow();
  });
  for (const locale of ["en", "tr", "ar", "fr", "es"] as const) {
    it(`preserves localized selection and non-order notice in ${locale}`, () => {
      const request = buildAccessoryRequest(locale, { "speed-rope": 1 }, "Ankara");
      expect(request.body).toContain(ACCESSORY_COPY[locale].items["speed-rope"].name);
      expect(request.body).toContain(ACCESSORY_COPY[locale].note);
    });
  }
});

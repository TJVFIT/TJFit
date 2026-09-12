import { describe, expect, it } from "vitest";
import { BUNDLES, getBundle } from "@/lib/bundles";
import { localizeBundle } from "@/lib/bundle-localization";
import { buildBundlePdf } from "@/lib/bundle-pdf-builder";
import {pdfMissingGlyphs} from '@/lib/tjai/pdf-unicode-layout';
import { getDigitalProduct } from "@/lib/payments/lemon/config";

describe("paid digital catalogue delivery", () => {
  it("generates the enriched PDF for all ten allowlisted paid bundles in every site locale", () => {
    const paid = BUNDLES.filter(bundle => !bundle.isFree);
    expect(paid).toHaveLength(10);
    for (const item of paid) {
      const bundle = getBundle(item.slug)!;
      expect(getDigitalProduct(item.slug)?.amountMinor).toBe(1000);
      for (const locale of ["en", "tr", "ar", "es", "fr"]) {
        const pdf = buildBundlePdf({ bundle, copy: localizeBundle(bundle, locale), locale, buyerName: "Test Customer", issuedAt: "2026-09-12T00:00:00Z" });
        expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(8);
        expect(pdfMissingGlyphs(pdf),item.slug+'/'+locale).toEqual([]);
        const bytes = new Uint8Array(pdf.output("arraybuffer"));
        expect(bytes.length).toBeGreaterThan(10000);
        expect(new TextDecoder().decode(bytes.slice(0,5))).toBe("%PDF-");
      }
    }
  });
});

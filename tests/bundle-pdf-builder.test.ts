import { describe, it, expect } from "vitest";

import { BUNDLES, getBundle } from "@/lib/bundles";
import { buildBundlePdf } from "@/lib/bundle-pdf-builder";

describe("buildBundlePdf", () => {
  it("returns an 8-page PDF for every bundle", () => {
    for (const bundle of BUNDLES) {
      const pdf = buildBundlePdf({ bundle });
      // jsPDF tracks page count on the internal pageNumber; call getNumberOfPages.
      expect(pdf.getNumberOfPages()).toBe(8);
    }
  });

  it("produces a non-empty arraybuffer with a %PDF- header", () => {
    const bundle = getBundle("fat-loss");
    expect(bundle).toBeDefined();
    const pdf = buildBundlePdf({ bundle: bundle! });
    const ab = pdf.output("arraybuffer") as ArrayBuffer;
    expect(ab.byteLength).toBeGreaterThan(1000);

    const head = new TextDecoder().decode(new Uint8Array(ab, 0, 8));
    expect(head.startsWith("%PDF-")).toBe(true);
  });

  it("renders buyer name + issued date metadata when provided", () => {
    const bundle = getBundle("fat-loss")!;
    const pdf = buildBundlePdf({
      bundle,
      buyerName: "Test User",
      issuedAt: "2026-05-20T00:00:00Z",
      localeLabel: "EN"
    });
    // We can't easily assert on the rendered text contents without parsing
    // the PDF, but we CAN assert the builder ran end-to-end without throwing
    // and produced a valid multi-page doc. getBundle() returns the ENRICHED
    // bundle (full content layer) — the format actually delivered to buyers —
    // which paginates to ~18-19 pages, well beyond the 8-page skeleton.
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(8);
    const ab = pdf.output("arraybuffer") as ArrayBuffer;
    expect(ab.byteLength).toBeGreaterThan(1000);
  });

  it("paginates many vs few exercises without overflowing or throwing", () => {
    // Cutting Peak and Beginner Foundations have different exercise volumes.
    // Enriched bundles flow onto as many pages as their content needs; both
    // must build cleanly and remain multi-page (no clipping to the skeleton).
    const peak = getBundle("cutting-peak")!;
    const beginner = getBundle("beginner-foundations")!;
    expect(buildBundlePdf({ bundle: peak }).getNumberOfPages()).toBeGreaterThanOrEqual(8);
    expect(buildBundlePdf({ bundle: beginner }).getNumberOfPages()).toBeGreaterThanOrEqual(8);
  });

  it("handles bundles with macros vs without consistently", () => {
    // Fat-loss meal day has macros strings; Home Starter does not. Both enriched
    // bundles must build into a valid multi-page PDF regardless.
    const tracked = getBundle("fat-loss")!;
    const untracked = getBundle("home-starter")!;
    expect(buildBundlePdf({ bundle: tracked }).getNumberOfPages()).toBeGreaterThanOrEqual(8);
    expect(buildBundlePdf({ bundle: untracked }).getNumberOfPages()).toBeGreaterThanOrEqual(8);
  });
});

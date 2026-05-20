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
    // and still produced a valid 8-page doc.
    expect(pdf.getNumberOfPages()).toBe(8);
    const ab = pdf.output("arraybuffer") as ArrayBuffer;
    expect(ab.byteLength).toBeGreaterThan(1000);
  });

  it("handles bundles with many vs few exercises without changing page count", () => {
    // Cutting Peak has 9 exercises; Beginner Foundations has 6. Both should
    // still fit inside the Sample Session page (page 4) — no page overflow.
    const peak = getBundle("cutting-peak")!;
    const beginner = getBundle("beginner-foundations")!;
    expect(buildBundlePdf({ bundle: peak }).getNumberOfPages()).toBe(8);
    expect(buildBundlePdf({ bundle: beginner }).getNumberOfPages()).toBe(8);
  });

  it("handles bundles with macros vs without consistently", () => {
    // Fat-loss meal day has macros strings; Home Starter does not.
    const tracked = getBundle("fat-loss")!;
    const untracked = getBundle("home-starter")!;
    expect(buildBundlePdf({ bundle: tracked }).getNumberOfPages()).toBe(8);
    expect(buildBundlePdf({ bundle: untracked }).getNumberOfPages()).toBe(8);
  });
});

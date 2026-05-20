import { describe, it, expect, beforeAll } from "vitest";

import { BUNDLES } from "@/lib/bundles";
import { locales } from "@/lib/i18n";
import sitemap from "@/app/sitemap";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tjfit.org";
});

describe("sitemap()", () => {
  it("emits the root, every locale landing, and every locale × bundle URL", () => {
    const entries = sitemap();
    const urls = new Set(entries.map((e) => e.url));

    // Root + every locale landing.
    expect(urls.has("https://tjfit.org/")).toBe(true);
    for (const loc of locales) {
      expect(urls.has(`https://tjfit.org/${loc}`)).toBe(true);
      expect(urls.has(`https://tjfit.org/${loc}/bundles`)).toBe(true);
    }

    // Every bundle × every locale = 60 detail URLs.
    for (const loc of locales) {
      for (const b of BUNDLES) {
        expect(urls.has(`https://tjfit.org/${loc}/bundles/${b.slug}`)).toBe(true);
      }
    }
  });

  it("does NOT emit any legacy /programs or /diets URLs", () => {
    const entries = sitemap();
    const legacy = entries.filter((e) =>
      e.url.includes("/programs") || e.url.includes("/diets")
    );
    expect(legacy).toEqual([]);
  });

  it("each entry has a lastModified, priority, and changeFrequency", () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(typeof entry.priority).toBe("number");
      expect(typeof entry.changeFrequency).toBe("string");
    }
  });

  it("root and locale landings get priority 1; bundle detail pages get lower priority than the index", () => {
    const entries = sitemap();
    const root = entries.find((e) => e.url === "https://tjfit.org/")!;
    const index = entries.find((e) => e.url === "https://tjfit.org/en/bundles")!;
    const detail = entries.find((e) => e.url.endsWith("/en/bundles/fat-loss"))!;

    expect(root.priority).toBe(1);
    expect(index.priority).toBe(0.7);
    expect(detail.priority).toBeLessThan(index.priority!);
  });
});

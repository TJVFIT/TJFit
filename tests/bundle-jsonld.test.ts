import { describe, it, expect, beforeAll } from "vitest";

import { BUNDLES, getBundle } from "@/lib/bundles";
import {
  bundleProductJsonLd,
  bundlesItemListJsonLd
} from "@/lib/bundle-jsonld";

beforeAll(() => {
  // getSiteUrl() reads NEXT_PUBLIC_SITE_URL first. Pin it so tests don't drift
  // when the dev's local .env changes the host.
  process.env.NEXT_PUBLIC_SITE_URL = "https://tjfit.org";
});

describe("bundleProductJsonLd", () => {
  it("emits a valid Schema.org Product for every bundle", () => {
    for (const bundle of BUNDLES) {
      const ld = bundleProductJsonLd(bundle, "en");

      expect(ld["@context"]).toBe("https://schema.org");
      expect(ld["@type"]).toBe("Product");
      expect(ld.name).toBe(bundle.name);
      expect(ld.description).toBe(bundle.description);
      expect(ld.category).toBe(bundle.goalLabel);
      expect(ld.url).toBe(`https://tjfit.org/en/bundles/${bundle.slug}`);
      expect(ld.image).toBe(`https://tjfit.org${bundle.heroImage}`);

      expect(ld.brand).toEqual({ "@type": "Brand", name: "TJFit" });

      expect(ld.offers["@type"]).toBe("Offer");
      expect(ld.offers.url).toBe(ld.url);
      expect(ld.offers.priceCurrency).toBe("USD");
      expect(ld.offers.price).toBe("0.00");
      expect(ld.offers.availability).toBe("https://schema.org/InStock");
    }
  });

  it("respects the locale segment in the URL", () => {
    const bundle = getBundle("fat-loss");
    expect(bundle).toBeDefined();
    const ldEn = bundleProductJsonLd(bundle!, "en");
    const ldFr = bundleProductJsonLd(bundle!, "fr");
    expect(ldEn.url).toBe("https://tjfit.org/en/bundles/fat-loss");
    expect(ldFr.url).toBe("https://tjfit.org/fr/bundles/fat-loss");
  });
});

describe("bundlesItemListJsonLd", () => {
  it("emits an ItemList covering all 12 bundles in registry order", () => {
    const ld = bundlesItemListJsonLd("en");

    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("ItemList");
    expect(ld.name).toBe("TJFit Program Bundles");
    expect(ld.itemListOrder).toBe(
      "https://schema.org/ItemListOrderAscending"
    );
    expect(ld.numberOfItems).toBe(BUNDLES.length);
    expect(ld.itemListElement).toHaveLength(BUNDLES.length);

    ld.itemListElement.forEach((item, i) => {
      const bundle = BUNDLES[i];
      expect(item["@type"]).toBe("ListItem");
      expect(item.position).toBe(i + 1);
      expect(item.name).toBe(bundle.name);
      expect(item.url).toBe(`https://tjfit.org/en/bundles/${bundle.slug}`);
    });
  });

  it("uses positions starting from 1, not 0", () => {
    const ld = bundlesItemListJsonLd("en");
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement.at(-1)!.position).toBe(BUNDLES.length);
  });
});

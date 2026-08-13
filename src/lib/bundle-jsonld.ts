/**
 * Bundle JSON-LD builders — extracted so both the Next.js page components
 * and the test suite can call them without going through the route handler.
 *
 * If you change the emitted shape, update tests/bundle-jsonld.test.ts so
 * future schema regressions are caught at test time.
 */

import { BUNDLES, type Bundle } from "@/lib/bundles";
import { localizeBundle } from "@/lib/bundle-localization";
import { getSiteUrl } from "@/lib/site-url";

export type ProductJsonLd = {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image: string;
  url: string;
  brand: { "@type": "Brand"; name: string };
  category: string;
  offers: {
    "@type": "Offer";
    url: string;
    priceCurrency: string;
    price: string;
    availability: string;
  };
};

export type FaqPageJsonLd = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }>;
};

export type BreadcrumbListJsonLd = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
};

export type ItemListJsonLd = {
  "@context": "https://schema.org";
  "@type": "ItemList";
  name: string;
  itemListOrder: string;
  numberOfItems: number;
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    url: string;
    name: string;
  }>;
};

/** Schema.org/Product blob for a single bundle's detail page. */
export function bundleProductJsonLd(bundle: Bundle, locale: string): ProductJsonLd {
  const site = getSiteUrl();
  const url = `${site}/${locale}/bundles/${bundle.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundle.name,
    description: bundle.description,
    image: `${site}${bundle.heroImage}`,
    url,
    brand: { "@type": "Brand", name: "TJFit" },
    category: bundle.goalLabel,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: bundle.priceUsd.toFixed(2),
      availability: "https://schema.org/InStock"
    }
  };
}

/**
 * Crumb labels for the two static levels of the bundle breadcrumb trail.
 * "home" mirrors dictionaries.nav.home; "bundles" mirrors the top bar's
 * TRAIN_LABELS so search-result crumbs match the visible navigation.
 */
const BREADCRUMB_LABELS: Record<string, { home: string; bundles: string }> = {
  en: { home: "Home", bundles: "Bundles" },
  tr: { home: "Ana sayfa", bundles: "Paketler" },
  ar: { home: "الرئيسية", bundles: "الحزم" },
  es: { home: "Inicio", bundles: "Bundles" },
  fr: { home: "Accueil", bundles: "Packs" }
};

/** Schema.org/BreadcrumbList blob: home → bundles → this bundle. */
export function bundleBreadcrumbJsonLd(bundle: Bundle, locale: string): BreadcrumbListJsonLd {
  const site = getSiteUrl();
  const labels = BREADCRUMB_LABELS[locale] ?? BREADCRUMB_LABELS.en;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: labels.home, item: `${site}/${locale}` },
      { "@type": "ListItem", position: 2, name: labels.bundles, item: `${site}/${locale}/bundles` },
      {
        "@type": "ListItem",
        position: 3,
        name: localizeBundle(bundle, locale).name,
        item: `${site}/${locale}/bundles/${bundle.slug}`
      }
    ]
  };
}

/** Schema.org/FAQPage blob for a bundle's factual FAQ — null when it has none. */
export function bundleFaqJsonLd(bundle: Bundle): FaqPageJsonLd | null {
  if (!bundle.faq?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: bundle.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
}

/** Schema.org/ItemList blob for the bundles index. */
export function bundlesItemListJsonLd(locale: string): ItemListJsonLd {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TJFit Program Bundles",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: BUNDLES.length,
    itemListElement: BUNDLES.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site}/${locale}/bundles/${b.slug}`,
      name: b.name
    }))
  };
}

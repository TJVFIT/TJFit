import type { MetadataRoute } from "next";

import { listBundleSlugs } from "@/lib/bundles";
import { locales } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";

/** Public marketing routes (no auth-only shells). */
const LOCALE_PATHS = [
  "",
  "bundles",
  "coaches",
  "community",
  "membership",
  "challenges",
  "transformations",
  "support",
  "feedback",
  "terms-and-conditions",
  "privacy-policy",
  "refund-policy"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];
  const bundleSlugs = listBundleSlugs();

  entries.push({
    url: `${base}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1
  });

  for (const locale of locales) {
    for (const segment of LOCALE_PATHS) {
      const path = segment === "" ? `/${locale}` : `/${locale}/${segment}`;
      entries.push({
        url: `${base}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: segment === "" ? 1 : 0.7
      });
    }

    // Per-bundle detail pages — each one is its own SEO-worthy product surface.
    for (const slug of bundleSlugs) {
      entries.push({
        url: `${base}/${locale}/bundles/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6
      });
    }
  }

  return entries;
}

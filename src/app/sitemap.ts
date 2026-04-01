import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";

/** Public marketing routes (no auth-only shells). */
const LOCALE_PATHS = [
  "",
  "programs",
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
  }

  return entries;
}

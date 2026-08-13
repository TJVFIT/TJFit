import type { MetadataRoute } from "next";

import { ROBOTS_DISALLOW_FAMILIES } from "@/lib/route-guards";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Generated from the same SSOT the middleware guards consume
      // (src/lib/route-guards.ts) so this list can never drift again —
      // the hand-maintained version was missing /blog/write and /ai.
      // Auth-gated paths 302 to /login for crawlers; explicit disallow
      // saves crawl budget.
      disallow: [
        "/api/",
        "/coming-soon",
        ...ROBOTS_DISALLOW_FAMILIES.map((p) => `/*${p}`)
      ]
    },
    sitemap: `${base}/sitemap.xml`
  };
}

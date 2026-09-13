import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const isPreviewDeployment = process.env.CONTEXT === "branch-deploy"
    || process.env.CONTEXT === "deploy-preview"
    || process.env.VERCEL_ENV === "preview";
  if (isPreviewDeployment) {
    // Crawlers must fetch a page to observe its X-Robots-Tag noindex header.
    // Do not advertise a preview sitemap or hide that header behind Disallow: /.
    return { rules: { userAgent: "*", allow: "/" } };
  }

  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Match middleware.ts auth-gated paths + the launch gate + API surface.
      // Auth-gated paths 302 to /login for crawlers; explicit disallow saves crawl budget.
      disallow: [
        "/api/",
        "/coming-soon",
        "/*/admin",
        "/*/coach-dashboard",
        "/*/dashboard",
        "/*/messages",
        "/*/feed",
        "/*/profile/edit",
        "/*/settings",
        "/*/checkout",
        "/*/purchase",
        "/*/payment",
        "/*/progress",
        "/*/verify-email",
        "/*/forgot-password"
      ]
    },
    sitemap: `${base}/sitemap.xml`
  };
}

import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

// PWA manifest (master upgrade prompt v2, Phase 9).
//
// Standalone display, dark theme, brand cyan accent. Icon paths are
// relative to /public so this works without changes to next.config.
//
// `start_url` includes a campaign tag so we can attribute installs
// in PostHog ('utm_source=pwa').

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();
  return {
    name: "TJFit — AI Fitness Programs",
    short_name: "TJFit",
    description: "Build the body. The AI builds the plan.",
    start_url: "/?utm_source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#0A0A0B",
    theme_color: "#22D3EE",
    orientation: "portrait",
    categories: ["fitness", "health", "lifestyle"],
    lang: "en",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png", purpose: "any" }
    ],
    shortcuts: [
      { name: "Programs", short_name: "Programs", url: "/en/programs" },
      { name: "TJAI", short_name: "TJAI", url: "/en/tjai" },
      { name: "TJFit Pro", short_name: "Pro", url: "/en/pro" }
    ],
    // Reference for site-search engines.
    id: siteUrl
  };
}

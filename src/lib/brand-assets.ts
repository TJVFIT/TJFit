/**
 * Canonical public paths for TJFit brand imagery (see scripts/generate-brand-assets.mjs).
 * - Replace `public/brand/tjfit-logo-source.jpg` (or `.png`) and run `npm run brand:assets` to
 *   regenerate `tjfit-logo-main.png` (flat backdrop stripped) plus icons and OG.
 */
export const BRAND = {
  logoFull: "/brand/tjfit-logo-main.png",
  logoMark: "/icons/tjfit-mark.png",
  /** Square monogram @192 — structured data / app shell */
  logoIcon192: "/icons/icon-192.png",
  ogDefault: "/og/og-default.png",
  faviconIco: "/favicon.ico"
} as const;

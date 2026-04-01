/**
 * Canonical public paths for TJFit brand imagery (see scripts/generate-brand-assets.mjs).
 * - Monogram: favicons, tabs, PWA icons, tight UI (nav below lg breakpoint, badges, cards).
 * - Full lockup: footer, auth cards, OG image, anywhere height ≥ ~56px and width allows.
 */
export const BRAND = {
  logoFull: "/brand/tjfit-logo-main.png",
  logoMark: "/icons/tjfit-mark.png",
  /** Square monogram @192 — structured data / app shell */
  logoIcon192: "/icons/icon-192.png",
  ogDefault: "/og/og-default.png",
  faviconIco: "/favicon.ico"
} as const;

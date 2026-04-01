/**
 * Canonical public paths for TJFit brand imagery (see scripts/generate-brand-assets.mjs).
 * - Monogram: favicons, tabs, PWA icons, tight UI (nav below lg breakpoint, badges, cards).
 * - Full lockup (UI): composited on opaque dark — use for footer, login, nav lg+.
 * - Source master: tjfit-logo-main.png (regenerate only; `npm run brand:assets`).
 */
export const BRAND = {
  logoFull: "/brand/tjfit-logo-ui.png",
  logoMark: "/icons/tjfit-mark.png",
  /** Square monogram @192 — structured data / app shell */
  logoIcon192: "/icons/icon-192.png",
  ogDefault: "/og/og-default.png",
  faviconIco: "/favicon.ico"
} as const;

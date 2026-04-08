/**
 * Canonical public paths for TJFit brand imagery.
 * - Primary lockup: `public/logo/tjfit-brand.png` (transparent; official artwork).
 * - Legacy SVGs remain in `public/logo/` for tooling / optional raster scripts.
 * - Rasters (favicon, PWA, OG): run `npm run logo:rasters` when regenerating from SVGs.
 */
export const BRAND = {
  logoIcon: "/logo/tjfit-brand.png",
  logoIconWhite: "/logo/tjfit-brand.png",
  logoFull: "/logo/tjfit-brand.png",
  /** Square monogram @192 — structured data / PWA */
  logoIcon192: "/icons/icon-192.png",
  ogDefault: "/og-image.jpg",
  faviconIco: "/favicon.ico"
} as const;

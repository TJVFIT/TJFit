/**
 * Canonical public paths for TJFit brand imagery.
 * - Vector marks: `public/logo/tj-icon.svg`, `public/logo/tj-full.svg` (see `components/ui/Logo.tsx`).
 * - Rasters (favicon, PWA, OG): run `npm run logo:rasters` after editing SVGs.
 * - Legacy PNG pipeline: `npm run brand:assets` (optional; `generate-brand-assets.mjs`).
 */
export const BRAND = {
  logoIcon: "/logo/tj-icon.svg",
  /** Same mark as icon; optional alias for tooling */
  logoIconWhite: "/logo/tj-icon-white.svg",
  logoFull: "/logo/tj-full.svg",
  /** Square monogram @192 — structured data / PWA */
  logoIcon192: "/icons/icon-192.png",
  ogDefault: "/og-image.png",
  faviconIco: "/favicon.ico"
} as const;

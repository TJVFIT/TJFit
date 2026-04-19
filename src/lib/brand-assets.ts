/**
 * Canonical brand imagery.
 * - Bump `LOGO_CACHE` when you replace `public/brand/logo-main.png` so browsers pick up the new file.
 * - `BRAND_LOGO_SRC` is for UI (`<img>`) with a cache-busting query.
 * - `BRAND.*` uses stable paths (no query) for JSON-LD / metadata.
 */
export const LOGO_CACHE = "2026041901";

const LOGO_MAIN_STABLE = "/brand/logo-main.png";
const LOGO_MARK_STABLE = "/brand/logo-mark.png";

/** Use in Logo, intro, etc. — query busts CDN/browser cache when the file changes */
export const BRAND_LOGO_SRC = `${LOGO_MAIN_STABLE}?v=${LOGO_CACHE}`;

export const BRAND = {
  logoIcon: LOGO_MARK_STABLE,
  logoIconWhite: LOGO_MARK_STABLE,
  logoFull: LOGO_MAIN_STABLE,
  logoIcon192: "/icons/icon-192.png",
  logoIcon512: "/icons/icon-512.png",
  appleTouchIcon: "/apple-touch-icon.png",
  ogDefault: "/og-image.jpg",
  faviconIco: "/favicon.ico"
} as const;

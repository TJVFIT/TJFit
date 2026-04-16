/**
 * Canonical brand imagery.
 * - Bump `LOGO_CACHE` when you replace `public/assets/hero/logo-tjfit-3d.png` so browsers pick up the new file.
 * - `BRAND_LOGO_SRC` is for UI (`<img>`) with a cache-busting query.
 * - `BRAND.*` uses stable paths (no query) for JSON-LD / metadata.
 */
export const LOGO_CACHE = "2026041702";

const LOGO_3D_STABLE = "/assets/hero/logo-tjfit-3d.png";

/** Use in Logo, intro, etc. — query busts CDN/browser cache when the file changes */
export const BRAND_LOGO_SRC = `${LOGO_3D_STABLE}?v=${LOGO_CACHE}`;

export const BRAND = {
  logoIcon: LOGO_3D_STABLE,
  logoIconWhite: LOGO_3D_STABLE,
  logoFull: LOGO_3D_STABLE,
  logoIcon192: "/icons/icon-192.png",
  ogDefault: "/og-image.jpg",
  faviconIco: "/favicon.ico"
} as const;

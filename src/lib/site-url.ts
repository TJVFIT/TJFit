/**
 * Canonical site origin for SEO, sitemap, and robots.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL — set in .env.local or Vercel if you need an explicit override.
 * 2. Vercel production — VERCEL_PROJECT_PRODUCTION_URL (custom domain or *.vercel.app), no env setup needed.
 * 3. VERCEL_URL — preview deployments and non-production.
 */
function stripTrailingSlash(s: string) {
  return s.replace(/\/$/, "");
}

/** Host-only env values (e.g. tjfit.org) become https://… so `new URL()` in metadata never throws. */
function ensureHttpUrl(origin: string): string {
  const t = stripTrailingSlash(origin.trim());
  if (!t) return "http://localhost:3000";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return ensureHttpUrl(explicit);
  }

  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (process.env.VERCEL_ENV === "production" && prodHost) {
    return ensureHttpUrl(prodHost);
  }

  if (process.env.VERCEL_URL) {
    return ensureHttpUrl(process.env.VERCEL_URL);
  }

  return "http://localhost:3000";
}

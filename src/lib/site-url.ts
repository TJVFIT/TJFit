/**
 * Canonical site origin for SEO, sitemap, and robots.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL — explicit, context-specific deployment origin.
 * 2. Netlify URL in production, DEPLOY_PRIME_URL for previews.
 * 3. Vercel production domain or preview URL for existing installations.
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

  if (process.env.NETLIFY === "true") {
    const host = process.env.CONTEXT === "production"
      ? process.env.URL
      : process.env.DEPLOY_PRIME_URL ?? process.env.DEPLOY_URL;
    if (host?.trim()) return ensureHttpUrl(host);
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

/**
 * Canonical site origin for metadata, sitemap, and robots.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL — set in .env.local or Vercel if you need an explicit override.
 * 2. Vercel production — VERCEL_PROJECT_PRODUCTION_URL (custom domain or *.vercel.app), no env setup needed.
 * 3. VERCEL_URL — preview deployments and non-production.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (process.env.VERCEL_ENV === "production" && prodHost) {
    return `https://${prodHost.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

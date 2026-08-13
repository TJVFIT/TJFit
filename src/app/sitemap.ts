import type { MetadataRoute } from "next";

import { listBundleSlugs } from "@/lib/bundles";
import { locales } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// Bounds how often the dynamic coach/blog queries re-run (Next regenerates
// the sitemap route at most hourly). Note: unlike a normal ISR page, Next's
// metadata-route wrapper still sends `Cache-Control: max-age=0,
// must-revalidate` for sitemap.xml, so this throttles DB load, not edge
// caching. New coaches/posts still appear within ~1h without a redeploy.
export const revalidate = 3600;

/** Public marketing routes (no auth-only shells). */
const LOCALE_PATHS = [
  "",
  "bundles",
  "tjai",
  "tjai/credits",
  "calculator",
  "coaches",
  "become-a-coach",
  "community",
  "membership",
  "blog",
  "challenges",
  "transformations",
  "support",
  "feedback",
  "press",
  "leaderboard",
  "equipment",
  "start",
  "terms-and-conditions",
  "privacy-policy",
  "refund-policy"
] as const;

/**
 * Dynamic detail slugs — coach usernames + published blog post ids. Best
 * effort: any DB hiccup (or missing env at build) degrades to the static
 * sitemap instead of failing the route.
 */
async function listDynamicSlugs(): Promise<{ coaches: string[]; posts: string[] }> {
  const admin = getSupabaseServerClient();
  if (!admin) return { coaches: [], posts: [] };
  try {
    const [{ data: coachRows }, { data: postRows }] = await Promise.all([
      admin.from("profiles").select("username").eq("role", "coach").not("username", "is", null).limit(200),
      admin
        .from("community_blog_posts")
        .select("id")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(500)
    ]);
    return {
      coaches: (coachRows ?? []).map((r) => String(r.username)).filter(Boolean),
      posts: (postRows ?? []).map((r) => String(r.id)).filter(Boolean)
    };
  } catch {
    return { coaches: [], posts: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];
  const bundleSlugs = listBundleSlugs();
  const { coaches, posts } = await listDynamicSlugs();

  entries.push({
    url: `${base}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1
  });

  for (const locale of locales) {
    for (const segment of LOCALE_PATHS) {
      const path = segment === "" ? `/${locale}` : `/${locale}/${segment}`;
      entries.push({
        url: `${base}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: segment === "" ? 1 : 0.7
      });
    }

    // Per-bundle detail pages — each one is its own SEO-worthy product surface.
    for (const slug of bundleSlugs) {
      entries.push({
        url: `${base}/${locale}/bundles/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6
      });
    }

    // Coach profiles + published blog posts (WP-SEO-01), same per-locale
    // pattern as bundles.
    for (const username of coaches) {
      entries.push({
        url: `${base}/${locale}/coaches/${encodeURIComponent(username)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6
      });
    }
    for (const id of posts) {
      entries.push({
        url: `${base}/${locale}/blog/${encodeURIComponent(id)}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5
      });
    }
  }

  return entries;
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogViewBeacon } from "@/components/blog-view-beacon";
import { PremiumPageShell } from "@/components/premium";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// ISR (WP-INFRA-07): article content changes rarely; an hour of staleness is
// fine for body, view count, and related posts. View counting itself moved to
// the /api/blog/posts/[id]/view beacon so this page needs no per-request
// headers() and can actually cache. See docs/runbooks/caching-policy.md.
// The empty generateStaticParams is load-bearing: without it Next 14 keeps a
// dynamic-param route in per-request SSR and never registers the ISR cache
// (verified against .next/prerender-manifest.json).
export const revalidate = 3600;
export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

type BlogPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  author_name: string;
  author_type: string;
  category: string;
  created_at: string;
  read_time_minutes: number;
  views: number;
};

type RelatedPost = {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string | null;
  views: number;
  created_at: string;
};

export default async function BlogDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = requireLocaleParam(params.locale);
  const admin = getSupabaseServerClient();
  if (!admin) notFound();

  // Direct DB query from the server component — previously this page made
  // two HTTP roundtrips to its own /api/blog/posts routes (with cache:
  // no-store), which paid JSON serde + intra-region network on every visit.
  // SQL now runs in-process; view-increment moves here too.
  const { data: post } = await admin
    .from("community_blog_posts")
    .select("id,author_id,title,content,author_name,author_type,created_at,category,views,read_time_minutes")
    .eq("id", params.slug)
    .eq("status", "published")
    .maybeSingle();
  if (!post) notFound();
  const postRow = post as BlogPost;

  // Views render from the row (≤1h stale under ISR); the live increment
  // happens client-side via BlogViewBeacon → /api/blog/posts/[id]/view.
  const views = Number(postRow.views ?? 0);

  // Related posts — same category first, fall back to most recent.
  const { data: sameCategoryRaw } = await admin
    .from("community_blog_posts")
    .select("id,title,content,author_name,category,views,created_at,read_time_minutes,cover_image_url")
    .eq("status", "published")
    .neq("id", postRow.id)
    .eq("category", postRow.category ?? "")
    .order("views", { ascending: false })
    .limit(3);
  let related: RelatedPost[] = ((sameCategoryRaw ?? []) as RelatedPost[]).slice();
  if (related.length < 3) {
    const exclude = new Set<string>([postRow.id, ...related.map((p) => String(p.id))]);
    const { data: fallback } = await admin
      .from("community_blog_posts")
      .select("id,title,content,author_name,category,views,created_at,read_time_minutes,cover_image_url")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(8);
    for (const row of (fallback ?? []) as RelatedPost[]) {
      if (exclude.has(String(row.id))) continue;
      related.push(row);
      if (related.length >= 3) break;
    }
  }
  related = related.slice(0, 3);

  return (
    <PremiumPageShell>
      <BlogViewBeacon postId={postRow.id} />
      <article className="rounded-2xl border border-divider bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-purple-300">{postRow.category ?? "General"}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">
          <span className="tj-title-shimmer">{postRow.title}</span>
        </h1>
        <p className="mt-2 text-xs text-dim">
          {postRow.author_name} · {postRow.author_type} · {postRow.read_time_minutes ?? 5} min · {views} views ·{" "}
          {new Date(postRow.created_at).toLocaleDateString(locale)}
        </p>
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-bright">{postRow.content}</div>
      </article>
      <section className="mt-8 rounded-xl border border-divider bg-surface p-5">
        <h2 className="text-lg font-semibold text-white">You might also like</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {related.map((item) => (
            <article key={item.id} className="group/related rounded-lg border border-divider bg-surface-2 p-3 transition-[border-color,box-shadow] duration-200 hover:border-purple-300/30 hover:shadow-[0_0_22px_rgba(168,85,247,0.1)]">
              <p className="text-[11px] uppercase tracking-[0.12em] text-purple-300">{item.category ?? "General"}</p>
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 line-clamp-3 text-xs text-muted">{item.content}</p>
              <Link href={`/${locale}/blog/${item.id}`} className="mt-3 inline-flex text-xs text-accent transition-colors duration-200 hover:text-purple-50">
                Read →
              </Link>
            </article>
          ))}
        </div>
        <Link href={`/${locale}/blog`} className="mt-4 inline-flex text-sm text-accent transition-colors duration-200 hover:text-purple-50">
          Back to all posts →
        </Link>
      </section>
    </PremiumPageShell>
  );
}

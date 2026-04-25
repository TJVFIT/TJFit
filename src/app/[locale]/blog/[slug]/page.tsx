import Link from "next/link";
import { notFound } from "next/navigation";

import { PremiumPageShell } from "@/components/premium";
import { requireLocaleParam } from "@/lib/require-locale";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = requireLocaleParam(params.locale);
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/blog/posts/${params.slug}`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) notFound();
  const data = await res.json();
  const post = data.post as {
    id: string;
    title: string;
    content: string;
    author_name: string;
    author_type: string;
    category: string;
    created_at: string;
    read_time_minutes: number;
    views: number;
    cover_image_url?: string | null;
  };
  const relatedRes = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/blog/posts/related?id=${encodeURIComponent(post.id)}&category=${encodeURIComponent(post.category ?? "")}`,
    { cache: "no-store" }
  ).catch(() => null);
  const relatedData = relatedRes && relatedRes.ok ? await relatedRes.json().catch(() => ({})) : {};
  const related = (relatedData.posts ?? []) as Array<{
    id: string;
    title: string;
    content: string;
    author_name: string;
    category: string | null;
    views: number;
    created_at: string;
  }>;

  return (
    <PremiumPageShell>
      <article className="rounded-2xl border border-divider bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">{post.category ?? "General"}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">{post.title}</h1>
        <p className="mt-2 text-xs text-dim">
          {post.author_name} · {post.author_type} · {post.read_time_minutes ?? 5} min · {post.views ?? 0} views · {new Date(post.created_at).toLocaleDateString(locale)}
        </p>
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-bright">{post.content}</div>
      </article>
      <section className="mt-8 rounded-xl border border-divider bg-surface p-5">
        <h2 className="text-lg font-semibold text-white">You might also like</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {related.map((item) => (
            <article key={item.id} className="rounded-lg border border-divider bg-surface-2 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-300">{item.category ?? "General"}</p>
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 line-clamp-3 text-xs text-muted">{item.content}</p>
              <Link href={`/${locale}/blog/${item.id}`} className="mt-3 inline-flex text-xs text-accent">
                Read →
              </Link>
            </article>
          ))}
        </div>
        <Link href={`/${locale}/blog`} className="mt-4 inline-flex text-sm text-accent">
          Back to all posts →
        </Link>
      </section>
    </PremiumPageShell>
  );
}


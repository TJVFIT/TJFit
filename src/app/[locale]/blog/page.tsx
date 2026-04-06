"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PremiumPageShell } from "@/components/premium";
import { Locale } from "@/lib/i18n";

type Post = {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_type: "team" | "coach" | "user" | "ai";
  created_at: string;
  category: string | null;
  views: number;
  read_time_minutes: number | null;
  is_featured: boolean;
};

const FILTERS = ["all", "Training", "Nutrition", "Mindset", "Recovery", "Lifestyle"];

export default function BlogPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    void fetch(`/api/blog/posts?category=${encodeURIComponent(category)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setPosts((d.posts ?? []) as Post[]));
  }, [category]);

  const featured = useMemo(() => posts.find((p) => p.is_featured) ?? posts[0], [posts]);
  const regular = useMemo(() => posts.filter((p) => p.id !== featured?.id), [posts, featured?.id]);

  return (
    <PremiumPageShell>
      <header className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <h1 className="text-3xl font-extrabold text-white">TJFit Blog</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">Training, nutrition, mindset, recovery, and lifestyle content.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setCategory(filter)}
              className={`rounded-full border px-3 py-1.5 text-xs ${category === filter ? "border-cyan-400/40 text-[#22D3EE]" : "border-[#1E2028] text-[#A1A1AA]"}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {featured ? (
        <article className="mt-6 rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[#22D3EE]">Featured Post</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{featured.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm text-[#A1A1AA]">{featured.content}</p>
          <p className="mt-3 text-xs text-[#52525B]">
            {featured.author_name} · {featured.category ?? "General"} · {featured.read_time_minutes ?? 5} min read · {new Date(featured.created_at).toLocaleDateString(locale)}
          </p>
          <Link href={`/${locale}/blog/${featured.id}`} className="mt-4 inline-flex text-sm font-semibold text-[#22D3EE]">
            Read article →
          </Link>
        </article>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {regular.map((post) => (
          <article key={post.id} className="rounded-xl border border-[#1E2028] bg-[#111215] p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-300">{post.category ?? "General"}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{post.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-[#A1A1AA]">{post.content}</p>
            <p className="mt-3 text-xs text-[#52525B]">
              {post.author_name} · {post.read_time_minutes ?? 5} min · {post.views ?? 0} views
            </p>
            <Link href={`/${locale}/blog/${post.id}`} className="mt-3 inline-flex text-xs font-semibold text-[#22D3EE]">
              Open →
            </Link>
          </article>
        ))}
      </div>
    </PremiumPageShell>
  );
}


"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getCommunityCopy, getHomePageSectionCopy } from "@/lib/launch-copy";

type BlogPost = {
  id: string;
  title: string;
  content: string;
  author_name: string;
  image_url?: string | null;
  is_pinned?: boolean;
  created_at: string;
};

function excerpt(text: string, max = 140) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function HomeBlogsPreview({ locale }: { locale: Locale }) {
  const home = getHomePageSectionCopy(locale);
  const copy = getCommunityCopy(locale);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await fetch("/api/community/blogs", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!ok) return;
        const list = Array.isArray(data.posts) ? data.posts : [];
        setPosts(list.slice(0, 4));
      } catch {
        if (ok) setPosts([]);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  const hrefAll = `/${locale}/community?tab=blogs`;

  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{home.blogsTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">{home.blogsSubtitle}</p>
        </div>
        <Link
          href={hrefAll}
          className="shrink-0 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-accent/40 hover:bg-white/5"
        >
          {home.blogsViewAll}
        </Link>
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-sm text-zinc-400">{copy.loadingBlogs}</div>
      ) : posts.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-sm text-zinc-400">{copy.noBlogs}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={hrefAll}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/5 transition hover:border-accent/35 hover:bg-white/[0.07]"
            >
              {post.image_url ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{post.author_name}</span>
                  {post.is_pinned ? (
                    <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                      {copy.pinned}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white group-hover:text-zinc-100">{post.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">{excerpt(post.content)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

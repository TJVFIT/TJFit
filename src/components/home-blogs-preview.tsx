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

function excerpt(text: string | null | undefined, max = 140) {
  const t = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function isSafeImageSrc(src: string) {
  try {
    const u = new URL(src);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeBlogPosts(raw: unknown): BlogPost[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row): BlogPost | null => {
      if (!row || typeof row !== "object") return null;
      const p = row as Record<string, unknown>;
      const id = String(p.id ?? "").trim();
      if (!id) return null;
      return {
        id,
        title: String(p.title ?? ""),
        content: String(p.content ?? ""),
        author_name: String(p.author_name ?? ""),
        image_url:
          typeof p.image_url === "string" && p.image_url.length > 0 && isSafeImageSrc(p.image_url)
            ? p.image_url
            : null,
        is_pinned: Boolean(p.is_pinned),
        created_at: String(p.created_at ?? "")
      };
    })
    .filter((p): p is BlogPost => p !== null);
}

function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-surface/30">
      <div className="aspect-[16/9] animate-pulse bg-white/[0.06]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-white/[0.08]" />
        <div className="h-5 w-full max-w-[280px] animate-pulse rounded bg-white/[0.1]" />
        <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.05]" />
      </div>
    </div>
  );
}

export function HomeBlogsPreview({
  locale,
  sectionClassName = ""
}: {
  locale: Locale;
  sectionClassName?: string;
}) {
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
        setPosts(normalizeBlogPosts(data.posts).slice(0, 4));
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
    <section className={sectionClassName || "mt-10"}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{home.blogsTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-faint">{home.blogsSubtitle}</p>
        </div>
        <Link
          href={hrefAll}
          className="lux-btn-secondary shrink-0 rounded-lg px-5 py-2.5 text-sm font-medium"
        >
          {home.blogsViewAll}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-faint">{copy.loadingBlogs}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((k) => (
              <BlogCardSkeleton key={k} />
            ))}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-surface/20 px-6 py-12 text-center">
          <p className="text-sm text-faint">{copy.noBlogs}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={hrefAll}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-surface-elevated/40 transition hover:border-white/[0.11]"
            >
              {post.image_url ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <Image
                    src={post.image_url}
                    alt={post.title || "Blog"}
                    fill
                    className="object-cover transition duration-500 group-hover:opacity-95"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-faint">
                  <span>{post.author_name}</span>
                  {post.is_pinned ? (
                    <span className="rounded border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-200">
                      {copy.pinned}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white group-hover:text-bright">{post.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{excerpt(post.content)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

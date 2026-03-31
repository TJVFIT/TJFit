"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Challenge, Transformation, communityPosts, challenges, transformations } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import Image from "next/image";
import { getCommunityCopy } from "@/lib/launch-copy";

type TabKey = "threads" | "challenges" | "transformations" | "blogs";

type BlogPost = {
  id: string;
  author_id: string;
  author_name: string;
  author_role: "coach" | "admin";
  title: string;
  content: string;
  is_pinned?: boolean;
  image_path?: string | null;
  image_url?: string | null;
  created_at: string;
};

function safeTab(value: string | null): TabKey {
  if (value === "challenges" || value === "transformations" || value === "blogs") return value;
  return "threads";
}

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale).format(date);
}

function ThreadsPanel({ posts, emptyLabel }: { posts: typeof communityPosts; emptyLabel: string }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{post.author}</span>
            <span className="uppercase tracking-[0.2em]">{post.role}</span>
          </div>
          <p className="mt-3 text-sm text-zinc-200">{post.content}</p>
          <p className="mt-3 text-xs text-zinc-500">
            {post.likes} likes · {post.comments} comments
          </p>
        </article>
      ))}
    </div>
  );
}

function ChallengesPanel({ items, emptyLabel }: { items: Challenge[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.slug} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.category}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
          <p className="mt-2 text-sm text-zinc-300">{item.description}</p>
          <p className="mt-3 text-xs text-zinc-500">
            {item.duration} · {item.participants} joined
          </p>
        </article>
      ))}
    </div>
  );
}

function TransformationsPanel({
  items,
  emptyLabel,
  verifiedLabel,
  unverifiedLabel
}: {
  items: Transformation[];
  emptyLabel: string;
  verifiedLabel: string;
  unverifiedLabel: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.slug} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.category}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{item.userName}</h3>
          <p className="mt-2 text-sm text-zinc-300">{item.story}</p>
          <p className="mt-3 text-xs text-zinc-500">{item.verified ? verifiedLabel : unverifiedLabel}</p>
        </article>
      ))}
    </div>
  );
}

export function CommunityHub({
  locale,
  initialTab
}: {
  locale: Locale;
  initialTab?: string | null;
}) {
  const router = useRouter();
  const { role, user } = useAuth();
  const canPublishBlog = role === "coach" || role === "admin";
  const isAdmin = role === "admin";
  const copy = getCommunityCopy(locale);
  const tabs: { key: TabKey; label: string }[] = [
    { key: "threads", label: copy.tabs.threads },
    { key: "challenges", label: copy.tabs.challenges },
    { key: "transformations", label: copy.tabs.transformations },
    { key: "blogs", label: copy.tabs.blogs }
  ];

  const [activeTab, setActiveTab] = useState<TabKey>(safeTab(initialTab ?? null));
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogError, setBlogError] = useState("");
  const [blogSuccess, setBlogSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [translatedView, setTranslatedView] = useState<Record<string, { title: string; content: string }>>({});
  const [translateLoadingId, setTranslateLoadingId] = useState<string | null>(null);
  const [targetLocaleByPost, setTargetLocaleByPost] = useState<Record<string, Locale>>({});

  useEffect(() => {
    setActiveTab(safeTab(initialTab ?? null));
  }, [initialTab]);

  useEffect(() => {
    let mounted = true;
    const loadBlogs = async () => {
      setLoadingBlogs(true);
      try {
        const res = await fetch("/api/community/blogs", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!mounted) return;
        if (!res.ok) {
          setBlogError(data.error ?? copy.blogLoadFailed);
          setPosts([]);
        } else {
          setPosts(Array.isArray(data.posts) ? data.posts : []);
          setBlogError("");
        }
      } catch {
        if (mounted) {
          setBlogError(copy.blogLoadFailed);
          setPosts([]);
        }
      }
      if (mounted) {
        setLoadingBlogs(false);
      }
    };
    loadBlogs();
    return () => {
      mounted = false;
    };
  }, [copy.blogLoadFailed]);

  const reloadBlogs = async () => {
    const reload = await fetch("/api/community/blogs", { credentials: "include" });
    const reloadData = await reload.json().catch(() => ({}));
    if (!reload.ok) {
      throw new Error(String(reloadData.error ?? copy.blogLoadFailed));
    }
    setPosts(Array.isArray(reloadData.posts) ? reloadData.posts : []);
  };

  const submitBlog = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setBlogError("");
    setBlogSuccess("");
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("content", content);
      if (image) {
        formData.set("image", image);
      }
      const res = await fetch("/api/community/blogs", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBlogError(data.error ?? copy.publishFailed);
      } else {
        setBlogSuccess(copy.publishSuccess);
        setTitle("");
        setContent("");
        setImage(null);
        await reloadBlogs();
      }
    } catch {
      setBlogError(copy.publishFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBlog = async (blogId: string) => {
    setActionLoadingId(blogId);
    setBlogError("");
    setBlogSuccess("");
    try {
      const res = await fetch("/api/community/blogs", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBlogError(data.error ?? copy.deleteFailed);
        return;
      }
      setBlogSuccess(copy.deleteSuccess);
      setTranslatedView((prev) => {
        const next = { ...prev };
        delete next[blogId];
        return next;
      });
      await reloadBlogs();
    } catch {
      setBlogError(copy.deleteFailed);
    } finally {
      setActionLoadingId(null);
    }
  };

  const togglePin = async (blogId: string, shouldPin: boolean) => {
    setActionLoadingId(blogId);
    setBlogError("");
    setBlogSuccess("");
    try {
      const res = await fetch("/api/community/blogs", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, action: shouldPin ? "pin" : "unpin" })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBlogError(data.error ?? copy.pinFailed);
        return;
      }
      setBlogSuccess(shouldPin ? copy.pinSuccess : copy.unpinSuccess);
      await reloadBlogs();
    } catch {
      setBlogError(copy.pinFailed);
    } finally {
      setActionLoadingId(null);
    }
  };

  const translateBlog = async (blogId: string) => {
    const targetLocale = targetLocaleByPost[blogId] ?? "tr";
    setTranslateLoadingId(blogId);
    setBlogError("");
    try {
      const res = await fetch("/api/community/blogs/translate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, targetLocale })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBlogError(data.error ?? copy.translationFailed);
        return;
      }
      setTranslatedView((prev) => ({
        ...prev,
        [blogId]: {
          title: String(data.translatedTitle ?? ""),
          content: String(data.translatedContent ?? "")
        }
      }));
    } catch {
      setBlogError(copy.translationFailed);
    } finally {
      setTranslateLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge">{copy.badge}</span>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              {copy.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-7 overflow-x-auto">
          <div className="flex min-w-max gap-2 pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  router.replace(`/${locale}/community?tab=${tab.key}`, { scroll: false });
                }}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  activeTab === tab.key
                    ? "border-accent/60 bg-accent/15 text-white"
                    : "border-white/15 bg-white/5 text-zinc-300 hover:border-white/25"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {activeTab === "threads" && <ThreadsPanel posts={communityPosts} emptyLabel={copy.threadsEmpty} />}
          {activeTab === "challenges" && <ChallengesPanel items={challenges} emptyLabel={copy.challengesEmpty} />}
          {activeTab === "transformations" && (
            <TransformationsPanel
              items={transformations}
              emptyLabel={copy.transformationsEmpty}
              verifiedLabel={copy.verified}
              unverifiedLabel={copy.unverified}
            />
          )}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              {canPublishBlog && (
                <form onSubmit={submitBlog} className="rounded-[24px] border border-white/10 bg-black/30 p-5">
                  <p className="text-sm font-medium text-white">{copy.publishTitle}</p>
                  <div className="mt-4 space-y-3">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={copy.titlePlaceholder}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent/40"
                      required
                    />
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={copy.contentPlaceholder}
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent/40"
                      required
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full border border-accent/40 bg-accent/15 px-4 py-2 text-sm text-white transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? copy.publishing : copy.publish}
                    </button>
                    {blogError ? <p className="text-xs text-red-300">{blogError}</p> : null}
                    {blogSuccess ? <p className="text-xs text-green-300">{blogSuccess}</p> : null}
                  </div>
                </form>
              )}

              {loadingBlogs ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
                  {copy.loadingBlogs}
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
                  {copy.noBlogs}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <article key={post.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                        <span>
                          {post.author_name} · {post.author_role}
                        </span>
                        <span className="flex items-center gap-2">
                          {post.is_pinned ? (
                            <span className="rounded-full border border-amber-300/50 bg-amber-400/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-200">
                              {copy.pinned}
                            </span>
                          ) : null}
                          {formatDate(post.created_at, locale)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {translatedView[post.id]?.title ?? post.title}
                      </h3>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">
                        {translatedView[post.id]?.content ?? post.content}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <select
                          value={targetLocaleByPost[post.id] ?? "tr"}
                          onChange={(e) =>
                            setTargetLocaleByPost((prev) => ({
                              ...prev,
                              [post.id]: e.target.value as Locale
                            }))
                          }
                          className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-200"
                        >
                          <option value="tr">{copy.turkish}</option>
                          <option value="ar">{copy.arabic}</option>
                          <option value="es">{copy.spanish}</option>
                          <option value="fr">{copy.french}</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => translateBlog(post.id)}
                          disabled={translateLoadingId === post.id}
                          className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/10 disabled:opacity-60"
                        >
                          {translateLoadingId === post.id ? copy.translating : copy.translate}
                        </button>
                        {translatedView[post.id] ? (
                          <button
                            type="button"
                            onClick={() =>
                              setTranslatedView((prev) => {
                                const next = { ...prev };
                                delete next[post.id];
                                return next;
                              })
                            }
                            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10"
                          >
                            {copy.showOriginal}
                          </button>
                        ) : null}
                        {(isAdmin || post.author_id === user?.id) && (
                          <button
                            type="button"
                            onClick={() => deleteBlog(post.id)}
                            disabled={actionLoadingId === post.id}
                            className="rounded-full border border-red-300/35 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-400/10 disabled:opacity-60"
                          >
                            {actionLoadingId === post.id ? copy.working : copy.delete}
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => togglePin(post.id, !post.is_pinned)}
                            disabled={actionLoadingId === post.id}
                            className="rounded-full border border-amber-300/35 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-amber-400/10 disabled:opacity-60"
                          >
                            {actionLoadingId === post.id
                              ? copy.working
                              : post.is_pinned
                                ? copy.unpin
                                : copy.pin}
                          </button>
                        )}
                      </div>
                      {post.image_url ? (
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          width={1200}
                          height={700}
                          unoptimized
                          className="mt-4 max-h-96 w-full rounded-2xl object-cover"
                        />
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

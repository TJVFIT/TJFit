"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Challenge, Transformation, communityPosts, challenges, transformations } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import Image from "next/image";

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

const tabs: { key: TabKey; label: string }[] = [
  { key: "threads", label: "Threads" },
  { key: "challenges", label: "Challenges" },
  { key: "transformations", label: "Transformations" },
  { key: "blogs", label: "Blogs" }
];

function safeTab(value: string | null): TabKey {
  if (value === "challenges" || value === "transformations" || value === "blogs") return value;
  return "threads";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function ThreadsPanel({ posts }: { posts: typeof communityPosts }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        Threads are being prepared. Your community feed will appear here.
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

function ChallengesPanel({ items }: { items: Challenge[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        No active challenges yet.
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

function TransformationsPanel({ items }: { items: Transformation[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        No public transformations yet.
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
          <p className="mt-3 text-xs text-zinc-500">{item.verified ? "Verified" : "Unverified"}</p>
        </article>
      ))}
    </div>
  );
}

export function CommunityHub() {
  const { role, user } = useAuth();
  const canPublishBlog = role === "coach" || role === "admin";
  const isAdmin = role === "admin";

  const [activeTab, setActiveTab] = useState<TabKey>("threads");
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
    const params = new URLSearchParams(window.location.search);
    setActiveTab(safeTab(params.get("tab")));
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBlogs = async () => {
      setLoadingBlogs(true);
      const res = await fetch("/api/community/blogs", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!mounted) return;
      if (!res.ok) {
        setBlogError(data.error ?? "Could not load blogs.");
        setPosts([]);
      } else {
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setBlogError("");
      }
      setLoadingBlogs(false);
    };
    loadBlogs();
    return () => {
      mounted = false;
    };
  }, []);

  const reloadBlogs = async () => {
    const reload = await fetch("/api/community/blogs", { credentials: "include" });
    const reloadData = await reload.json().catch(() => ({}));
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
        setBlogError(data.error ?? "Failed to publish blog.");
      } else {
        setBlogSuccess("Blog post published.");
        setTitle("");
        setContent("");
        setImage(null);
        await reloadBlogs();
      }
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
        setBlogError(data.error ?? "Failed to delete blog.");
        return;
      }
      setBlogSuccess("Blog deleted.");
      setTranslatedView((prev) => {
        const next = { ...prev };
        delete next[blogId];
        return next;
      });
      await reloadBlogs();
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
        setBlogError(data.error ?? "Failed to update pin.");
        return;
      }
      setBlogSuccess(shouldPin ? "Blog pinned." : "Blog unpinned.");
      await reloadBlogs();
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
        setBlogError(data.error ?? "Translation failed.");
        return;
      }
      setTranslatedView((prev) => ({
        ...prev,
        [blogId]: {
          title: String(data.translatedTitle ?? ""),
          content: String(data.translatedContent ?? "")
        }
      }));
    } finally {
      setTranslateLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge">Community Hub</span>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Community</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Threads, challenges, and transformations are now organized in one place.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
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

        <div className="mt-8">
          {activeTab === "threads" && <ThreadsPanel posts={communityPosts} />}
          {activeTab === "challenges" && <ChallengesPanel items={challenges} />}
          {activeTab === "transformations" && <TransformationsPanel items={transformations} />}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              {canPublishBlog && (
                <form onSubmit={submitBlog} className="rounded-[24px] border border-white/10 bg-black/30 p-5">
                  <p className="text-sm font-medium text-white">Publish a blog post</p>
                  <div className="mt-4 space-y-3">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent/40"
                      required
                    />
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your post..."
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
                      {submitting ? "Publishing..." : "Publish"}
                    </button>
                    {blogError ? <p className="text-xs text-red-300">{blogError}</p> : null}
                    {blogSuccess ? <p className="text-xs text-green-300">{blogSuccess}</p> : null}
                  </div>
                </form>
              )}

              {loadingBlogs ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
                  Loading blogs...
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
                  No blog posts yet.
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
                              Pinned
                            </span>
                          ) : null}
                          {formatDate(post.created_at)}
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
                          <option value="tr">Turkish</option>
                          <option value="ar">Arabic</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => translateBlog(post.id)}
                          disabled={translateLoadingId === post.id}
                          className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/10 disabled:opacity-60"
                        >
                          {translateLoadingId === post.id ? "Translating..." : "Translate"}
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
                            Show original
                          </button>
                        ) : null}
                        {(isAdmin || post.author_id === user?.id) && (
                          <button
                            type="button"
                            onClick={() => deleteBlog(post.id)}
                            disabled={actionLoadingId === post.id}
                            className="rounded-full border border-red-300/35 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-400/10 disabled:opacity-60"
                          >
                            {actionLoadingId === post.id ? "Working..." : "Delete"}
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
                              ? "Working..."
                              : post.is_pinned
                                ? "Unpin"
                                : "Pin"}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Transformation, communityPosts, transformations } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import Image from "next/image";
import { getCommunityCopy } from "@/lib/launch-copy";

type TabKey = "threads" | "challenges" | "groups" | "transformations" | "blogs";

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
  if (value === "threads" || value === "challenges" || value === "groups" || value === "transformations" || value === "blogs") {
    return value;
  }
  return "blogs";
}

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale).format(date);
}

function ThreadsPanel({
  posts,
  emptyLabel,
  reactions,
  onReact
}: {
  posts: typeof communityPosts;
  emptyLabel: string;
  reactions: Record<string, Record<string, number>>;
  onReact: (postId: string, key: string) => void;
}) {
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
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["fire", "🔥"],
              ["muscle", "💪"],
              ["crown", "👑"],
              ["lightning", "⚡"],
              ["target", "🎯"]
            ].map(([key, emoji]) => (
              <button
                key={key}
                type="button"
                onClick={() => onReact(post.id, key)}
                className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-zinc-200 hover:border-cyan-300/40"
              >
                {emoji} {reactions[post.id]?.[key] ?? 0}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            {post.likes} likes · {post.comments} comments
          </p>
        </article>
      ))}
    </div>
  );
}

function ChallengesPanel({ items, emptyLabel }: { items: Array<{ slug: string; category: string; name: string; description: string; duration: string; participants: number }>; emptyLabel: string }) {
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

type DbChallenge = {
  id: string;
  title: string;
  description: string;
  metric_type: string;
  end_date: string;
  participants: number;
  joined: boolean;
  todayLogged: boolean;
  todayValue: number | null;
  leaderboard: Array<{ userId: string; total: number }>;
  myRank: number | null;
  coin_prize_1st: number;
  coin_prize_2nd: number;
  coin_prize_3rd: number;
};

function ChallengesLivePanel({
  items,
  onJoin,
  onLog
}: {
  items: DbChallenge[];
  onJoin: (challengeId: string) => void;
  onLog: (challengeId: string, value: number) => void;
}) {
  const [logValueById, setLogValueById] = useState<Record<string, string>>({});
  if (items.length === 0) {
    return <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">No active challenges.</div>;
  }
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-zinc-300">{item.description}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {item.metric_type} · ends {item.end_date} · {item.participants} joined
              </p>
              <p className="mt-1 text-xs text-cyan-300">
                TJCOIN prizes: {item.coin_prize_1st}/{item.coin_prize_2nd}/{item.coin_prize_3rd}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onJoin(item.id)}
              className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-100"
            >
              {item.joined ? "Joined" : "Join Challenge"}
            </button>
          </div>
          {item.joined ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={logValueById[item.id] ?? ""}
                onChange={(e) => setLogValueById((prev) => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Daily value"
                type="number"
                min={1}
                className="w-36 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                disabled={item.todayLogged}
                onClick={() => onLog(item.id, Number(logValueById[item.id] ?? 0))}
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-zinc-100 disabled:opacity-50"
              >
                {item.todayLogged ? `Logged today ${item.todayValue ?? ""}` : "Log Today"}
              </button>
            </div>
          ) : null}
          <details className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
            <summary className="cursor-pointer text-sm text-zinc-200">Leaderboard (Top 10)</summary>
            <div className="mt-3 space-y-1 text-sm">
              {item.leaderboard.map((row, idx) => (
                <p key={`${row.userId}-${idx}`} className="text-zinc-300">
                  #{idx + 1} · {row.total}
                </p>
              ))}
              {item.myRank ? <p className="mt-2 text-cyan-300">Your rank: #{item.myRank}</p> : null}
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}

type DbGroup = { id: string; name: string; description: string | null; memberCount: number; joined: boolean };

function GroupsPanel({
  groups,
  onToggle
}: {
  groups: DbGroup[];
  onToggle: (groupId: string, action: "join" | "leave") => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map((group) => (
        <article key={group.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">{group.name}</h3>
          <p className="mt-2 text-sm text-zinc-300">{group.description ?? ""}</p>
          <p className="mt-2 text-xs text-zinc-500">{group.memberCount} members</p>
          <button
            type="button"
            onClick={() => onToggle(group.id, group.joined ? "leave" : "join")}
            className="mt-4 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-100"
          >
            {group.joined ? "Leave Group" : "Join Group"}
          </button>
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
    { key: "blogs", label: copy.tabs.blogs },
    { key: "threads", label: copy.tabs.threads },
    { key: "challenges", label: copy.tabs.challenges },
    { key: "groups", label: "Groups" },
    { key: "transformations", label: copy.tabs.transformations }
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
  const [challengeItems, setChallengeItems] = useState<DbChallenge[]>([]);
  const [groupItems, setGroupItems] = useState<DbGroup[]>([]);
  const [threadReactions, setThreadReactions] = useState<Record<string, Record<string, number>>>({});

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

  const loadChallenges = async () => {
    const res = await fetch("/api/community/challenges", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setChallengeItems(Array.isArray(data.challenges) ? data.challenges : []);
  };

  const loadGroups = async () => {
    const res = await fetch("/api/community/groups", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setGroupItems(Array.isArray(data.groups) ? data.groups : []);
  };

  useEffect(() => {
    if (activeTab === "challenges") void loadChallenges();
    if (activeTab === "groups") void loadGroups();
  }, [activeTab]);

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

  const joinChallenge = async (challengeId: string) => {
    await fetch("/api/community/challenges/join", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId })
    });
    await loadChallenges();
  };

  const logChallenge = async (challengeId: string, value: number) => {
    await fetch("/api/community/challenges/log", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, value })
    });
    await loadChallenges();
  };

  const toggleGroup = async (groupId: string, action: "join" | "leave") => {
    await fetch("/api/community/groups", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, action })
    });
    await loadGroups();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-6 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.75)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="lux-badge inline-flex">{copy.badge}</span>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.title}</h1>
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
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "border-cyan-400/35 bg-cyan-500/10 text-white shadow-[0_0_24px_-10px_rgba(34,211,238,0.2)]"
                    : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {activeTab === "threads" && (
            <ThreadsPanel
              posts={communityPosts}
              emptyLabel={copy.threadsEmpty}
              reactions={threadReactions}
              onReact={(postId, key) =>
                setThreadReactions((prev) => ({
                  ...prev,
                  [postId]: { ...(prev[postId] ?? {}), [key]: Number(prev[postId]?.[key] ?? 0) + 1 }
                }))
              }
            />
          )}
          {activeTab === "challenges" && <ChallengesLivePanel items={challengeItems} onJoin={joinChallenge} onLog={logChallenge} />}
          {activeTab === "groups" && <GroupsPanel groups={groupItems} onToggle={toggleGroup} />}
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
                            <span className="rounded border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-violet-200">
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
                            className="rounded-full border border-cyan-400/30 px-3 py-1.5 text-xs text-cyan-200 transition hover:bg-cyan-400/10 disabled:opacity-60"
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

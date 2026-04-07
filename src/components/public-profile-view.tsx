"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { FollowButton } from "@/components/ui/follow-button";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";
import { isValidUsername } from "@/lib/username";

type ProfileData = {
  id: string;
  self: boolean;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  role: string;
  banner_color: string;
  display_badge_key: string | null;
  privacy_settings: {
    show_streak: boolean;
    show_coins: boolean;
    show_programs: boolean;
    show_posts: boolean;
  };
};

export function PublicProfileView({ locale, username }: { locale: Locale; username: string }) {
  const s = getSocialCopy(locale);
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [following, setFollowing] = useState(false);
  const [stats, setStats] = useState<{
    streak: number | null;
    coins: number | null;
    programs_done: number | null;
    blog_posts: number | null;
    followers: number;
    following: number;
  } | null>(null);
  const [badges, setBadges] = useState<Array<{ badge_key: string; earned_at: string }>>([]);
  const [activeProgram, setActiveProgram] = useState<{ program_slug: string; week: number; completion_percent: number } | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<Array<{ id: string; title: string; created_at: string; views: number }>>([]);
  const [recentPosts, setRecentPosts] = useState<Array<{ id: string; title: string; content: string; created_at: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState<null | "followers" | "following">(null);
  const [listItems, setListItems] = useState<Array<{ id: string; username: string; display_name: string; avatar_url: string | null }>>([]);

  useEffect(() => {
    const run = async () => {
      const u = decodeURIComponent(username).trim();
      if (!u || !isValidUsername(u)) {
        setError(s.profileNotFound);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(u)}`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : s.profileNotFound);
          return;
        }
        const raw = data.profile as ProfileData | null | undefined;
        if (!raw || typeof raw.id !== "string") {
          setError(s.profileNotFound);
          return;
        }
        setProfile(raw);
        setFollowing(Boolean(data.following));
        setStats(data.stats ?? null);
        setBadges((data.badges ?? []) as Array<{ badge_key: string; earned_at: string }>);
        setActiveProgram((data.active_program ?? null) as { program_slug: string; week: number; completion_percent: number } | null);
        setRecentBlogs((data.recent_blog_posts ?? []) as Array<{ id: string; title: string; created_at: string; views: number }>);
        setRecentPosts((data.recent_community_posts ?? []) as Array<{ id: string; title: string; content: string; created_at: string }>);
      } catch {
        setError(s.errorGeneric);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [s.errorGeneric, s.profileNotFound, username]);

  const roleLabel = (r?: string) => {
    if (r === "coach") return s.roleCoach;
    if (r === "admin") return s.roleAdmin;
    return s.roleUser;
  };

  if (error && !profile && !loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:border-white/25"
            onClick={() => window.location.reload()}
          >
            {s.retryLabel}
          </button>
          <Link href={`/${locale}/profile/search`} className="text-sm text-cyan-300/90 hover:underline">
            {s.backToSearch}
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="mx-auto max-w-sm space-y-6">
          <div className="tj-skeleton tj-shimmer mx-auto h-20 w-20 rounded-full" />
          <div className="tj-skeleton tj-shimmer mx-auto h-5 w-[160px] rounded-md" />
          <div className="tj-skeleton tj-shimmer mx-auto h-3.5 w-[240px] rounded-md" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="tj-skeleton tj-shimmer mx-auto h-10 w-[60px] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statList = [
    { label: "Streak", value: stats?.streak, icon: "🔥" },
    { label: "TJCOIN", value: stats?.coins, icon: "⚡" },
    { label: "Programs Done", value: stats?.programs_done, icon: "🏆" },
    { label: "Blog Posts", value: stats?.blog_posts, icon: "📝" }
  ];

  const badgePreview = badges.slice(0, 6);
  const bannerColor = profile.banner_color || "#111215";

  const openList = async (kind: "followers" | "following") => {
    setShowList(kind);
    const res = await fetch(`/api/follow/${kind}?user_id=${encodeURIComponent(profile.id)}&page=1`, {
      credentials: "include"
    });
    const data = await res.json().catch(() => ({}));
    setListItems((data.items ?? []) as Array<{ id: string; username: string; display_name: string; avatar_url: string | null }>);
  };

  return (
    <>
      <AmbientBackground variant="violet" intensity="low" />
      <div className="relative z-[1] mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-[#1E2028] bg-[#111215]">
          <div
            className="h-[140px] sm:h-[200px]"
            style={{ background: `linear-gradient(180deg, ${bannerColor}, #09090B)` }}
          />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-cyan-300/45 bg-[#18191E] ring-2 ring-[#09090B]">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt="" fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[#22D3EE]">
                      {(profile.display_name || profile.username || "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{profile.display_name || profile.username}</h1>
                  <p className="text-sm text-zinc-500">@{profile.username}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cyan-300">{roleLabel(profile.role)}</p>
                  {profile.bio ? <p className="mt-2 max-w-xl text-sm text-zinc-300">{profile.bio}</p> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.self ? (
                  <Link href={`/${locale}/profile/edit`} className="rounded-full border border-white/20 px-5 py-2 text-sm text-white">
                    Edit Profile
                  </Link>
                ) : user ? (
                  <FollowButton
                    targetUserId={profile.id}
                    initialFollowing={following}
                    initialCount={stats?.followers ?? 0}
                    onCountChange={(count) => setStats((prev) => (prev ? { ...prev, followers: count } : prev))}
                  />
                ) : (
                  <Link href={`/${locale}/login`} className="rounded-full border border-white/20 px-5 py-2 text-sm text-white">
                    Sign in to Follow
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-3 text-sm text-zinc-400">
              <button type="button" className="hover:text-white" onClick={() => void openList("followers")}>
                {stats?.followers ?? 0} Followers
              </button>{" "}
              ·{" "}
              <button type="button" className="hover:text-white" onClick={() => void openList("following")}>
                {stats?.following ?? 0} Following
              </button>
            </div>
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-[#1E2028] bg-[#111215] p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {statList.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-[#0E0F12] px-3 py-3">
                <p className="text-xl font-bold text-white">
                  {item.icon} {item.value ?? "—"}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#1E2028] bg-[#111215] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Badges</h2>
            <span className="text-xs text-zinc-500">{badges.length}</span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {badgePreview.map((badge) => (
              <div key={`${badge.badge_key}-${badge.earned_at}`} className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-200">
                {badge.badge_key}
              </div>
            ))}
            {badgePreview.length === 0 ? <p className="text-sm text-zinc-500">No badges yet</p> : null}
          </div>
        </section>

        {activeProgram ? (
          <section className="mt-5 rounded-2xl border border-[#1E2028] bg-[#111215] p-4">
            <h2 className="text-sm font-semibold text-white">Active Program</h2>
            <p className="mt-1 text-sm text-zinc-300">
              {activeProgram.program_slug} - Week {activeProgram.week} of 12
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1E2028]">
              <div className="h-full bg-cyan-400" style={{ width: `${activeProgram.completion_percent}%` }} />
            </div>
          </section>
        ) : null}

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-4">
            <h2 className="text-sm font-semibold text-white">Recent Blog Posts</h2>
            <div className="mt-3 space-y-2">
              {recentBlogs.map((post) => (
                <div key={post.id} className="rounded-lg border border-white/10 bg-[#0E0F12] p-3">
                  <p className="text-sm text-white">{post.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(post.created_at).toLocaleDateString(locale)} · {post.views} views
                  </p>
                </div>
              ))}
              {recentBlogs.length === 0 ? <p className="text-sm text-zinc-500">No posts</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-4">
            <h2 className="text-sm font-semibold text-white">Recent Community Posts</h2>
            <div className="mt-3 space-y-2">
              {recentPosts.map((post) => (
                <div key={post.id} className="rounded-lg border border-white/10 bg-[#0E0F12] p-3">
                  <p className="line-clamp-2 text-sm text-zinc-300">{post.content || post.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(post.created_at).toLocaleDateString(locale)}</p>
                </div>
              ))}
              {recentPosts.length === 0 ? <p className="text-sm text-zinc-500">No posts</p> : null}
            </div>
          </div>
        </section>

        {showList ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1E2028] bg-[#111215] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{showList === "followers" ? "Followers" : "Following"}</h3>
                <button type="button" className="text-zinc-400" onClick={() => setShowList(null)}>
                  Close
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {listItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}/profile/${encodeURIComponent(item.username)}`}
                    className="block rounded-lg border border-white/10 bg-[#0E0F12] p-3 text-sm text-white"
                  >
                    {item.display_name || item.username}
                    <span className="ml-1 text-zinc-500">@{item.username}</span>
                  </Link>
                ))}
                {listItems.length === 0 ? <p className="text-sm text-zinc-500">No users</p> : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

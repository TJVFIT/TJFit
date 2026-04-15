import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isValidUsername } from "@/lib/username";

type PrivacySettings = {
  show_streak?: boolean;
  show_coins?: boolean;
  show_programs?: boolean;
  show_posts?: boolean;
};

const DEFAULT_PRIVACY: Required<PrivacySettings> = {
  show_streak: true,
  show_coins: true,
  show_programs: true,
  show_posts: true
};

export async function GET(_request: NextRequest, { params }: { params: { username: string } }) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const rawUsername = decodeURIComponent(params.username ?? "").trim();
  if (!rawUsername || !isValidUsername(rawUsername)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  let viewerId: string | null = null;
  try {
    const browser = createServerSupabaseClient();
    const { data: { user } } = await browser.auth.getUser();
    viewerId = user?.id ?? null;
  } catch {
    viewerId = null;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id,username,display_name,avatar_url,bio,role,banner_color,current_streak,is_verified,privacy_settings,display_badge_key")
    .eq("username_normalized", rawUsername.toLowerCase())
    .maybeSingle();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const isSelf = viewerId === profile.id;
  const privacy = { ...DEFAULT_PRIVACY, ...(profile.privacy_settings as PrivacySettings | null) };

  const [wallet, programOrders, blogPosts, followers, following, badges, activeProgress, recentBlogsMerged] =
    await Promise.all([
      admin.from("tjfit_coin_wallets").select("balance").eq("user_id", profile.id).maybeSingle(),
      admin.from("program_orders").select("id", { head: true, count: "exact" }).eq("user_id", profile.id).eq("status", "paid"),
      admin.from("community_blog_posts").select("id", { head: true, count: "exact" }).eq("author_id", profile.id).eq("status", "published"),
      admin.from("user_follows").select("follower_id", { head: true, count: "exact" }).eq("following_id", profile.id),
      admin.from("user_follows").select("following_id", { head: true, count: "exact" }).eq("follower_id", profile.id),
      admin.from("user_badges").select("badge_key,earned_at").eq("user_id", profile.id).order("earned_at", { ascending: false }).limit(24),
      admin
        .from("program_progress")
        .select("program_slug,week_number,is_complete,completed_at")
        .eq("user_id", profile.id)
        .order("week_number", { ascending: false })
        .limit(24),
      // Single query replaces two duplicate blog queries
      admin
        .from("community_blog_posts")
        .select("id,title,content,created_at,views")
        .eq("author_id", profile.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3)
    ]);

  const completedDays = (activeProgress.data ?? []).filter((row) => Boolean(row.is_complete)).length;
  const maxWeek = Math.max(1, ...((activeProgress.data ?? []).map((row) => Number(row.week_number ?? 1))));
  const activeProgramSlug = activeProgress.data?.[0]?.program_slug ?? null;
  const completionPercent = Math.min(100, Math.round((completedDays / 84) * 100));

  const stats = {
    streak: isSelf || privacy.show_streak ? Number(profile.current_streak ?? 0) : null,
    coins: isSelf || privacy.show_coins ? Number(wallet.data?.balance ?? 0) : null,
    programs_done: isSelf || privacy.show_programs ? Number(programOrders.count ?? 0) : null,
    blog_posts: isSelf || privacy.show_posts ? Number(blogPosts.count ?? 0) : null,
    followers: Number(followers.count ?? 0),
    following: Number(following.count ?? 0)
  };

  const { data: relation } = viewerId
    ? await admin
        .from("user_follows")
        .select("follower_id")
        .eq("follower_id", viewerId)
        .eq("following_id", profile.id)
        .maybeSingle()
    : { data: null };

  type BlogRow = { id: string; title: string; content: string; created_at: string; views: number };
  const blogRows: BlogRow[] = recentBlogsMerged.data ?? [];

  return NextResponse.json({
    profile: {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      role: profile.role,
      is_verified: profile.is_verified,
      banner_color: profile.banner_color ?? "#111215",
      display_badge_key: profile.display_badge_key,
      privacy_settings: privacy,
      self: isSelf
    },
    following: Boolean(relation),
    stats,
    badges: badges.data ?? [],
    active_program:
      activeProgramSlug && (isSelf || privacy.show_programs)
        ? { program_slug: activeProgramSlug, week: maxWeek, completion_percent: completionPercent }
        : null,
    recent_blog_posts: isSelf || privacy.show_posts
      ? blogRows.map((p) => ({ id: p.id, title: p.title, created_at: p.created_at, views: p.views }))
      : [],
    recent_community_posts: isSelf || privacy.show_posts
      ? blogRows.map((p) => ({ id: p.id, title: p.title, content: p.content, created_at: p.created_at }))
      : []
  });
}

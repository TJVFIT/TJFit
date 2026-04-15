import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type LeaderboardType = "coins" | "streaks" | "blog" | "coaches" | "programs";
type LeaderboardPeriod = "week" | "alltime";
type SnapshotRow = {
  user_id: string;
  coins_earned: number | null;
  streak_days: number | null;
  blog_views: number | null;
  posts_count: number | null;
  programs_done: number | null;
  is_coach?: boolean | null;
  week_start?: string | null;
};

function getMetricColumn(type: LeaderboardType) {
  switch (type) {
    case "streaks":
      return "streak_days";
    case "blog":
    case "coaches":
      return "blog_views";
    case "programs":
      return "programs_done";
    case "coins":
    default:
      return "coins_earned";
  }
}

export async function GET(request: NextRequest) {
  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "coins") as LeaderboardType;
  const period = (searchParams.get("period") ?? "week") as LeaderboardPeriod;
  const isCoachOnly = type === "coaches";
  const metric = getMetricColumn(type);

  const weekStart = new Date();
  weekStart.setUTCHours(0, 0, 0, 0);
  weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));

  let query = adminClient
    .from("leaderboard_weekly_snapshots")
    .select("user_id,coins_earned,streak_days,blog_views,posts_count,programs_done,is_coach,week_start");

  if (isCoachOnly) {
    query = query.eq("is_coach", true);
  }
  if (period === "week") {
    query = query.eq("week_start", weekStart.toISOString().slice(0, 10));
  }

  const { data, error } = await query.order(metric, { ascending: false }).limit(100);
  let rows: SnapshotRow[] = (data ?? []) as SnapshotRow[];
  if (error) {
    // Graceful fallback when snapshot table is missing/unseeded.
    const { data: fallbackProfiles } = await adminClient
      .from("profiles")
      .select("id,username,full_name,avatar_url,is_verified,current_streak")
      .order("current_streak", { ascending: false })
      .limit(100);
    rows = (fallbackProfiles ?? []).map((row) => ({
      user_id: row.id,
      coins_earned: 0,
      streak_days: row.current_streak ?? 0,
      blog_views: 0,
      posts_count: 0,
      programs_done: 0,
      is_coach: false,
      week_start: null
    }));
  }
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = userIds.length
    ? await adminClient.from("profiles").select("id,username,full_name,avatar_url,is_verified,current_streak").in("id", userIds)
    : { data: [] as Array<Record<string, unknown>> };
  const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const items = rows.map((row, idx) => {
    const profile: any = profileById.get(row.user_id) ?? {};
    return {
      rank: idx + 1,
      userId: row.user_id,
      username: profile.username ?? null,
      displayName: profile.full_name ?? profile.username ?? "TJFit User",
      avatarUrl: profile.avatar_url ?? null,
      isVerified: Boolean(profile.is_verified),
      streak: profile.current_streak ?? row.streak_days ?? 0,
      coinsEarned: row.coins_earned ?? 0,
      blogViews: row.blog_views ?? 0,
      postsCount: row.posts_count ?? 0,
      programsDone: row.programs_done ?? 0
    };
  });

  // Keep current user visible even if outside top 100.
  let me: Record<string, unknown> | null = null;
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      me = items.find((item) => item.userId === user.id) ?? null;
      if (!me) {
        const { data: mine } = await adminClient
          .from("leaderboard_weekly_snapshots")
          .select("user_id,coins_earned,streak_days,blog_views,posts_count,programs_done")
          .eq("user_id", user.id)
          .order(metric, { ascending: false })
          .limit(1)
          .maybeSingle();
        if (mine) {
          const { data: myProfile } = await adminClient
            .from("profiles")
            .select("id,username,full_name,avatar_url,is_verified,current_streak")
            .eq("id", user.id)
            .maybeSingle();
          me = {
            rank: null,
            userId: user.id,
            username: myProfile?.username ?? null,
            displayName: myProfile?.full_name ?? myProfile?.username ?? "You",
            avatarUrl: myProfile?.avatar_url ?? null,
            isVerified: Boolean(myProfile?.is_verified),
            streak: myProfile?.current_streak ?? mine.streak_days ?? 0,
            coinsEarned: mine.coins_earned ?? 0,
            blogViews: mine.blog_views ?? 0,
            postsCount: mine.posts_count ?? 0,
            programsDone: mine.programs_done ?? 0
          };
        }
      }
    }
  } catch {
    // no-op for anonymous requests
  }

  const res = NextResponse.json({ type, period, items, me })

  // Leaderboard is the same for everyone — cache for 2 min, serve stale for 5 min
  res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
  return res;
}

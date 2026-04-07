import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type FeedItem = {
  id: string;
  user_id: string;
  type: string;
  created_at: string;
  message: string;
  meta?: Record<string, unknown>;
};

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const cursor = request.nextUrl.searchParams.get("cursor");

  const { data: follows } = await admin.from("user_follows").select("following_id").eq("follower_id", auth.user.id);
  const followedIds = (follows ?? []).map((row) => row.following_id);
  if (followedIds.length === 0) {
    return NextResponse.json({ items: [], next_cursor: null });
  }

  const [workouts, progress, blogs, streaks, badges] = await Promise.all([
    admin
      .from("workout_logs")
      .select("id,user_id,program_slug,day_label,logged_at")
      .in("user_id", followedIds)
      .order("logged_at", { ascending: false })
      .limit(100),
    admin
      .from("program_progress")
      .select("id,user_id,program_slug,week_number,completed_at,is_complete")
      .in("user_id", followedIds)
      .eq("is_complete", true)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(100),
    admin
      .from("community_blog_posts")
      .select("id,author_id,title,created_at,status")
      .in("author_id", followedIds)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("profiles")
      .select("id,current_streak,updated_at")
      .in("id", followedIds)
      .in("current_streak", [7, 30, 100]),
    admin
      .from("user_badges")
      .select("id,user_id,badge_key,earned_at")
      .in("user_id", followedIds)
      .order("earned_at", { ascending: false })
      .limit(100)
  ]);

  const items: FeedItem[] = [];

  for (const row of workouts.data ?? []) {
    items.push({
      id: `workout:${row.id}`,
      user_id: row.user_id,
      type: "workout_day",
      created_at: row.logged_at,
      message: `completed ${row.day_label ?? "a workout day"} of ${row.program_slug ?? "a program"}`,
      meta: { program_slug: row.program_slug, day_label: row.day_label }
    });
  }
  for (const row of progress.data ?? []) {
    items.push({
      id: `progress:${row.id}`,
      user_id: row.user_id,
      type: "program_week",
      created_at: row.completed_at as string,
      message: `finished Week ${row.week_number} of ${row.program_slug} 🎉`,
      meta: { program_slug: row.program_slug, week_number: row.week_number }
    });
  }
  for (const row of blogs.data ?? []) {
    items.push({
      id: `blog:${row.id}`,
      user_id: row.author_id,
      type: "blog_post",
      created_at: row.created_at,
      message: `published: ${row.title}`,
      meta: { post_id: row.id, title: row.title }
    });
  }
  for (const row of streaks.data ?? []) {
    items.push({
      id: `streak:${row.id}:${row.updated_at}`,
      user_id: row.id,
      type: "streak_milestone",
      created_at: row.updated_at ?? new Date().toISOString(),
      message: `hit a ${row.current_streak}-day streak! 🔥`,
      meta: { streak: row.current_streak }
    });
  }
  for (const row of badges.data ?? []) {
    items.push({
      id: `badge:${row.id}`,
      user_id: row.user_id,
      type: "badge",
      created_at: row.earned_at,
      message: `earned the ${row.badge_key} badge 🏆`,
      meta: { badge_key: row.badge_key }
    });
  }

  let filtered = items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  if (cursor) {
    filtered = filtered.filter((item) => item.created_at < cursor);
  }
  filtered = filtered.slice(0, PAGE_SIZE);

  const profileIds = [...new Set(filtered.map((item) => item.user_id))];
  const { data: profiles } = profileIds.length
    ? await admin.from("profiles").select("id,username,display_name,avatar_url").in("id", profileIds)
    : { data: [] as any[] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const withProfile = filtered.map((item) => ({
    ...item,
    profile: profileMap.get(item.user_id) ?? null
  }));

  const nextCursor = filtered.length === PAGE_SIZE ? filtered[filtered.length - 1].created_at : null;
  return NextResponse.json({ items: withProfile, next_cursor: nextCursor });
}

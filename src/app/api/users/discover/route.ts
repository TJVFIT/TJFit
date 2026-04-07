import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [topEarners, activeCoaches, newMembers, similarGoal] = await Promise.all([
    admin
      .from("leaderboard_weekly_snapshots")
      .select("user_id,coins_earned")
      .order("coins_earned", { ascending: false })
      .limit(5),
    admin
      .from("profiles")
      .select("id,username,display_name,avatar_url,current_streak,role")
      .eq("role", "coach")
      .order("updated_at", { ascending: false })
      .limit(6),
    admin
      .from("profiles")
      .select("id,username,display_name,avatar_url,current_streak,created_at")
      .neq("id", auth.user.id)
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("profiles")
      .select("id,username,display_name,avatar_url,current_streak")
      .neq("id", auth.user.id)
      .order("current_streak", { ascending: false })
      .limit(8)
  ]);

  const topIds = (topEarners.data ?? []).map((x) => x.user_id);
  const { data: topProfiles } = topIds.length
    ? await admin
        .from("profiles")
        .select("id,username,display_name,avatar_url,current_streak")
        .in("id", topIds)
    : { data: [] as any[] };
  const topMap = new Map((topProfiles ?? []).map((row) => [row.id, row]));
  const top = (topEarners.data ?? []).map((row) => ({
    ...(topMap.get(row.user_id) ?? { id: row.user_id }),
    coins_earned: row.coins_earned
  }));

  return NextResponse.json({
    top_earners: top,
    coaches: activeCoaches.data ?? [],
    new_members: newMembers.data ?? [],
    similar_goal: similarGoal.data ?? []
  });
}

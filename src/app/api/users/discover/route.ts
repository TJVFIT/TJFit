import { NextResponse } from "next/server";

import { maskPrivateStreak } from "@/lib/profile-privacy";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ProfileLite = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  current_streak: number | null;
};

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Look up the viewer's most recent plan to extract their fitness goal.
  // The previous `similar_goal` query just returned high-streak users with
  // no goal matching at all — misleading given the UI labels it "Similar
  // Goals". Falls back to high-streak if the viewer has no plan yet.
  const { data: viewerPlan } = await admin
    .from("saved_tjai_plans")
    .select("answers_json")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const viewerGoal =
    viewerPlan?.answers_json && typeof viewerPlan.answers_json === "object"
      ? (viewerPlan.answers_json as Record<string, unknown>).s2_goal
      : null;

  const [topEarners, activeCoaches, newMembers, candidatePlans, streakFallback] = await Promise.all([
    admin
      .from("leaderboard_weekly_snapshots")
      .select("user_id,streak_days")
      .order("streak_days", { ascending: false })
      .limit(5),
    admin
      .from("profiles")
      .select("id,username,display_name,avatar_url,current_streak,is_private,role")
      .eq("role", "coach")
      .order("updated_at", { ascending: false })
      .limit(6),
    admin
      .from("profiles")
      .select("id,username,display_name,avatar_url,current_streak,is_private,created_at")
      .neq("id", auth.user.id)
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(8),
    // For "similar goal": pull the most recent 80 plans across all users
    // (excluding viewer) and filter in JS to those matching the viewer's
    // goal. 80-row window is a soft cap on the fetch — plans rarely change
    // so this surfaces ~80 distinct recent planners.
    viewerGoal
      ? admin
          .from("saved_tjai_plans")
          .select("user_id,answers_json,created_at")
          .neq("user_id", auth.user.id)
          .order("created_at", { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [] as Array<{ user_id: string; answers_json: unknown }> }),
    // Fallback when viewer has no plan yet: return high-streak users
    // (preserving the prior behavior so the section isn't empty).
    !viewerGoal
      ? admin
          .from("profiles")
          .select("id,username,display_name,avatar_url,current_streak,is_private")
          .neq("id", auth.user.id)
          .order("current_streak", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] as ProfileLite[] })
  ]);

  // similar_goal: prefer real goal matching when the viewer has a plan;
  // otherwise fall back to top-streak users to keep the UI populated.
  let similarGoalUsers: ProfileLite[] = [];
  if (viewerGoal && candidatePlans.data) {
    const matchedUserIds = new Set<string>();
    for (const row of candidatePlans.data) {
      if (matchedUserIds.size >= 8) break;
      const candidateGoal =
        row.answers_json && typeof row.answers_json === "object"
          ? (row.answers_json as Record<string, unknown>).s2_goal
          : null;
      if (candidateGoal === viewerGoal && typeof row.user_id === "string") {
        matchedUserIds.add(row.user_id);
      }
    }
    if (matchedUserIds.size > 0) {
      const { data: matchedProfiles } = await admin
        .from("profiles")
        .select("id,username,display_name,avatar_url,current_streak,is_private")
        .in("id", [...matchedUserIds]);
      similarGoalUsers = (matchedProfiles ?? []) as ProfileLite[];
    }
  } else {
    similarGoalUsers = (streakFallback.data ?? []) as ProfileLite[];
  }

  const topIds = (topEarners.data ?? []).map((x) => x.user_id);
  const { data: topProfiles } = topIds.length
    ? await admin
        .from("profiles")
        .select("id,username,display_name,avatar_url,current_streak,is_private")
        .in("id", topIds)
    : { data: [] as ProfileLite[] };
  const topMap = new Map((topProfiles ?? []).map((row) => [row.id, row]));
  const top = (topEarners.data ?? []).map((row) => ({
    ...(topMap.get(row.user_id) ?? { id: row.user_id })
  }));

  return NextResponse.json({
    top_earners: top,
    coaches: activeCoaches.data ?? [],
    new_members: newMembers.data ?? [],
    similar_goal: similarGoalUsers
  });
}

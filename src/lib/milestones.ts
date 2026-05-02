import type { SupabaseClient } from "@supabase/supabase-js";

// Milestone helper (master upgrade prompt v3, Phase 5.4).
//
// Pairs with `user_number_milestones` table (migration
// 20260502150000) and the `<NumberDisplay earned />` primitive.
//
// Two operations:
//   * `markMilestoneReached(supabase, userId, key)` — idempotent
//     insert. Safe to call from a workout-complete handler or any
//     other detector; conflicts with the composite primary key are
//     swallowed.
//   * `loadRecentMilestones(supabase, userId, withinMs)` — used by
//     server components to know which numbers should bloom on this
//     render (default lookback: 60 seconds).

export type MilestoneKey =
  | "first_workout"
  | "first_streak_7"
  | "first_streak_30"
  | "first_streak_100"
  | "first_streak_365"
  | "first_program_complete"
  | "first_diet_complete"
  | "first_tjai_plan"
  | "first_apex_session"
  | "first_coach_review"
  | "first_community_post"
  // Open string fallback so future detectors can introduce keys
  // without a code change here.
  | (string & {});

const FRESH_BLOOM_WINDOW_MS = 60_000;

export async function markMilestoneReached(
  supabase: SupabaseClient,
  userId: string,
  milestoneKey: MilestoneKey
): Promise<{ alreadyReached: boolean }> {
  const { error } = await supabase
    .from("user_number_milestones")
    .insert({ user_id: userId, milestone_key: milestoneKey });
  if (error) {
    // 23505 = unique_violation — milestone was already reached. Fine.
    if (error.code === "23505") {
      return { alreadyReached: true };
    }
    throw error;
  }
  return { alreadyReached: false };
}

export async function loadRecentMilestones(
  supabase: SupabaseClient,
  userId: string,
  withinMs: number = FRESH_BLOOM_WINDOW_MS
): Promise<Set<MilestoneKey>> {
  const cutoff = new Date(Date.now() - withinMs).toISOString();
  const { data, error } = await supabase
    .from("user_number_milestones")
    .select("milestone_key, reached_at")
    .eq("user_id", userId)
    .gte("reached_at", cutoff);
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.milestone_key as MilestoneKey));
}

export async function loadAllMilestones(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<MilestoneKey>> {
  const { data, error } = await supabase
    .from("user_number_milestones")
    .select("milestone_key")
    .eq("user_id", userId);
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.milestone_key as MilestoneKey));
}

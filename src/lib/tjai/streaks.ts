import type { SupabaseClient } from "@supabase/supabase-js";

export type Streak = {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

const DEFAULT: Streak = { current_streak: 0, longest_streak: 0, last_active_date: null };

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

export async function getStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<Streak> {
  const { data } = await supabase
    .from("tjai_streaks")
    .select("current_streak,longest_streak,last_active_date")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return DEFAULT;
  return {
    current_streak: Number(data.current_streak ?? 0),
    longest_streak: Number(data.longest_streak ?? 0),
    last_active_date: data.last_active_date ?? null
  };
}

// Idempotent: hitting this twice in the same UTC day is a no-op.
// Returns the streak after the bump.
export async function bumpStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<Streak> {
  const today = todayUtc();
  const current = await getStreak(supabase, userId);

  if (current.last_active_date === today) return current;

  let next = 1;
  if (current.last_active_date === yesterdayUtc()) {
    next = current.current_streak + 1;
  }

  const updated: Streak = {
    current_streak: next,
    longest_streak: Math.max(current.longest_streak, next),
    last_active_date: today
  };

  await supabase.from("tjai_streaks").upsert(
    {
      user_id: userId,
      current_streak: updated.current_streak,
      longest_streak: updated.longest_streak,
      last_active_date: updated.last_active_date,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );

  return updated;
}

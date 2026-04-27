import type { SupabaseClient } from "@supabase/supabase-js";

export type BadgeCode =
  | "first_plan"
  | "first_workout"
  | "first_meal_log"
  | "first_progress_photo"
  | "first_pr"
  | "streak_7"
  | "streak_30"
  | "streak_100"
  | "ten_workouts"
  | "fifty_workouts"
  | "first_check_in";

export type BadgeMeta = {
  code: BadgeCode;
  label: string;
  description: string;
  emoji: string;
};

export const BADGE_CATALOG: Record<BadgeCode, BadgeMeta> = {
  first_plan: { code: "first_plan", label: "Plan Lit", description: "Generated your first TJAI plan", emoji: "🧭" },
  first_workout: { code: "first_workout", label: "Day One", description: "Logged your first workout", emoji: "🔥" },
  first_meal_log: { code: "first_meal_log", label: "Tracked", description: "Logged your first meal", emoji: "🍽️" },
  first_progress_photo: { code: "first_progress_photo", label: "On Camera", description: "Uploaded your first progress photo", emoji: "📸" },
  first_pr: { code: "first_pr", label: "New PR", description: "Hit your first personal record", emoji: "🏆" },
  first_check_in: { code: "first_check_in", label: "Reporting In", description: "Completed your first weekly check-in", emoji: "📋" },
  streak_7: { code: "streak_7", label: "7-Day Streak", description: "Active 7 days in a row", emoji: "⚡" },
  streak_30: { code: "streak_30", label: "30-Day Streak", description: "Active 30 days in a row", emoji: "💎" },
  streak_100: { code: "streak_100", label: "Century Streak", description: "100 days in a row", emoji: "👑" },
  ten_workouts: { code: "ten_workouts", label: "10 Sessions", description: "Logged 10 workouts", emoji: "💪" },
  fifty_workouts: { code: "fifty_workouts", label: "50 Sessions", description: "Logged 50 workouts", emoji: "🛡️" }
};

export async function listAwardedBadges(
  supabase: SupabaseClient,
  userId: string
): Promise<Array<{ code: BadgeCode; awarded_at: string }>> {
  const { data } = await supabase
    .from("tjai_badges")
    .select("code,awarded_at")
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false });
  return ((data ?? []) as Array<{ code: string; awarded_at: string }>)
    .filter((row): row is { code: BadgeCode; awarded_at: string } => row.code in BADGE_CATALOG)
    .map((row) => ({ code: row.code as BadgeCode, awarded_at: row.awarded_at }));
}

async function awardIfMissing(
  supabase: SupabaseClient,
  userId: string,
  code: BadgeCode
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("tjai_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("code", code)
    .maybeSingle();
  if (existing) return false;
  const { error } = await supabase.from("tjai_badges").insert({ user_id: userId, code });
  return !error;
}

export type BadgeContext = {
  workoutCount?: number | null;
  hasPlan?: boolean;
  hasMealLog?: boolean;
  hasProgressPhoto?: boolean;
  hasPr?: boolean;
  checkInCount?: number | null;
  currentStreak?: number | null;
};

// Returns badges newly awarded by this evaluation (so the UI can celebrate).
export async function evaluateBadges(
  supabase: SupabaseClient,
  userId: string,
  ctx: BadgeContext
): Promise<BadgeMeta[]> {
  const newly: BadgeMeta[] = [];
  const tryAward = async (code: BadgeCode) => {
    if (await awardIfMissing(supabase, userId, code)) newly.push(BADGE_CATALOG[code]);
  };

  if (ctx.hasPlan) await tryAward("first_plan");
  if ((ctx.workoutCount ?? 0) >= 1) await tryAward("first_workout");
  if ((ctx.workoutCount ?? 0) >= 10) await tryAward("ten_workouts");
  if ((ctx.workoutCount ?? 0) >= 50) await tryAward("fifty_workouts");
  if (ctx.hasMealLog) await tryAward("first_meal_log");
  if (ctx.hasProgressPhoto) await tryAward("first_progress_photo");
  if (ctx.hasPr) await tryAward("first_pr");
  if ((ctx.checkInCount ?? 0) >= 1) await tryAward("first_check_in");
  if ((ctx.currentStreak ?? 0) >= 7) await tryAward("streak_7");
  if ((ctx.currentStreak ?? 0) >= 30) await tryAward("streak_30");
  if ((ctx.currentStreak ?? 0) >= 100) await tryAward("streak_100");

  return newly;
}

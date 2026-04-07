import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

function weekStartIso() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return monday.toISOString().slice(0, 10);
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const [{ data: progressRows }, { data: workoutRows }, { data: planRow }, { data: profile }] = await Promise.all([
    admin.from("program_progress").select("week_number,day_label,is_complete,completed_at,program_slug").eq("user_id", auth.user.id).order("week_number", { ascending: true }),
    admin.from("workout_logs").select("id,week_number,day_label,exercise_name,logged_at").eq("user_id", auth.user.id).order("logged_at", { ascending: false }).limit(100),
    admin
      .from("saved_tjai_plans")
      .select("plan_json")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from("profiles").select("current_streak").eq("id", auth.user.id).maybeSingle()
  ]);

  const completed = (progressRows ?? []).filter((row) => row.is_complete).length;
  const total = Math.max(1, (progressRows ?? []).length || 84);
  const completionPercent = Math.round((completed / total) * 100);
  const currentWeek = Math.max(1, ...((progressRows ?? []).map((row) => Number(row.week_number ?? 1))));

  const weightSeries: number[] = [];
  const nutritionHit = { proteinDaysHit: 0, calorieDaysHit: 0, totalDays: 0 };

  const weekStart = weekStartIso();
  let weeklyInsight = "";
  const { data: cachedInsight } = await admin
    .from("tjai_weekly_insights")
    .select("insight_text")
    .eq("user_id", auth.user.id)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (cachedInsight?.insight_text) {
    weeklyInsight = cachedInsight.insight_text;
  } else {
    weeklyInsight =
      "You've been consistent this week. Your training rhythm is improving. Focus on hydration and recovery to keep performance high.";
    await admin.from("tjai_weekly_insights").upsert(
      {
        user_id: auth.user.id,
        week_start: weekStart,
        insight_text: weeklyInsight
      },
      { onConflict: "user_id,week_start" }
    );
  }

  const nextWorkouts = ((planRow?.plan_json as any)?.program?.weeks?.[Math.max(0, currentWeek - 1)]?.days ?? []).slice(0, 3);

  return NextResponse.json({
    completion: {
      current_week: currentWeek,
      total_weeks: 12,
      percent: completionPercent,
      logged_days_this_week: (progressRows ?? []).filter((row) => Number(row.week_number) === currentWeek && row.is_complete).length
    },
    body_metrics: {
      starting_weight: null,
      current_weight: null,
      change_kg: null,
      sparkline: weightSeries
    },
    macro_adherence: {
      protein_hit_percent: nutritionHit.totalDays ? Math.round((nutritionHit.proteinDaysHit / nutritionHit.totalDays) * 100) : 0,
      calorie_hit_percent: nutritionHit.totalDays ? Math.round((nutritionHit.calorieDaysHit / nutritionHit.totalDays) * 100) : 0
    },
    weekly_insight: weeklyInsight,
    next_workouts: nextWorkouts,
    current_streak: Number(profile?.current_streak ?? 0),
    recent_logs: workoutRows ?? []
  });
}

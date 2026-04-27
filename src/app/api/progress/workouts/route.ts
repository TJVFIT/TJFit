import { NextRequest, NextResponse } from "next/server";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("workout_logs")
    .select("id,user_id,workout_date,exercise,sets,reps,weight_kg,duration_minutes,notes,created_at")
    .eq("user_id", auth.user.id)
    .order("workout_date", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ workouts: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = rateLimit({
    key: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.ip ?? auth.user.id,
    limit: 40,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  if (typeof body.exercise !== "string" || !body.exercise.trim()) {
    return NextResponse.json({ error: "Exercise is required." }, { status: 400 });
  }

  const payload = {
    user_id: auth.user.id,
    workout_date: body.workout_date ?? new Date().toISOString().slice(0, 10),
    exercise: body.exercise.trim(),
    sets: body.sets ?? null,
    reps: body.reps ?? null,
    weight_kg: body.weight_kg ?? null,
    duration_minutes: body.duration_minutes ?? null,
    notes: typeof body.notes === "string" ? body.notes.trim() : null
  };

  const { data, error } = await auth.supabase
    .from("workout_logs")
    .insert(payload)
    .select("id,user_id,workout_date,exercise,sets,reps,weight_kg,duration_minutes,notes,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let newBadges: import("@/lib/tjai/badges").BadgeMeta[] = [];
  let streak: import("@/lib/tjai/streaks").Streak | null = null;
  try {
    const { bumpStreak } = await import("@/lib/tjai/streaks");
    const { evaluateBadges } = await import("@/lib/tjai/badges");
    streak = await bumpStreak(auth.supabase, auth.user.id);
    const { count } = await auth.supabase
      .from("workout_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id);
    newBadges = await evaluateBadges(auth.supabase, auth.user.id, {
      workoutCount: count ?? null,
      currentStreak: streak.current_streak
    });
  } catch {
    /* swallow — streak/badges are best-effort */
  }

  return NextResponse.json({ workout: data, streak, newBadges }, { status: 201 });
}

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
    console.error("[progress/workouts] read failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to load workouts" }, { status: 500 });
  }

  return NextResponse.json({ workouts: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Key by user_id — auth-gated, IP-keying was meaningless and request.ip is
  // deprecated in Next 14.
  const limiter = await rateLimit({
    key: `progress-workout:${auth.user.id}`,
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

  // Bound user input: notes was unbounded (1MB+ entries could DoS storage),
  // numeric fields could be Infinity / NaN, and exercise was already trimmed.
  // The DB still enforces column types but defensive caps stop obviously
  // malformed payloads at the edge.
  const boundedNumber = (v: unknown, max: number): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
  };
  const dateStr =
    typeof body.workout_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.workout_date)
      ? body.workout_date
      : new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: auth.user.id,
    workout_date: dateStr,
    exercise: body.exercise.trim().slice(0, 200),
    sets: boundedNumber(body.sets, 100),
    reps: boundedNumber(body.reps, 1000),
    weight_kg: boundedNumber(body.weight_kg, 2000),
    duration_minutes: boundedNumber(body.duration_minutes, 1440),
    notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null
  };

  const { data, error } = await auth.supabase
    .from("workout_logs")
    .insert(payload)
    .select("id,user_id,workout_date,exercise,sets,reps,weight_kg,duration_minutes,notes,created_at")
    .single();

  if (error) {
    console.error("[progress/workouts] insert failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to save workout" }, { status: 400 });
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

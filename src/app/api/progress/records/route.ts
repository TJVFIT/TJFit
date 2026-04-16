import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

type WorkoutRow = {
  exercise: string;
  weight_kg: number | null;
  reps: number | null;
  duration_minutes: number | null;
};

type Record = {
  exercise: string;
  max_weight_kg: number | null;
  max_reps: number | null;
  max_duration_minutes: number | null;
  total_sets: number;
};

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const uid = auth.user.id;

  const { data, error } = await auth.supabase
    .from("workout_logs")
    .select("exercise,weight_kg,reps,duration_minutes")
    .eq("user_id", uid)
    .not("exercise", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows: WorkoutRow[] = (data ?? []).map((r) => ({
    exercise: String(r.exercise ?? "").trim(),
    weight_kg: r.weight_kg != null ? Number(r.weight_kg) : null,
    reps: r.reps != null ? Number(r.reps) : null,
    duration_minutes: r.duration_minutes != null ? Number(r.duration_minutes) : null
  }));

  // Aggregate by exercise (case-insensitive)
  const map = new Map<string, Record>();
  for (const row of rows) {
    const key = row.exercise.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        exercise: row.exercise,
        max_weight_kg: row.weight_kg,
        max_reps: row.reps,
        max_duration_minutes: row.duration_minutes,
        total_sets: 1
      });
    } else {
      existing.total_sets++;
      if (row.weight_kg != null && (existing.max_weight_kg == null || row.weight_kg > existing.max_weight_kg)) {
        existing.max_weight_kg = row.weight_kg;
      }
      if (row.reps != null && (existing.max_reps == null || row.reps > existing.max_reps)) {
        existing.max_reps = row.reps;
      }
      if (row.duration_minutes != null && (existing.max_duration_minutes == null || row.duration_minutes > existing.max_duration_minutes)) {
        existing.max_duration_minutes = row.duration_minutes;
      }
    }
  }

  const records = Array.from(map.values()).sort((a, b) =>
    a.exercise.localeCompare(b.exercise)
  );

  return NextResponse.json({ records });
}

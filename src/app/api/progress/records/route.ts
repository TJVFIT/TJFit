import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

type RecordRow = {
  exercise: string;
  max_weight_kg: number | null;
  max_reps: number | null;
  max_duration_minutes: number | null;
  total_sets: number;
};

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Aggregation moved to Postgres via tjfit_workout_records RPC. Previously
  // this route fetched ALL workout_logs rows (no limit) and grouped/maxed
  // in JS, which doesn't scale for power users with thousands of logs.
  const { data, error } = await auth.supabase.rpc("tjfit_workout_records", {
    p_user_id: auth.user.id
  });

  if (error) {
    console.error("[progress/records] rpc failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to load records" }, { status: 500 });
  }

  const records: RecordRow[] = (data ?? []).map((row: Record<string, unknown>) => ({
    exercise: String(row.exercise ?? ""),
    max_weight_kg: row.max_weight_kg !== null && row.max_weight_kg !== undefined ? Number(row.max_weight_kg) : null,
    max_reps: row.max_reps !== null && row.max_reps !== undefined ? Number(row.max_reps) : null,
    max_duration_minutes:
      row.max_duration_minutes !== null && row.max_duration_minutes !== undefined
        ? Number(row.max_duration_minutes)
        : null,
    total_sets: Number(row.total_sets ?? 0)
  }));

  return NextResponse.json({ records });
}

import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

const VALID_RATINGS = new Set(["too_easy", "right", "too_hard"]);
const VALID_CONTEXTS = new Set(["workout", "meal", "day", "week"]);

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rating = String(body?.rating ?? "").trim();
  if (!VALID_RATINGS.has(rating)) {
    return NextResponse.json(
      { error: "rating must be one of: too_easy, right, too_hard", code: "invalid_rating" },
      { status: 400 }
    );
  }

  const contextValue =
    typeof body?.context === "string" && VALID_CONTEXTS.has(body.context.trim())
      ? body.context.trim()
      : "workout";
  const workoutLogId =
    typeof body?.workoutLogId === "string" && body.workoutLogId.trim().length > 0
      ? body.workoutLogId.trim()
      : null;
  const note =
    typeof body?.note === "string" && body.note.trim().length > 0
      ? body.note.trim().slice(0, 500)
      : null;

  const { data, error } = await auth.supabase
    .from("tjai_feedback")
    .insert({
      user_id: auth.user.id,
      workout_log_id: workoutLogId,
      context: contextValue,
      rating,
      note
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[TJAI feedback] insert failed", error);
    return NextResponse.json(
      { error: "Failed to save feedback", code: error.code ?? "db_error", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data?.id, created_at: data?.created_at });
}

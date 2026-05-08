import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const GOALS = new Set(["fat_loss", "muscle_gain", "strength", "general", "other"]);

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  let body: { coach_user_id?: string; message?: string; goal?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const coachId = (body.coach_user_id ?? "").trim();
  const message = (body.message ?? "").trim().slice(0, 500);
  const goal = (body.goal ?? "general").trim();

  if (!coachId) return NextResponse.json({ error: "coach_user_id required" }, { status: 400 });
  if (!GOALS.has(goal)) return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
  if (coachId === auth.user.id) return NextResponse.json({ error: "Cannot request yourself" }, { status: 400 });

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: coachProfile } = await admin
    .from("profiles")
    .select("id,role,accepting_clients")
    .eq("id", coachId)
    .maybeSingle();
  if (!coachProfile || coachProfile.role !== "coach") {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }
  if (coachProfile.accepting_clients === false) {
    return NextResponse.json({ error: "Coach is not accepting clients" }, { status: 409 });
  }

  const { data: existingActive } = await admin
    .from("coach_student_links")
    .select("id")
    .eq("coach_id", coachId)
    .eq("student_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();
  if (existingActive) {
    return NextResponse.json({ error: "Already linked to this coach" }, { status: 409 });
  }

  const { error: insertError } = await auth.supabase.from("coach_requests").insert({
    student_id: auth.user.id,
    coach_id: coachId,
    message: message || null,
    goal
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "A pending request already exists for this coach" }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

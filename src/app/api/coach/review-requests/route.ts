import { NextResponse } from "next/server";

import { requireCoachOrAdmin } from "@/lib/require-coach-or-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;
  const query = auth.supabase
    .from("coach_review_requests")
    .select("id,user_id,plan_id,status,coach_id,coach_notes,created_at,reviewed_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (auth.role === "coach") {
    query.or(`coach_id.eq.${auth.userId},status.eq.pending`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null);
  const id = body?.id;
  const coachNotes = body?.coachNotes ?? null;
  const status = body?.status ?? "reviewed";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await auth.supabase
    .from("coach_review_requests")
    .update({ coach_notes: coachNotes, status, coach_id: auth.userId, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  return NextResponse.json({ ok: true });
}


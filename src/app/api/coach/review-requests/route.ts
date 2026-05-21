import { NextResponse } from "next/server";

import { requireCoachOrAdmin } from "@/lib/require-coach-or-admin";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS_VALUES = new Set(["pending", "reviewed", "declined", "needs_revision"]);
const NOTES_MAX = 4000;

export async function GET() {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;
  const query = auth.supabase
    .from("coach_review_requests")
    .select("id,user_id,plan_id,status,coach_id,coach_notes,created_at,reviewed_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (auth.role === "coach") {
    // auth.userId is a session-derived UUID — safe to interpolate into the
    // PostgREST filter string. Coaches see their own assigned requests OR
    // any pending request available to claim.
    query.or(`coach_id.eq.${auth.userId},status.eq.pending`);
  }
  const { data, error } = await query;
  if (error) {
    console.error("[coach/review-requests] list failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
  return NextResponse.json({ requests: data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  // Validate UUID shape — defends against accidental injection into the .eq()
  // filter even though PostgREST would reject malformed uuids itself.
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Previously `status` accepted any string — a client could set arbitrary
  // garbage values, breaking the UI and downstream filters.
  const status =
    typeof body?.status === "string" && STATUS_VALUES.has(body.status) ? body.status : "reviewed";

  // Bound coach_notes length. Previously unbounded — could store 10MB of text.
  const coachNotes =
    typeof body?.coachNotes === "string"
      ? body.coachNotes.trim().slice(0, NOTES_MAX) || null
      : null;

  const { error } = await auth.supabase
    .from("coach_review_requests")
    .update({
      coach_notes: coachNotes,
      status,
      coach_id: auth.userId,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("[coach/review-requests] update failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

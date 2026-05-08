import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const ACTIONS = new Set(["approve", "decline"]);

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  let body: { request_id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const requestId = (body.request_id ?? "").trim();
  const action = (body.action ?? "").trim();

  if (!requestId) return NextResponse.json({ error: "request_id required" }, { status: 400 });
  if (!ACTIONS.has(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: req, error: readError } = await admin
    .from("coach_requests")
    .select("id,student_id,coach_id,status")
    .eq("id", requestId)
    .maybeSingle();

  if (readError || !req) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (req.coach_id !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (req.status !== "pending") {
    return NextResponse.json({ error: `Request already ${req.status}` }, { status: 409 });
  }

  const newStatus = action === "approve" ? "approved" : "declined";
  const { error: updateError } = await admin
    .from("coach_requests")
    .update({ status: newStatus, responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (action === "approve") {
    await admin
      .from("coach_student_links")
      .update({ status: "ended" })
      .eq("student_id", req.student_id)
      .eq("status", "active");

    const { error: linkError } = await admin.from("coach_student_links").insert({
      coach_id: req.coach_id,
      student_id: req.student_id,
      status: "active"
    });
    if (linkError) {
      await admin
        .from("coach_requests")
        .update({ status: "pending", responded_at: null })
        .eq("id", requestId);
      return NextResponse.json({ error: `Link creation failed: ${linkError.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, status: newStatus });
}

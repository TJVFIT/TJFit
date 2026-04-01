import { NextRequest, NextResponse } from "next/server";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";

function isValidCallEvent(type: unknown) {
  return type === "offer" || type === "answer" || type === "ice" || type === "end" || type === "ring";
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const callSessionId = typeof body.call_session_id === "string" ? body.call_session_id : "";
  const eventType = body.event_type;
  const payload = body.payload;

  if (!callSessionId || !isValidCallEvent(eventType) || typeof payload !== "object" || !payload) {
    return NextResponse.json({ error: "Invalid call event payload." }, { status: 400 });
  }

  const { data: callSession } = await auth.supabase
    .from("call_sessions")
    .select("id")
    .eq("id", callSessionId)
    .single();

  if (!callSession) {
    return NextResponse.json({ error: "Call session not found." }, { status: 404 });
  }

  const { data, error } = await auth.supabase
    .from("call_events")
    .insert({
      call_session_id: callSessionId,
      sender_id: auth.user.id,
      event_type: eventType,
      payload
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (eventType === "end") {
    await auth.supabase
      .from("call_sessions")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", callSessionId);
  } else if (eventType === "answer") {
    await auth.supabase
      .from("call_sessions")
      .update({ status: "active" })
      .eq("id", callSessionId);
  }

  return NextResponse.json({ event: data }, { status: 201 });
}


import { NextRequest, NextResponse } from "next/server";

import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";

// WebRTC SDP / ICE payloads are small; cap to refuse garbage submissions.
const PAYLOAD_MAX_BYTES = 16 * 1024;

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
  // Refuse oversized signaling payloads — legitimate SDP is well under 16KB.
  if (JSON.stringify(payload).length > PAYLOAD_MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  // Authorization: anyone authenticated must NOT be able to inject signaling
  // events into a stranger's call. Previously the route only checked that the
  // call_session row existed — meaning any logged-in user could send "end" to
  // terminate another pair's call or spam ICE candidates. Now we verify the
  // user is a participant in the call's conversation.
  const { data: callSession } = await auth.supabase
    .from("call_sessions")
    .select("id, conversation_id")
    .eq("id", callSessionId)
    .maybeSingle();

  if (!callSession) {
    return NextResponse.json({ error: "Call session not found." }, { status: 404 });
  }

  const { data: membership } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", callSession.conversation_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    console.error("[chat/calls/events] insert failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to record call event" }, { status: 500 });
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

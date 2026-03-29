import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const conversationId = typeof body.conversation_id === "string" ? body.conversation_id : "";
  const mode = body.mode === "voice" ? "voice" : "video";

  if (!conversationId) {
    return NextResponse.json({ error: "conversation_id is required." }, { status: 400 });
  }

  const { data: membership } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", auth.user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await auth.supabase
    .from("call_sessions")
    .insert({
      conversation_id: conversationId,
      started_by: auth.user.id,
      mode
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ call_session: data }, { status: 201 });
}


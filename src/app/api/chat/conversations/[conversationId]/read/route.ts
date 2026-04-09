import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { isMissingSchemaMigrationError, jsonSchemaNotReady } from "@/lib/supabase-rpc-errors";

export async function POST(_: Request, { params }: { params: { conversationId: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Mark inbound messages as read when the thread is opened/visible.
  await auth.supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", params.conversationId)
    .neq("sender_id", auth.user.id)
    .is("read_at", null);

  const { error } = await auth.supabase.rpc("mark_conversation_read", {
    p_conversation_id: params.conversationId
  });

  if (error) {
    if (isMissingSchemaMigrationError(error.message)) {
      return jsonSchemaNotReady("api/chat/conversations/read:POST", error.message);
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

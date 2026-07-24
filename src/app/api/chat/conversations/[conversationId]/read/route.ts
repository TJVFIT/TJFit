import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { isMissingSchemaMigrationError, jsonSchemaNotReady } from "@/lib/supabase-rpc-errors";

export async function POST(_: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { conversationId } = await params;

  // Defense-in-depth: messages RLS should already block non-participants from
  // touching rows, but a route that silently no-ops for unauthorized users is
  // confusing. Explicit 403 makes the contract clear.
  const { data: membership } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark inbound messages as read when the thread is opened/visible.
  await auth.supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", auth.user.id)
    .is("read_at", null);

  const { error } = await auth.supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId
  });

  if (error) {
    if (isMissingSchemaMigrationError(error.message)) {
      return jsonSchemaNotReady("api/chat/conversations/read:POST", error.message);
    }
    console.error("[chat/conversations/read] rpc failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to mark read" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

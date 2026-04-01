import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export async function POST(_: Request, { params }: { params: { conversationId: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { error } = await auth.supabase.rpc("mark_conversation_read", {
    p_conversation_id: params.conversationId
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

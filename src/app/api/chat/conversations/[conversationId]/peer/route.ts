import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export async function GET(_: Request, { params }: { params: { conversationId: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase.rpc("get_conversation_peer", {
    p_conversation_id: params.conversationId
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ peer: data });
}

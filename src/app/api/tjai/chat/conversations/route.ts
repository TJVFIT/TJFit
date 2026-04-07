import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const conversationId = request.nextUrl.searchParams.get("conversationId")?.trim();
  if (conversationId) {
    const { data, error } = await auth.supabase
      .from("tjai_chat_messages")
      .select("id,role,content,created_at,conversation_id")
      .eq("user_id", auth.user.id)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ messages: data ?? [] });
  }

  const { data, error } = await auth.supabase
    .from("tjai_chat_messages")
    .select("conversation_id,role,content,created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const seen = new Set<string>();
  const conversations: Array<{ conversation_id: string; created_at: string; starter: string }> = [];
  for (const row of data ?? []) {
    if (seen.has(row.conversation_id)) continue;
    seen.add(row.conversation_id);
    conversations.push({
      conversation_id: row.conversation_id,
      created_at: row.created_at,
      starter: String(row.content ?? "").slice(0, 60) || "New chat"
    });
    if (conversations.length >= 25) break;
  }

  return NextResponse.json({ conversations });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const conversationId = typeof body.conversation_id === "string" ? body.conversation_id : "";
  const filename = typeof body.filename === "string" ? body.filename : "file.bin";

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

  const storagePath = `${conversationId}/${auth.user.id}/${Date.now()}-${filename.replace(/\s+/g, "_")}`;
  const { data, error } = await auth.supabase.storage.from("secure-chat").createSignedUploadUrl(storagePath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    path: storagePath,
    signedUrl: data.signedUrl,
    token: data.token
  });
}


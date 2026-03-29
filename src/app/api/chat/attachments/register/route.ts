import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  if (typeof body.message_id !== "string" || typeof body.storage_path !== "string" || typeof body.mime_type !== "string") {
    return NextResponse.json({ error: "message_id, storage_path and mime_type are required." }, { status: 400 });
  }

  const { data: message } = await auth.supabase
    .from("messages")
    .select("id, conversation_id")
    .eq("id", body.message_id)
    .single();

  if (!message) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  const { data: membership } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", message.conversation_id)
    .eq("user_id", auth.user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await auth.supabase
    .from("message_attachments")
    .insert({
      message_id: body.message_id,
      storage_path: body.storage_path,
      mime_type: body.mime_type,
      size_bytes: typeof body.size_bytes === "number" ? body.size_bytes : 0,
      encrypted_name: typeof body.encrypted_name === "string" ? body.encrypted_name : null
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ attachment: data }, { status: 201 });
}


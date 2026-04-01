import { NextRequest, NextResponse } from "next/server";
import { mapSupabaseMessagingError } from "@/lib/messaging-errors";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
import { rateLimit } from "@/lib/rate-limit";

function isValidMessageType(value: unknown) {
  return value === "text" || value === "image" || value === "file" || value === "link" || value === "call_event";
}

export async function GET(_: NextRequest, { params }: { params: { conversationId: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data: membership } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", params.conversationId)
    .eq("user_id", auth.user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: participant } = await auth.supabase
    .from("conversation_participants")
    .select("encrypted_conversation_key")
    .eq("conversation_id", params.conversationId)
    .eq("user_id", auth.user.id)
    .single();

  const { data: messages, error } = await auth.supabase
    .from("messages")
    .select("id, sender_id, message_type, ciphertext, nonce, metadata, created_at")
    .eq("conversation_id", params.conversationId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    encrypted_conversation_key: participant?.encrypted_conversation_key ?? null,
    messages: messages ?? []
  });
}

export async function POST(request: NextRequest, { params }: { params: { conversationId: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = rateLimit({
    key: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.ip ?? auth.user.id,
    limit: 80,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  if (typeof body.ciphertext !== "string" || typeof body.nonce !== "string") {
    return NextResponse.json({ error: "ciphertext and nonce are required." }, { status: 400 });
  }
  if (!isValidMessageType(body.message_type ?? "text")) {
    return NextResponse.json({ error: "Invalid message type." }, { status: 400 });
  }

  const { data: membership } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", params.conversationId)
    .eq("user_id", auth.user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await auth.supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_id: auth.user.id,
      message_type: body.message_type ?? "text",
      ciphertext: body.ciphertext,
      nonce: body.nonce,
      metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : null
    })
    .select("id, sender_id, message_type, ciphertext, nonce, metadata, created_at")
    .single();

  if (error) {
    const mapped = mapSupabaseMessagingError(error.message);
    if (mapped) {
      return NextResponse.json({ error: mapped.error, code: mapped.code }, { status: mapped.status });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: data }, { status: 201 });
}


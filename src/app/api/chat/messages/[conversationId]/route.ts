import { NextRequest, NextResponse } from "next/server";
import { mapSupabaseMessagingError } from "@/lib/messaging-errors";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
import { rateLimit } from "@/lib/rate-limit";

// E2E ciphertext bound. Generous for chat (a 64KB base64 blob is ~48KB of
// plaintext — much more than any normal message). Prevents a malicious peer
// from bloating the conversation with megabyte-sized payloads that DoS the
// other participant's client when loading history.
const CIPHERTEXT_MAX_BYTES = 64 * 1024;
const NONCE_MAX_BYTES = 256;

function isValidMessageType(value: unknown) {
  return value === "text" || value === "image" || value === "file" || value === "link" || value === "call_event";
}

export async function GET(_: NextRequest, { params }: { params: { conversationId: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Merged what was two sequential SELECTs against conversation_participants
  // (membership check + key fetch) into one round-trip.
  const { data: participant } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id, encrypted_conversation_key")
    .eq("conversation_id", params.conversationId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(_.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, Math.trunc(limitRaw))) : 50;
  const before = url.searchParams.get("before");
  let query = auth.supabase
    .from("messages")
    .select("id, sender_id, message_type, ciphertext, nonce, metadata, created_at, read_at")
    .eq("conversation_id", params.conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) {
    query = query.lt("created_at", before);
  }
  const { data: messages, error } = await query;

  if (error) {
    console.error("[chat/messages] read failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }

  return NextResponse.json({
    encrypted_conversation_key: participant.encrypted_conversation_key ?? null,
    messages: (messages ?? []).slice().reverse(),
    has_more: Array.isArray(messages) ? messages.length === limit : false
  });
}

export async function POST(request: NextRequest, { params }: { params: { conversationId: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Key by user_id rather than IP — chat is auth-gated and a malicious peer
  // can't share an IP with their target. request.ip was deprecated in Next 14.
  const limiter = await rateLimit({
    key: `chat-message:${auth.user.id}`,
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
  if (body.ciphertext.length > CIPHERTEXT_MAX_BYTES) {
    return NextResponse.json({ error: "Message too large." }, { status: 413 });
  }
  if (body.nonce.length > NONCE_MAX_BYTES) {
    return NextResponse.json({ error: "Invalid nonce." }, { status: 400 });
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
    .select("id, sender_id, message_type, ciphertext, nonce, metadata, created_at, read_at")
    .single();

  if (error) {
    const mapped = mapSupabaseMessagingError(error.message);
    if (mapped) {
      return NextResponse.json({ error: mapped.error, code: mapped.code }, { status: mapped.status });
    }
    // Unmapped DB error — don't leak raw text (table/column hints, constraint
    // names). Log server-side instead. 500 since we couldn't categorize it.
    console.error("[chat/messages] unmapped insert error", error.message, error.code);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ message: data }, { status: 201 });
}


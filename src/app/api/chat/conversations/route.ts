import { NextRequest, NextResponse } from "next/server";
import { mapSupabaseMessagingError } from "@/lib/messaging-errors";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
import { isMissingSchemaMigrationError, jsonSchemaNotReady } from "@/lib/supabase-rpc-errors";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase.rpc("list_my_conversations_with_peers");

  if (error) {
    if (isMissingSchemaMigrationError(error.message)) {
      return jsonSchemaNotReady("api/chat/conversations:GET", error.message);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Array<{
    conversation_id: string;
    conv_created_at: string;
    conversation_type: string;
    peer_id: string;
    peer_username: string;
    peer_display_name: string;
    peer_avatar_url: string | null;
    last_message_at: string | null;
    last_message_preview: string | null;
    unread_count: number | string;
  }>;

  const conversations = rows.map((r) => ({
    id: r.conversation_id,
    created_at: r.conv_created_at,
    conversation_type: r.conversation_type,
    last_message_at: r.last_message_at,
    last_message_preview: r.last_message_preview,
    unread_count: Number(r.unread_count ?? 0),
    peer: {
      id: r.peer_id,
      username: r.peer_username,
      display_name: r.peer_display_name,
      avatar_url: r.peer_avatar_url
    }
  }));

  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const participantId = typeof body.participant_id === "string" ? body.participant_id.trim() : "";
  const myWrappedKey = typeof body.my_wrapped_key === "string" ? body.my_wrapped_key : "";
  const participantWrappedKey =
    typeof body.participant_wrapped_key === "string" ? body.participant_wrapped_key : "";

  if (!participantId || !myWrappedKey || !participantWrappedKey) {
    return NextResponse.json({ error: "Missing participant or wrapped keys." }, { status: 400 });
  }

  const { data: link } = await auth.supabase
    .from("coach_student_links")
    .select("id, coach_id, student_id")
    .or(
      `and(coach_id.eq.${auth.user.id},student_id.eq.${participantId}),and(coach_id.eq.${participantId},student_id.eq.${auth.user.id})`
    )
    .eq("status", "active")
    .maybeSingle();

  if (link) {
    const { error: assertErr } = await auth.supabase.rpc("assert_can_message_peer", {
      peer_id: participantId
    });
    if (assertErr) {
      const msg = assertErr.message ?? "Unable to start conversation.";
      const mapped = mapSupabaseMessagingError(msg);
      if (mapped) {
        return NextResponse.json({ error: mapped.error, code: mapped.code }, { status: mapped.status });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { data: existingConversation } = await auth.supabase
      .from("conversations")
      .select("id")
      .eq("coach_student_link_id", link.id)
      .eq("conversation_type", "coach_student")
      .maybeSingle();

    let conversationId = existingConversation?.id;

    if (!conversationId) {
      const { data: createdConversation, error: createError } = await auth.supabase
        .from("conversations")
        .insert({
          coach_student_link_id: link.id,
          conversation_type: "coach_student",
          created_by: auth.user.id
        })
        .select("id")
        .single();

      if (createError || !createdConversation?.id) {
        return NextResponse.json(
          { error: createError?.message ?? "Unable to create conversation." },
          { status: 500 }
        );
      }

      conversationId = createdConversation.id;
      const participants = [
        { conversation_id: conversationId, user_id: auth.user.id, encrypted_conversation_key: myWrappedKey },
        {
          conversation_id: conversationId,
          user_id: participantId,
          encrypted_conversation_key: participantWrappedKey
        }
      ];

      const { error: participantError } = await auth.supabase.from("conversation_participants").insert(participants);
      if (participantError) {
        return NextResponse.json({ error: participantError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ conversation_id: conversationId });
  }

  const { data: rpcId, error: rpcError } = await auth.supabase.rpc("create_direct_conversation", {
    peer_id: participantId,
    initiator_wrapped_key: myWrappedKey,
    peer_wrapped_key: participantWrappedKey
  });

  if (rpcError) {
    const msg = rpcError.message ?? "Unable to start conversation.";
    const mapped = mapSupabaseMessagingError(msg);
    if (mapped) {
      return NextResponse.json({ error: mapped.error, code: mapped.code }, { status: mapped.status });
    }
    const low = msg.toLowerCase();
    if (low.includes("not allowed") || low.includes("messaging")) {
      return NextResponse.json({ error: "Messaging is not allowed with this user.", code: "MESSAGING_BLOCKED" }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ conversation_id: rpcId as string });
}

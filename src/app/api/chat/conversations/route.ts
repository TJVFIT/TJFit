import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data: memberships, error: memberError } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", auth.user.id);

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const conversationIds = (memberships ?? []).map((m) => m.conversation_id);
  if (conversationIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const { data: conversations, error } = await auth.supabase
    .from("conversations")
    .select("id, created_at")
    .in("id", conversationIds)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: conversations ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const participantId = typeof body.participant_id === "string" ? body.participant_id : "";
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
    .single();

  if (!link) {
    return NextResponse.json({ error: "No active coach-student link found." }, { status: 403 });
  }

  const { data: existingConversation } = await auth.supabase
    .from("conversations")
    .select("id")
    .eq("coach_student_link_id", link.id)
    .single();

  let conversationId = existingConversation?.id;

  if (!conversationId) {
    const { data: createdConversation, error: createError } = await auth.supabase
      .from("conversations")
      .insert({ coach_student_link_id: link.id })
      .select("id")
      .single();

    if (createError || !createdConversation?.id) {
      return NextResponse.json({ error: createError?.message ?? "Unable to create conversation." }, { status: 500 });
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


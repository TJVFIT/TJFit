import { NextRequest, NextResponse } from "next/server";

import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";

// Bound user-supplied strings to keep DB rows reasonable. Storage paths and
// MIME types should be short; the sign route generates paths under ~150 chars.
const STORAGE_PATH_MAX = 512;
const MIME_TYPE_MAX = 128;
const ENCRYPTED_NAME_MAX = 512;
const SIZE_MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  if (
    typeof body.message_id !== "string" ||
    typeof body.storage_path !== "string" ||
    typeof body.mime_type !== "string"
  ) {
    return NextResponse.json(
      { error: "message_id, storage_path and mime_type are required." },
      { status: 400 }
    );
  }
  if (body.storage_path.length > STORAGE_PATH_MAX) {
    return NextResponse.json({ error: "Invalid storage_path." }, { status: 400 });
  }
  if (body.mime_type.length > MIME_TYPE_MAX) {
    return NextResponse.json({ error: "Invalid mime_type." }, { status: 400 });
  }

  // Verify the user is the SENDER of the message they're attaching to. Without
  // this, any participant could attach arbitrary files to anyone else's
  // message (defacement / impersonation vector).
  const { data: message } = await auth.supabase
    .from("messages")
    .select("id, conversation_id, sender_id")
    .eq("id", body.message_id)
    .maybeSingle();

  if (!message) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }
  if (message.sender_id !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify the storage_path is in this user's namespace under this
  // conversation. The sign route always issues paths shaped as
  // `${conversation_id}/${user_id}/...`; reject anything that doesn't match
  // so a participant cannot register paths from another user's namespace.
  const expectedPrefix = `${message.conversation_id}/${auth.user.id}/`;
  if (!body.storage_path.startsWith(expectedPrefix) || body.storage_path.includes("..")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Membership check is implied by sender_id but cheap to double-verify in
  // case message_sender ever decouples from active participants.
  const { data: membership } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", message.conversation_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Sanitize size_bytes — client-reported and could be wildly off. We don't
  // verify against the actual storage object (extra round-trip), but bound
  // to refuse obviously-bogus values.
  const rawSize = typeof body.size_bytes === "number" ? body.size_bytes : 0;
  if (rawSize < 0 || rawSize > SIZE_MAX_BYTES) {
    return NextResponse.json({ error: "Invalid size." }, { status: 400 });
  }
  const sizeBytes = Math.floor(rawSize);

  const encryptedName =
    typeof body.encrypted_name === "string" && body.encrypted_name.length <= ENCRYPTED_NAME_MAX
      ? body.encrypted_name
      : null;

  const { data, error } = await auth.supabase
    .from("message_attachments")
    .insert({
      message_id: body.message_id,
      storage_path: body.storage_path,
      mime_type: body.mime_type,
      size_bytes: sizeBytes,
      encrypted_name: encryptedName
    })
    .select("*")
    .single();

  if (error) {
    console.error("[chat/attachments/register] insert failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to register attachment" }, { status: 500 });
  }

  return NextResponse.json({ attachment: data }, { status: 201 });
}

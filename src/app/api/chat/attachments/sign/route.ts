import { NextRequest, NextResponse } from "next/server";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const conversationId = typeof body.conversation_id === "string" ? body.conversation_id : "";
  const rawFilename = typeof body.filename === "string" ? body.filename : "file.bin";

  if (!conversationId) {
    return NextResponse.json({ error: "conversation_id is required." }, { status: 400 });
  }

  // Sanitize filename: strip path separators and dot-segments so a malicious
  // filename like "../../escape.txt" can't break out of the user's namespace.
  // Also bound length so the resulting storage path stays under reasonable
  // limits.
  const safeFilename = rawFilename
    .replace(/[\\/]/g, "_")
    .replace(/\.\.+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 200) || "file.bin";

  const { data: membership } = await auth.supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const storagePath = `${conversationId}/${auth.user.id}/${Date.now()}-${safeFilename}`;
  const { data, error } = await auth.supabase.storage.from("secure-chat").createSignedUploadUrl(storagePath);

  if (error) {
    console.error("[chat/attachments/sign] storage sign failed", error.message);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }

  return NextResponse.json({
    path: storagePath,
    signedUrl: data.signedUrl,
    token: data.token
  });
}


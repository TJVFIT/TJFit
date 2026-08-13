import { NextRequest, NextResponse } from "next/server";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
import { isMissingSchemaMigrationError, jsonSchemaNotReady } from "@/lib/supabase-rpc-errors";

const BUCKET = "transformation-photos";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const rawFilename = typeof body.filename === "string" ? body.filename : "photo.jpg";
  const kind = body.kind === "after" ? "after" : "before";

  // Sanitize filename: strip path separators and dot-segments so a malicious
  // filename like "../../escape.txt" can't break out of the user's namespace.
  // Also bound length so the resulting storage path stays under reasonable
  // limits. Mirrors api/chat/attachments/sign's pattern.
  const safeFilename = rawFilename
    .replace(/[\\/]/g, "_")
    .replace(/\.\.+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 200) || "photo.jpg";

  const storagePath = `${auth.user.id}/${kind}-${Date.now()}-${safeFilename}`;
  const { data, error } = await auth.supabase.storage.from(BUCKET).createSignedUploadUrl(storagePath);

  if (error) {
    if (isMissingSchemaMigrationError(error.message)) {
      return jsonSchemaNotReady("api/community/transformations/upload-url:POST", error.message);
    }
    console.error("[community/transformations/upload-url] storage sign failed", error.message);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }

  const publicUrl = auth.supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

  return NextResponse.json({
    path: storagePath,
    signedUrl: data.signedUrl,
    token: data.token,
    publicUrl
  });
}

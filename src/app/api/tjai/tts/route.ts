import { NextResponse } from "next/server";

import { isTjaiPersona, loadTjaiUserSettings } from "@/lib/tjai";
import { synthesizeSpeech } from "@/lib/tjai/tts";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as
    | { text?: unknown; persona?: unknown }
    | null;

  const text = typeof body?.text === "string" ? body.text : "";
  if (!text.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });

  let persona = isTjaiPersona(body?.persona) ? body!.persona : null;
  if (!persona) {
    const settings = await loadTjaiUserSettings(auth.supabase, auth.user.id);
    persona = settings.persona;
  }

  try {
    const result = await synthesizeSpeech({ text, persona, userId: auth.user.id });
    const audio = Buffer.from(result.audioBase64, "base64");
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "private, max-age=86400",
        "X-TJAI-Cached": result.cached ? "1" : "0",
        "X-TJAI-Voice": result.voiceId
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS failed" },
      { status: 502 }
    );
  }
}

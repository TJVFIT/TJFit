import { NextResponse } from "next/server";

import { isTjaiPersona, loadTjaiUserSettings, saveTjaiUserSettings } from "@/lib/tjai";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await loadTjaiUserSettings(auth.supabase, auth.user.id);
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as
    | { persona?: unknown; memory_enabled?: unknown; tts_autoplay?: unknown }
    | null;

  const current = await loadTjaiUserSettings(auth.supabase, auth.user.id);
  const next = await saveTjaiUserSettings(auth.supabase, auth.user.id, {
    persona: isTjaiPersona(body?.persona) ? body!.persona : current.persona,
    memory_enabled:
      typeof body?.memory_enabled === "boolean" ? body!.memory_enabled : current.memory_enabled,
    tts_autoplay: typeof body?.tts_autoplay === "boolean" ? body!.tts_autoplay : current.tts_autoplay
  });
  return NextResponse.json(next);
}

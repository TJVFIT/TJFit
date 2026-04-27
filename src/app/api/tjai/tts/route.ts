import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { isTjaiPersona, loadTjaiUserSettings } from "@/lib/tjai";
import { checkRateLimit } from "@/lib/tjai/rate-limit";
import { synthesizeSpeech } from "@/lib/tjai/tts";
import { getTJAIAccess } from "@/lib/tjai-access";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Allow 60 TTS calls / 5 minutes / user. Cache hits are still logged so they
// count — that's intentional, prevents anyone burning bandwidth on replays.
const TTS_RATE_WINDOW_SEC = 300;
const TTS_RATE_MAX = 60;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  const [{ data: sub }, { data: profile }, { data: purchase }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    isAdminByEmail
      ? Promise.resolve({ data: { role: "admin" as const } })
      : admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle(),
    admin
      .from("tjai_plan_purchases")
      .select("id")
      .eq("user_id", auth.user.id)
      .order("purchased_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const isAdmin = isAdminByEmail || profile?.role === "admin";
  const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
  const access = getTJAIAccess(tier, {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    isAdmin
  });

  // Voice replies are a Pro+ feature. Free / core users hit the upgrade path.
  if (!isAdmin && tier === "core" && !access.canUseChat) {
    return NextResponse.json(
      { error: "Upgrade required for TJAI voice replies.", code: "UPGRADE_REQUIRED" },
      { status: 402 }
    );
  }

  // Rate limit (skip for admin).
  if (!isAdmin) {
    const rl = await checkRateLimit({
      supabase: admin,
      userId: auth.user.id,
      route: "tjai/tts",
      windowSeconds: TTS_RATE_WINDOW_SEC,
      max: TTS_RATE_MAX
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Slow down a bit.", code: "RATE_LIMITED" },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.resetIn),
            "X-RateLimit-Limit": String(TTS_RATE_MAX),
            "X-RateLimit-Remaining": "0"
          }
        }
      );
    }
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

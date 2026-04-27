import { createHash } from "crypto";

import type { TjaiPersona } from "@/lib/tjai/persona";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// ElevenLabs default voice IDs — override per persona via env if you want.
// These are well-known public voices; swap for branded ones once you've cloned.
const DEFAULT_VOICE_IDS: Record<TjaiPersona, string> = {
  drill: "TxGEqnHWrfWFTfGW9XjX", // Josh — strong/direct
  clinical: "ErXwobaYiN019PkySvjV", // Antoni — calm
  mentor: "21m00Tcm4TlvDq8ikWAM" // Rachel — warm
};

export function voiceIdForPersona(persona: TjaiPersona): string {
  const envKey = `ELEVENLABS_VOICE_${persona.toUpperCase()}`;
  return process.env[envKey] ?? DEFAULT_VOICE_IDS[persona];
}

const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_turbo_v2_5";

// Per-million-character price for turbo v2.5 — update if you change tier.
const ELEVENLABS_PRICE_PER_M_CHARS = Number(process.env.ELEVENLABS_PRICE_PER_M_CHARS ?? 30);

function hashKey(text: string, voiceId: string, model: string): string {
  return createHash("sha256").update(`${voiceId}::${model}::${text}`).digest("hex");
}

export type TtsResult = {
  audioBase64: string;
  cached: boolean;
  voiceId: string;
  bytes: number;
  costUsd: number;
};

export async function synthesizeSpeech({
  text,
  persona,
  userId,
  route = "tjai/tts"
}: {
  text: string;
  persona: TjaiPersona;
  userId?: string | null;
  route?: string;
}): Promise<TtsResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  // Hard cap to keep costs sane and to fit ElevenLabs limits.
  const trimmed = text.trim().slice(0, 1500);
  if (!trimmed) throw new Error("Empty text");

  const voiceId = voiceIdForPersona(persona);
  const key = hashKey(trimmed, voiceId, ELEVENLABS_MODEL);

  const admin = getSupabaseServerClient();

  if (admin) {
    const { data: cached } = await admin
      .from("tjai_tts_cache")
      .select("audio_b64,bytes")
      .eq("hash", key)
      .maybeSingle();
    if (cached?.audio_b64) {
      void admin
        .from("tjai_tts_cache")
        .update({ hit_count: ((cached as { hit_count?: number } | null)?.hit_count ?? 0) + 1, last_hit_at: new Date().toISOString() })
        .eq("hash", key);
      return {
        audioBase64: cached.audio_b64,
        cached: true,
        voiceId,
        bytes: cached.bytes ?? 0,
        costUsd: 0
      };
    }
  }

  const t0 = Date.now();
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg"
    },
    body: JSON.stringify({
      text: trimmed,
      model_id: ELEVENLABS_MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true }
    })
  });

  if (!response.ok) {
    const raw = await response.text();
    void logTtsCall({
      userId,
      route,
      voiceId,
      chars: trimmed.length,
      latency_ms: Date.now() - t0,
      ok: false,
      error: raw.slice(0, 300)
    });
    throw new Error(`ElevenLabs error: ${raw.slice(0, 300)}`);
  }

  const buf = Buffer.from(await response.arrayBuffer());
  const audioBase64 = buf.toString("base64");
  const costUsd = (trimmed.length * ELEVENLABS_PRICE_PER_M_CHARS) / 1_000_000;

  if (admin) {
    void admin.from("tjai_tts_cache").upsert(
      {
        hash: key,
        voice_id: voiceId,
        audio_b64: audioBase64,
        bytes: buf.byteLength
      },
      { onConflict: "hash" }
    );
  }

  void logTtsCall({
    userId,
    route,
    voiceId,
    chars: trimmed.length,
    latency_ms: Date.now() - t0,
    ok: true,
    costUsd
  });

  return { audioBase64, cached: false, voiceId, bytes: buf.byteLength, costUsd };
}

async function logTtsCall(input: {
  userId?: string | null;
  route: string;
  voiceId: string;
  chars: number;
  latency_ms: number;
  ok: boolean;
  costUsd?: number;
  error?: string;
}): Promise<void> {
  try {
    const admin = getSupabaseServerClient();
    if (!admin) return;
    await admin.from("tjai_ai_call_logs").insert({
      user_id: input.userId ?? null,
      route: input.route,
      task: "tts",
      provider: "elevenlabs",
      model: `${ELEVENLABS_MODEL}:${input.voiceId}`,
      input_tokens: input.chars,
      output_tokens: 0,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      latency_ms: input.latency_ms,
      cost_usd: Number((input.costUsd ?? 0).toFixed(6)),
      ok: input.ok,
      error: input.error ?? null
    });
  } catch {
    /* swallow */
  }
}

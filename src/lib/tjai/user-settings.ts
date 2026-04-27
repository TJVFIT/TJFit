import type { SupabaseClient } from "@supabase/supabase-js";

import { isTjaiPersona, type TjaiPersona } from "@/lib/tjai/persona";

export type TjaiUserSettings = {
  persona: TjaiPersona;
  memory_enabled: boolean;
  tts_autoplay: boolean;
};

const DEFAULT_SETTINGS: TjaiUserSettings = {
  persona: "mentor",
  memory_enabled: true,
  tts_autoplay: false
};

export async function loadTjaiUserSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<TjaiUserSettings> {
  const { data } = await supabase
    .from("tjai_user_settings")
    .select("persona,memory_enabled,tts_autoplay")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return DEFAULT_SETTINGS;
  return {
    persona: isTjaiPersona(data.persona) ? data.persona : DEFAULT_SETTINGS.persona,
    memory_enabled: typeof data.memory_enabled === "boolean" ? data.memory_enabled : DEFAULT_SETTINGS.memory_enabled,
    tts_autoplay: typeof data.tts_autoplay === "boolean" ? data.tts_autoplay : DEFAULT_SETTINGS.tts_autoplay
  };
}

export async function saveTjaiUserSettings(
  supabase: SupabaseClient,
  userId: string,
  patch: Partial<TjaiUserSettings>
): Promise<TjaiUserSettings> {
  const next: TjaiUserSettings = { ...DEFAULT_SETTINGS, ...patch };
  if (!isTjaiPersona(next.persona)) next.persona = DEFAULT_SETTINGS.persona;
  await supabase.from("tjai_user_settings").upsert(
    {
      user_id: userId,
      persona: next.persona,
      memory_enabled: next.memory_enabled,
      tts_autoplay: next.tts_autoplay,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );
  return next;
}

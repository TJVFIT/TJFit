"use server";

import { headers } from "next/headers";

import { resolveEffectiveServerRole } from "@/lib/coach-area-server";
import { getCoachTermsVersion } from "@/lib/coach-terms-version";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function acceptCoachTermsAction(): Promise<{ ok: true } | { ok: false; error: string }> {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return { ok: false, error: "Service unavailable." };
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user?.id) {
    return { ok: false, error: "Unauthorized." };
  }

  const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
  if (role !== "coach") {
    return { ok: false, error: "Only coaches can accept coach terms." };
  }

  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const termsVersion = getCoachTermsVersion();

  const { error } = await supabase.from("coach_terms_acceptance").upsert(
    {
      coach_id: user.id,
      terms_version: termsVersion,
      ip_address: ip,
      accepted_at: new Date().toISOString()
    },
    { onConflict: "coach_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

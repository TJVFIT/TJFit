import { NextRequest, NextResponse } from "next/server";

import { resolveEffectiveServerRole } from "@/lib/coach-area-server";
import { getCoachTermsVersion } from "@/lib/coach-terms-version";
import { readRequestJson } from "@/lib/read-request-json";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await resolveEffectiveServerRole(supabase, user.id, user.email ?? undefined);
  if (role !== "coach") {
    return NextResponse.json({ error: "Only coaches must accept coach terms." }, { status: 403 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const accepted = Boolean(body.accepted);
  if (!accepted) {
    return NextResponse.json({ error: "Acceptance required." }, { status: 400 });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? null;
  const termsVersion = getCoachTermsVersion();

  const { error: insertError } = await supabase.from("coach_terms_acceptance").insert({
    coach_id: user.id,
    terms_version: termsVersion,
    ip_address: ip
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, termsVersion });
}

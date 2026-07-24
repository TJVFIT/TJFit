import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/auth-utils";
import { getCoachTermsVersion } from "@/lib/coach-terms-version";
import type { SupabaseClient } from "@supabase/supabase-js";

type Role = "admin" | "coach";

type RequireCoachOrAdminResult =
  | { ok: true; supabase: SupabaseClient; userId: string; role: Role }
  | { ok: false; response: NextResponse };

export async function requireCoachOrAdmin(): Promise<RequireCoachOrAdminResult> {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 })
    };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  if (user.email && isAdminEmail(user.email)) {
    const serviceClient = getSupabaseServerClient();
    if (!serviceClient) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Admin backend not configured." }, { status: 503 })
      };
    }
    return {
      ok: true,
      supabase: serviceClient,
      userId: user.id,
      role: "admin"
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    const serviceClient = getSupabaseServerClient();
    if (!serviceClient) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Admin backend not configured." }, { status: 503 })
      };
    }
    return {
      ok: true,
      supabase: serviceClient,
      userId: user.id,
      role: "admin"
    };
  }

  if (profile?.role === "coach") {
    const expected = getCoachTermsVersion();
    const { data: acceptRow } = await supabase
      .from("coach_terms_acceptance")
      .select("terms_version")
      .eq("coach_id", user.id)
      .order("accepted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (acceptRow?.terms_version !== expected) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Accept the coach terms to use this feature.", code: "coach_terms_required" },
          { status: 403 }
        )
      };
    }
    const serviceClient = getSupabaseServerClient();
    if (!serviceClient) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Coach backend not configured." }, { status: 503 })
      };
    }
    return {
      ok: true,
      supabase: serviceClient,
      userId: user.id,
      role: "coach"
    };
  }

  return {
    ok: false,
    response: NextResponse.json({ error: "Forbidden" }, { status: 403 })
  };
}

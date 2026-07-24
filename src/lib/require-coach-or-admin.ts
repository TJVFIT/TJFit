import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/auth-utils";
import type { SupabaseClient } from "@supabase/supabase-js";

type Role = "admin" | "coach";

type RequireCoachOrAdminResult =
  | {
      ok: true;
      supabase: SupabaseClient;
      userId: string;
      userEmail: string | null;
      role: Role;
    }
  | { ok: false; response: NextResponse };

export async function requireCoachOrAdmin(): Promise<RequireCoachOrAdminResult> {
  let supabase: SupabaseClient;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication service is not configured." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      )
    };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      )
    };
  }

  if (user.email && isAdminEmail(user.email)) {
    const serviceClient = getSupabaseServerClient();
    if (!serviceClient) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Admin backend not configured." },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        )
      };
    }
    return {
      ok: true,
      supabase: serviceClient,
      userId: user.id,
      userEmail: user.email ?? null,
      role: "admin"
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authorization service is unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      )
    };
  }

  if (profile?.role === "admin") {
    const serviceClient = getSupabaseServerClient();
    if (!serviceClient) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Admin backend not configured." },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        )
      };
    }
    return {
      ok: true,
      supabase: serviceClient,
      userId: user.id,
      userEmail: user.email ?? null,
      role: "admin"
    };
  }

  if (profile?.role === "coach") {
    const serviceClient = getSupabaseServerClient();
    if (!serviceClient) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Coach backend not configured." },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        )
      };
    }
    return {
      ok: true,
      supabase: serviceClient,
      userId: user.id,
      userEmail: user.email ?? null,
      role: "coach"
    };
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  };
}

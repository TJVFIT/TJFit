import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/auth-utils";
import type { SupabaseClient } from "@supabase/supabase-js";

type RequireAdminResult =
  | { ok: true; supabase: SupabaseClient; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Use in admin API routes. Verifies Supabase session and admin role.
 * Returns supabase client (with user context) + userId if admin, else 401/403 response.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
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

  let isAdmin = false;
  if (user.email && isAdminEmail(user.email)) {
    isAdmin = true;
  } else {
    const { data, error: profileError } = await supabase
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

    if (data?.role === "admin") isAdmin = true;
  }

  if (!isAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      )
    };
  }

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
    userId: user.id
  };
}

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

  let isAdmin = false;
  if (user.email && isAdminEmail(user.email)) {
    isAdmin = true;
  } else {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError) {
      console.error("requireAdmin: profile fetch failed", profileError);
      return {
        ok: false,
        response: NextResponse.json({ error: "Admin check failed. Please try again." }, { status: 500 })
      };
    }
    if (data?.role === "admin") isAdmin = true;
  }

  if (!isAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 })
    };
  }

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
    userId: user.id
  };
}

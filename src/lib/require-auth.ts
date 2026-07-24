import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RequireAuthResult =
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; response: NextResponse };

export async function requireAuth(): Promise<RequireAuthResult> {
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

  return { ok: true, supabase, user };
}

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type AuthUser = {
  id: string;
  email?: string;
};

type RequireAuthResult =
  | { ok: true; supabase: ReturnType<typeof createServerSupabaseClient>; user: AuthUser }
  | { ok: false; response: NextResponse };

export async function requireAuth(): Promise<RequireAuthResult> {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Service temporarily unavailable.", code: "SUPABASE_MISCONFIGURED" },
        { status: 503 }
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
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    ok: true,
    supabase,
    user: {
      id: user.id,
      email: user.email ?? undefined
    }
  };
}


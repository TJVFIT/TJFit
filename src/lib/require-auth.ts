import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AUTH_SERVICE_UNAVAILABLE, classifyAuthSessionFailure } from "@/lib/auth-session-failure";

type AuthUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string;
};

type RequireAuthResult =
  | { ok: true; supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>; user: AuthUser }
  | { ok: false; response: NextResponse };

export async function requireAuth(): Promise<RequireAuthResult> {
  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Service temporarily unavailable.", code: "SUPABASE_MISCONFIGURED" },
        { status: 503 }
      )
    };
  }

  let result: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    result = await supabase.auth.getUser();
  } catch (error) {
    return authFailure(error);
  }
  const { data: { user }, error } = result;

  if (error) return authFailure(error);
  if (!user) {
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
      email: user.email ?? undefined,
      email_confirmed_at: user.email_confirmed_at ?? undefined
    }
  };
}

function authFailure(error: unknown): RequireAuthResult {
  if (classifyAuthSessionFailure(error) === "signed_out") {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return {
    ok: false,
    response: NextResponse.json(
      { error: "Service temporarily unavailable.", code: AUTH_SERVICE_UNAVAILABLE },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    )
  };
}


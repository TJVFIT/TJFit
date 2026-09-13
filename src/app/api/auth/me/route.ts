import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-utils";
import { logServerError, logServerWarning } from "@/lib/server-log";
import { AUTH_SERVICE_UNAVAILABLE, classifyAuthSessionFailure } from "@/lib/auth-session-failure";

export const dynamic = "force-dynamic";

export type Role = "admin" | "coach" | "user" | null;

function unavailable(scope: string, code = AUTH_SERVICE_UNAVAILABLE) {
  logServerError(scope, { code });
  return NextResponse.json(
    { user: null, role: null, error: "Service temporarily unavailable.", code },
    { status: 503, headers: { "Cache-Control": "private, no-store" } }
  );
}

function signedOut() {
  return NextResponse.json({ user: null, role: null }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function GET() {
  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return NextResponse.json(
      { user: null, role: null, error: "Service temporarily unavailable.", code: "SUPABASE_MISCONFIGURED" },
      { status: 503 }
    );
  }

  let result: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    result = await supabase.auth.getUser();
  } catch (error) {
    return classifyAuthSessionFailure(error) === "signed_out" ? signedOut() : unavailable("api/auth/me:getUser");
  }
  const { data: { user }, error: authError } = result;

  if (authError) {
    return classifyAuthSessionFailure(authError) === "signed_out" ? signedOut() : unavailable("api/auth/me:getUser");
  }

  if (!user) return signedOut();

  try {
    const { data: profileRow, error: profileErr } = await supabase
      .from("profiles")
      .select("role, username, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr) {
      return unavailable("api/auth/me:profiles", "PROFILE_SERVICE_UNAVAILABLE");
    }

    let role: Role = "user";

    if (user.email && isAdminEmail(user.email)) {
      role = "admin";
    } else {
      if (profileRow?.role === "coach") role = "coach";
      if (profileRow?.role === "admin") role = "admin";
    }

    const { data: activeCoachLink, error: linkErr } = await supabase
      .from("coach_student_links")
      .select("id,coach_id,student_id")
      .or(`student_id.eq.${user.id},coach_id.eq.${user.id}`)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (linkErr) {
      logServerWarning("api/auth/me:coach_student_links", "relationship_lookup_failed");
    }

    const hasActiveCoachChat =
      role === "coach" || role === "admin" || Boolean(activeCoachLink && activeCoachLink.student_id === user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? undefined
      },
      role,
      hasActiveCoachChat,
      activeCoachId:
        activeCoachLink && activeCoachLink.student_id === user.id ? activeCoachLink.coach_id : undefined,
      profile: profileRow
        ? {
            username: profileRow.username ?? undefined,
            display_name: profileRow.display_name ?? undefined,
            avatar_url: profileRow.avatar_url ?? undefined
          }
        : undefined
    });
  } catch {
    return unavailable("api/auth/me:profile_context", "PROFILE_SERVICE_UNAVAILABLE");
  }
}


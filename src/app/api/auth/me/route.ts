import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-utils";
import { logServerError, logServerWarning } from "@/lib/server-log";

export const dynamic = "force-dynamic";

export type Role = "admin" | "coach" | "user" | null;

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      logServerWarning("api/auth/me:getUser", authError.message, { code: authError.code });
      return NextResponse.json({ user: null, role: null });
    }

    if (!user) {
      return NextResponse.json({ user: null, role: null });
    }

    const { data: profileRow, error: profileErr } = await supabase
      .from("profiles")
      .select("role, username, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr) {
      logServerError("api/auth/me:profiles", profileErr, { userId: user.id });
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
      logServerWarning("api/auth/me:coach_student_links", linkErr.message, { userId: user.id });
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
  } catch (e) {
    logServerError("api/auth/me:unhandled", e);
    return NextResponse.json({ user: null, role: null });
  }
}

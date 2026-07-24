import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-utils";

export type Role = "admin" | "coach" | "user" | null;

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { user: null, role: null },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    let role: Role = "user";

    if (user.email && isAdminEmail(user.email)) {
      role = "admin";
    } else {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError) {
        return NextResponse.json(
          { error: "Unable to load account authorization." },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
      if (data?.role === "coach") role = "coach";
      if (data?.role === "admin") role = "admin";
    }

    const { data: activeCoachLink, error: coachLinkError } = await supabase
      .from("coach_student_links")
      .select("coach_id,student_id")
      .or(`student_id.eq.${user.id},coach_id.eq.${user.id}`)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    const hasActiveCoachChat =
      role === "coach" ||
      role === "admin" ||
      (!coachLinkError && Boolean(activeCoachLink && activeCoachLink.student_id === user.id));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? undefined
      },
      role,
      hasActiveCoachChat,
      activeCoachId:
        activeCoachLink && activeCoachLink.student_id === user.id ? activeCoachLink.coach_id : undefined
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json(
      { user: null, role: null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

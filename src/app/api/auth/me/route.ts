import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-utils";

export type Role = "admin" | "coach" | "user" | null;

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null, role: null });
    }

    let role: Role = "user";

    if (user.email && isAdminEmail(user.email)) {
      role = "admin";
    } else {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (data?.role === "coach") role = "coach";
      if (data?.role === "admin") role = "admin";
    }

    const { data: activeCoachLink } = await supabase
      .from("coach_student_links")
      .select("id,coach_id,student_id")
      .or(`student_id.eq.${user.id},coach_id.eq.${user.id}`)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

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
        activeCoachLink && activeCoachLink.student_id === user.id ? activeCoachLink.coach_id : undefined
    });
  } catch {
    return NextResponse.json({ user: null, role: null });
  }
}

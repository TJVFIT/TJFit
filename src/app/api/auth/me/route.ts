import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-utils";

export type Role = "admin" | "coach" | null;

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

    let role: Role = null;

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

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? undefined
      },
      role
    });
  } catch {
    return NextResponse.json({ user: null, role: null });
  }
}

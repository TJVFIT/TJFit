import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data: profile, error: profileErr } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profileErr || (profile?.role !== "coach" && profile?.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { count, error } = await auth.supabase
    .from("coach_student_links")
    .select("id", { count: "exact", head: true })
    .eq("coach_id", auth.user.id)
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}

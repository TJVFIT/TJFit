import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: profile } = await admin
    .from("profiles")
    .select("id,role,is_verified,created_at")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const daysActive = Math.floor((Date.now() - new Date(String(profile.created_at ?? new Date().toISOString())).getTime()) / (24 * 60 * 60 * 1000));
  const { count: paidPrograms } = await admin
    .from("program_orders")
    .select("*", { head: true, count: "exact" })
    .eq("user_id", auth.user.id)
    .eq("status", "paid");
  const isCoachOrAdmin = profile.role === "coach" || profile.role === "admin";
  const eligible = isCoachOrAdmin || Boolean(profile.is_verified) || ((paidPrograms ?? 0) > 0 && daysActive >= 30);
  if (!profile.is_verified && !isCoachOrAdmin && eligible) {
    await admin.from("profiles").update({ is_verified: true }).eq("id", auth.user.id);
  }
  return NextResponse.json({ eligible, paidPrograms: paidPrograms ?? 0, daysActive });
}


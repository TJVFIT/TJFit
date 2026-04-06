import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300;

export async function GET() {
  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const todayIso = new Date();
  todayIso.setHours(0, 0, 0, 0);

  const [{ count: activeToday }, { count: programsStartedToday }] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }).gte("updated_at", sinceIso),
    adminClient.from("program_orders").select("id", { count: "exact", head: true }).gte("created_at", todayIso.toISOString())
  ]);

  return NextResponse.json({
    activeToday: activeToday ?? 0,
    programsStartedToday: programsStartedToday ?? 0
  });
}


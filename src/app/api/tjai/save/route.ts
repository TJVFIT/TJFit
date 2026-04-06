import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { plan, answers, metrics } = body ?? {};
  if (!plan || !answers || !metrics) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  const { error } = await auth.supabase.from("saved_tjai_plans").insert({
    user_id: auth.user.id,
    plan_json: plan,
    answers_json: answers,
    metrics_json: metrics
  });

  if (error) {
    return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await auth.supabase
    .from("saved_tjai_plans")
    .select("id, plan_json, answers_json, metrics_json, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
  return NextResponse.json({ plans: data ?? [] });
}


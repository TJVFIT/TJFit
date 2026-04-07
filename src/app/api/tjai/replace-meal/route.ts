import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    planId?: string;
    weekIndex?: number;
    dayIndex?: number;
    mealIndex?: number;
    meal?: unknown;
  } | null;
  const planId = String(body?.planId ?? "");
  const weekIndex = Number(body?.weekIndex ?? -1);
  const dayIndex = Number(body?.dayIndex ?? -1);
  const mealIndex = Number(body?.mealIndex ?? -1);
  if (!planId || weekIndex < 0 || dayIndex < 0 || mealIndex < 0 || !body?.meal) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: planRow } = await auth.supabase
    .from("saved_tjai_plans")
    .select("id,plan_json")
    .eq("id", planId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!planRow) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  const plan = planRow.plan_json as any;
  if (!plan?.diet?.weeks?.[0]?.days) return NextResponse.json({ error: "Invalid plan format" }, { status: 400 });

  const day = plan.diet.weeks[weekIndex]?.days?.[dayIndex];
  if (!day?.meals?.[mealIndex]) return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  day.meals[mealIndex] = body.meal;

  const { error } = await auth.supabase.from("saved_tjai_plans").update({ plan_json: plan }).eq("id", planId).eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { getTJAIAccess } from "@/lib/tjai-access";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  const [{ data: sub }, { data: purchase }, { data: profile }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    admin.from("tjai_plan_purchases").select("id").eq("user_id", auth.user.id).order("purchased_at", { ascending: false }).limit(1).maybeSingle(),
    isAdminByEmail ? Promise.resolve({ data: { role: "admin" } }) : admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()
  ]);
  const access = getTJAIAccess((sub?.tier ?? "core") as "core" | "pro" | "apex", {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    isAdmin: isAdminByEmail || profile?.role === "admin"
  });
  if (!access.canUseMealSwap) {
    return NextResponse.json({ error: "Upgrade required for meal swaps." }, { status: 402 });
  }

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

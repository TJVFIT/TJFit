import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { getTJAIAccess } from "@/lib/tjai-access";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const MEAL_PAYLOAD_MAX_BYTES = 8 * 1024;

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
  if (!Number.isInteger(weekIndex) || !Number.isInteger(dayIndex) || !Number.isInteger(mealIndex)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  // Bound the replacement payload — the meal object is embedded in
  // plan_json which is loaded into the chat-context prompt. A malicious
  // payload could stuff massive content into a meal and bloat every chat.
  let mealJson: string;
  try {
    mealJson = JSON.stringify(body.meal);
  } catch {
    return NextResponse.json({ error: "Invalid meal payload" }, { status: 400 });
  }
  if (mealJson.length > MEAL_PAYLOAD_MAX_BYTES) {
    return NextResponse.json({ error: "Meal payload too large" }, { status: 413 });
  }

  // Atomic in-place update via Postgres jsonb_set. The previous flow did
  // read-modify-write on the whole plan_json blob, so two concurrent meal
  // replacements (e.g. user edits Day-1 Lunch while a background swap
  // updates Day-3 Dinner) would both load the same starting JSON and the
  // earlier write would get clobbered by the later. The RPC mutates a
  // precise path, so concurrent updates target different cells.
  const { data: ok, error } = await admin.rpc("tjfit_replace_meal", {
    p_user_id: auth.user.id,
    p_plan_id: planId,
    p_week_index: weekIndex,
    p_day_index: dayIndex,
    p_meal_index: mealIndex,
    p_meal: body.meal
  });

  if (error) {
    console.error("[tjai/replace-meal] rpc failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to replace meal" }, { status: 500 });
  }
  if (!ok) {
    return NextResponse.json({ error: "Plan or meal not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

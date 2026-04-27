import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { callOpenAI, safeParseJSON } from "@/lib/tjai-openai";
import { getTJAIAccess } from "@/lib/tjai-access";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const body = await request.json().catch(() => null);
  const originalMeal = body?.originalMeal;
  const planContext = body?.planContext;
  if (!originalMeal || !planContext) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  try {
    const text = await callOpenAI({
      maxTokens: 1500,
      jsonMode: true,
      task: "swap",
      route: "tjai/swap-meal",
      userId: auth.user.id,
      system: "You are TJAI. Generate 3 alternative meals. Return JSON only.",
      user: `Generate 3 meals that can replace this meal:
${JSON.stringify(originalMeal)}
Requirements:
- Same calories (+/-30 kcal)
- Same protein (+/-5g)
- Similar carbs and fat
- User likes: ${JSON.stringify(planContext.preferences ?? [])}
- User avoids: ${JSON.stringify(planContext.restrictions ?? [])}
- Budget: ${planContext.budget}
- Return JSON: {"alternatives":[MealObject,MealObject,MealObject]}
MealObject fields: name,time,foods,calories,protein,carbs,fat,prepNote,recipe`
    });
    const parsed = safeParseJSON<{ alternatives?: unknown[] }>(text);
    return NextResponse.json({ alternatives: parsed.alternatives ?? [] });
  } catch (error) {
    return NextResponse.json({ error: "Swap generation failed", details: String(error) }, { status: 500 });
  }
}


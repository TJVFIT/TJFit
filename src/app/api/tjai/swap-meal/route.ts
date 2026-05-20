import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
// Anthropic-backed (dual-provider). Uses Claude via @/lib/tjai-anthropic
// for fast structured meal-swap reasoning; the rest of TJAI runs on
// OpenAI. Requires ANTHROPIC_API_KEY in env (see .env.example).
import { callClaude, extractJsonBlock } from "@/lib/tjai-anthropic";
import { rateLimit } from "@/lib/rate-limit";
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

  // Enforce the tier's daily meal-swap limit. The limit was defined in
  // getTJAIAccess (apex=10, pro=3, core=0) but never enforced — pro users
  // could spam Claude indefinitely. Bucket size = 24h gives a per-day cap.
  // Admins bypass via mealSwapDailyLimit=999.
  if (access.mealSwapDailyLimit > 0) {
    const limiter = await rateLimit({
      key: `tjai-meal-swap:${auth.user.id}`,
      limit: access.mealSwapDailyLimit,
      windowMs: 24 * 60 * 60 * 1000
    });
    if (!limiter.success) {
      return NextResponse.json(
        {
          error: "Daily meal-swap limit reached. Resets in 24h.",
          code: "daily_limit",
          limit: access.mealSwapDailyLimit
        },
        { status: 429 }
      );
    }
  }

  const body = await request.json().catch(() => null);
  const originalMeal = body?.originalMeal;
  const planContext = body?.planContext;
  if (!originalMeal || !planContext) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  try {
    const text = await callClaude({
      maxTokens: 1500,
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
    const json = extractJsonBlock(text);
    if (!json) return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    const parsed = JSON.parse(json);
    return NextResponse.json({ alternatives: parsed.alternatives ?? [] });
  } catch (error) {
    // Don't leak raw Claude/network error text to clients.
    console.error("[tjai/swap-meal] generation failed", error);
    return NextResponse.json({ error: "Swap generation failed" }, { status: 500 });
  }
}


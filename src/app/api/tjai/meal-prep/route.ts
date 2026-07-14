import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { extractJsonBlock } from "@/lib/tjai-anthropic";
import { llmCall } from "@/lib/tjai/llm";
import { isTaskAvailable, providerUnavailableBody } from "@/lib/tjai/provider-policy";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const WEEK_MAX_BYTES = 32 * 1024;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Tier gate — previously this Claude-backed endpoint had no access check at
  // all, so any free user could spam it and burn Anthropic budget.
  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  const [{ data: sub }, { data: purchase }, { data: profile }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    admin.from("tjai_plan_purchases").select("id").eq("user_id", auth.user.id).order("purchased_at", { ascending: false }).limit(1).maybeSingle(),
    isAdminByEmail
      ? Promise.resolve({ data: { role: "admin" } })
      : admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()
  ]);
  const access = getTJAIAccess((sub?.tier ?? "core") as "core" | "pro" | "apex", {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    isAdmin: isAdminByEmail || profile?.role === "admin"
  });
  if (!access.canUseMealSwap) {
    return NextResponse.json({ error: "Upgrade required." }, { status: 402 });
  }

  const limiter = await rateLimit({
    key: `tjai-meal-prep:${auth.user.id}`,
    limit: 10,
    windowMs: 60 * 60 * 1000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const week = body?.week;
  if (!week) return NextResponse.json({ error: "Missing week meals" }, { status: 400 });

  const weekJson = JSON.stringify(week);
  if (weekJson.length > WEEK_MAX_BYTES) {
    return NextResponse.json({ error: "Week payload too large." }, { status: 413 });
  }

  if (!isTaskAvailable("meal_prep")) {
    return NextResponse.json(providerUnavailableBody(), { status: 503 });
  }

  try {
    const text = await llmCall({
      maxTokens: 2000,
      task: "meal_prep",
      route: "tjai/meal-prep",
      userId: auth.user.id,
      system: "You are TJAI. Return JSON only.",
      user: `Create a Sunday meal prep schedule for these meals.
Order tasks for efficiency, include exact quantities/times/storage.
Total prep under 2 hours.
Return JSON:
{"totalTime":"~120 min","equipment":["..."],"timeline":[{"time":"0:00-0:20","task":"...","detail":"...","storage":"..."}]}
Meals:
${weekJson}`
    });
    const json = extractJsonBlock(text);
    if (!json) return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    return NextResponse.json(JSON.parse(json));
  } catch (error) {
    console.error("[tjai/meal-prep] generation failed", error);
    return NextResponse.json({ error: "Meal prep generation failed" }, { status: 500 });
  }
}

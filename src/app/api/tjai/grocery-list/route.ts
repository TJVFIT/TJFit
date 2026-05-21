import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
// Anthropic-backed (dual-provider). Uses Claude via @/lib/tjai-anthropic
// for grocery-list extraction; the rest of TJAI runs on OpenAI.
// Requires ANTHROPIC_API_KEY in env (see .env.example).
import { callClaude, extractJsonBlock } from "@/lib/tjai-anthropic";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Refuse oversized prompts — grocery-list passes `week` (a meal-plan JSON)
// into the Claude prompt. A malicious payload could embed huge content to
// blow past token limits or just waste credits. 32KB is generous for a week.
const WEEK_MAX_BYTES = 32 * 1024;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Tier gate — previously this Claude-backed endpoint had no access check at
  // all, so any free user could call it indefinitely and burn Anthropic
  // budget. Reuse canUseMealSwap (pro/apex + plan purchase) since it's a
  // meal-plan derivative feature.
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

  // Generous rate limit — legitimate weekly use needs maybe 1-2 calls. 10/hr
  // covers retries without letting a malicious client spam Claude.
  const limiter = await rateLimit({
    key: `tjai-grocery-list:${auth.user.id}`,
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

  try {
    const text = await callClaude({
      maxTokens: 2000,
      task: "extract",
      route: "tjai/grocery-list",
      userId: auth.user.id,
      system: "You are TJAI. Return JSON only.",
      user: `Extract ingredients from these meals, combine duplicates, total quantities for one week.
Organize categories: proteins, carbs_and_grains, vegetables_and_fruits, dairy_and_eggs, pantry_and_condiments, supplements.
Return JSON:
{"categories":[{"name":"Proteins","items":[{"name":"Chicken breast","quantity":"1.2","unit":"kg"}]}]}
Meals:
${weekJson}`
    });
    const json = extractJsonBlock(text);
    if (!json) return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    return NextResponse.json(JSON.parse(json));
  } catch (error) {
    // Don't leak Claude/network internals to client.
    console.error("[tjai/grocery-list] generation failed", error);
    return NextResponse.json({ error: "Grocery list generation failed" }, { status: 500 });
  }
}

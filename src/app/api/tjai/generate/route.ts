import { NextRequest, NextResponse } from "next/server";

import { buildTJAISystemPrompt, buildTJAIUserPrompt } from "@/lib/tjai-prompts";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { calculateTJAIMetrics } from "@/lib/tjai-science";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const [{ data: subscription }, { data: purchase }] = await Promise.all([
    adminClient.from("user_subscriptions").select("tier,status,trial_ends_at").eq("user_id", authResult.user.id).maybeSingle(),
    adminClient
      .from("tjai_plan_purchases")
      .select("id")
      .eq("user_id", authResult.user.id)
      .order("purchased_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const tier = (subscription?.tier ?? "core") as "core" | "pro" | "apex";
  const isTrialActive = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).getTime() > Date.now() : false;
  const access = getTJAIAccess(tier, {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    coreTrialMessagesRemaining: isTrialActive ? 10 : 0
  });
  if (!access.canGeneratePlan) {
    return NextResponse.json(
      {
        error: "TJAI full generation is available for Pro, Apex, or one-time plan purchase users.",
        code: "TJAI_UPGRADE_REQUIRED",
        upsell: { proMonthlyEur: 20, apexMonthlyEur: 35, oneTimeEur: 9.99 }
      },
      { status: 402 }
    );
  }

  const body = await request.json().catch(() => null);
  const answers = body?.answers;
  const paceOverride = typeof body?.paceOverride === "string" ? body.paceOverride : null;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const effectiveAnswers = paceOverride ? { ...answers, s2_pace: paceOverride } : answers;

  const metrics = calculateTJAIMetrics(effectiveAnswers);
  const systemPrompt = buildTJAISystemPrompt();
  const userPrompt = buildTJAIUserPrompt(effectiveAnswers, metrics);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 10000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!response.ok) {
      const raw = await response.text();
      return NextResponse.json({ error: "AI generation failed", details: raw.slice(0, 400) }, { status: 502 });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 502 });
    }

    const plan = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      plan,
      metrics,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


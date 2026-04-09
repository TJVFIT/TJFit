import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { recordPlanGeneration, getSimilarUserInsight } from "@/lib/tjai-analytics";
import { buildTJAISystemPrompt, buildTJAIUserPrompt } from "@/lib/tjai-prompts";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { calculateTJAIMetrics } from "@/lib/tjai-science";
import type { QuizAnswers } from "@/lib/tjai-types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = getSupabaseServerClient();
    if (!adminClient) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const isAdminByEmail = Boolean(authResult.user.email && isAdminEmail(authResult.user.email));
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
    let isAdminByRole = false;
    if (!isAdminByEmail) {
      const { data: profile } = await adminClient.from("profiles").select("role").eq("id", authResult.user.id).maybeSingle();
      isAdminByRole = profile?.role === "admin";
    }
    const isAdmin = isAdminByEmail || isAdminByRole;
    const access = getTJAIAccess(tier, {
      hasOneTimePlanPurchase: Boolean(purchase?.id),
      coreTrialMessagesRemaining: isTrialActive ? 10 : 0,
      isAdmin
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
    const rawAnswers = body?.answers ?? body;
    const paceOverride = typeof body?.paceOverride === "string" ? body.paceOverride : null;
    if (!rawAnswers || typeof rawAnswers !== "object") {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    const answers = rawAnswers as Record<string, unknown>;
    const effectiveAnswers: Record<string, unknown> = paceOverride ? { ...answers, s2_pace: paceOverride } : answers;
    const trainingDaysRaw = String(effectiveAnswers.s5_days ?? effectiveAnswers.training_days ?? "3-4");
    const inferredTrainingDays = trainingDaysRaw.startsWith("1")
      ? 2
      : trainingDaysRaw.startsWith("3")
        ? 4
        : trainingDaysRaw.startsWith("5")
          ? 6
          : trainingDaysRaw.startsWith("7")
            ? 7
            : 4;

    const requiredAge = Number(effectiveAnswers.s1_age ?? effectiveAnswers.age ?? 0);
    const requiredWeight = Number(effectiveAnswers.s1_weight ?? effectiveAnswers.weight ?? 0);
    const requiredHeight = Number(effectiveAnswers.s1_height ?? effectiveAnswers.height ?? 0);
    if (!requiredAge || !requiredWeight || !requiredHeight) {
      return NextResponse.json(
        { error: "Missing required fields: age, weight, height" },
        { status: 400 }
      );
    }

    const quizAnswers = effectiveAnswers as QuizAnswers;
    const metrics = calculateTJAIMetrics(quizAnswers);
    const learningInsight = await getSimilarUserInsight(adminClient, effectiveAnswers);
    const systemPrompt = buildTJAISystemPrompt();
    const userPrompt = buildTJAIUserPrompt(quizAnswers, metrics) + (learningInsight ? `\n\n${learningInsight}` : "");
    console.log("TJAI generate called for user:", authResult.user.id);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("TJAI generate error: ANTHROPIC_API_KEY is not set");
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
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
      console.error("TJAI generate error: invalid response format", text);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 502 });
    }

    let plan: unknown;
    try {
      plan = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("TJAI generate JSON parse error:", parseError);
      console.error("TJAI generate full response:", text);
      return NextResponse.json({ error: "Failed to parse AI plan JSON" }, { status: 502 });
    }

    const { data: savedPlan, error: saveError } = await adminClient
      .from("saved_tjai_plans")
      .upsert(
        {
          user_id: authResult.user.id,
          answers_json: effectiveAnswers,
          metrics_json: metrics,
          plan_json: plan,
          goal: String(effectiveAnswers.s2_goal ?? effectiveAnswers.goal ?? "fat_loss"),
          daily_calories: Number(metrics.calorieTarget ?? 0),
          protein_g: Number(metrics.protein ?? 0),
          carbs_g: Number(metrics.carbs ?? 0),
          fat_g: Number(metrics.fat ?? 0),
          water_ml: Number(metrics.water ?? 0),
          training_days_per_week: inferredTrainingDays,
          training_location: String(effectiveAnswers.s5_type ?? effectiveAnswers.location ?? "gym"),
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      )
      .select("id")
      .maybeSingle();
    if (saveError) {
      console.error("TJAI generate save error:", saveError);
    }
    console.log("TJAI plan generated successfully for user:", authResult.user.id);

    // Record anonymous analytics (non-blocking)
    void recordPlanGeneration(adminClient, effectiveAnswers, Number(metrics.calorieTarget ?? 0), Number(metrics.protein ?? 0));

    return NextResponse.json({
      plan,
      metrics,
      generatedAt: new Date().toISOString(),
      planId: savedPlan?.id ?? null
    });
  } catch (error) {
    console.error("TJAI generate error:", error);
    return NextResponse.json(
      { error: "Generation failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


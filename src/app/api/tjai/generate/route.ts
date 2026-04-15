import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { recordPlanGeneration, getSimilarUserInsight } from "@/lib/tjai-analytics";
import { buildTJAISystemPrompt, buildTJAIUserPrompt } from "@/lib/tjai-prompts";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { calculateTJAIMetrics, parseRangeToNumber } from "@/lib/tjai-science";
import { callOpenAI, safeParseJSON } from "@/lib/tjai-openai";
import type { QuizAnswers } from "@/lib/tjai-types";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

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
      adminClient.from("tjai_plan_purchases").select("id").eq("user_id", authResult.user.id).order("purchased_at", { ascending: false }).limit(1).maybeSingle()
    ]);

    const tier = (subscription?.tier ?? "core") as "core" | "pro" | "apex";
    const isTrialActive = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).getTime() > Date.now() : false;
    let isAdminByRole = false;
    if (!isAdminByEmail) {
      const { data: profile } = await adminClient.from("profiles").select("role").eq("id", authResult.user.id).maybeSingle();
      isAdminByRole = profile?.role === "admin";
    }
    const isAdmin = isAdminByEmail || isAdminByRole;
    getTJAIAccess(tier, { hasOneTimePlanPurchase: Boolean(purchase?.id), coreTrialMessagesRemaining: isTrialActive ? 10 : 0, isAdmin });
    // Plan generation is open to all authenticated users

    const body = await request.json().catch(() => null);
    const rawAnswers = body?.answers ?? body;
    const paceOverride = typeof body?.paceOverride === "string" ? body.paceOverride : null;
    if (!rawAnswers || typeof rawAnswers !== "object") {
      return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
    }

    const answers = rawAnswers as Record<string, unknown>;
    const effectiveAnswers: Record<string, unknown> = paceOverride ? { ...answers, s2_pace: paceOverride } : answers;

    const trainingDaysRaw = String(effectiveAnswers.s5_days ?? effectiveAnswers.training_days ?? "3-4");
    const inferredTrainingDays = trainingDaysRaw.startsWith("1") ? 2 : trainingDaysRaw.startsWith("3") ? 4 : trainingDaysRaw.startsWith("5") ? 6 : trainingDaysRaw.startsWith("7") ? 7 : 4;

    // Support range strings ("25–34 years", "65–80 kg") or plain numbers
    const requiredAge = parseRangeToNumber(effectiveAnswers.s1_age ?? effectiveAnswers.age, 0);
    const requiredWeight = parseRangeToNumber(effectiveAnswers.s1_weight ?? effectiveAnswers.weight, 0);
    const requiredHeight = parseRangeToNumber(effectiveAnswers.s1_height ?? effectiveAnswers.height, 0);

    if (!Number.isFinite(requiredAge) || requiredAge <= 0 || !Number.isFinite(requiredWeight) || requiredWeight <= 0 || !Number.isFinite(requiredHeight) || requiredHeight <= 0) {
      return NextResponse.json({ error: "Missing required fields: age, weight, height. Please complete all questions." }, { status: 400 });
    }

    const quizAnswers = effectiveAnswers as QuizAnswers;
    const metrics = calculateTJAIMetrics(quizAnswers);
    const learningInsight = await getSimilarUserInsight(adminClient, effectiveAnswers);

    const systemPrompt = buildTJAISystemPrompt();
    const userPrompt = buildTJAIUserPrompt(quizAnswers, metrics) + (learningInsight ? `\n\n== LEARNING FROM SIMILAR USERS ==\n${learningInsight}` : "");

    console.log("[TJAI] Generating plan for user:", authResult.user.id, "| tier:", tier);

    // Verify OpenAI key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("[TJAI] OPENAI_API_KEY is not set");
      return NextResponse.json({ error: "AI not configured. Please contact support." }, { status: 503 });
    }

    let rawText: string;
    try {
      rawText = await callOpenAI({
        system: systemPrompt,
        user: userPrompt,
        maxTokens: 16000,
        jsonMode: true // Guarantees valid JSON — no parsing failures
      });
    } catch (aiError) {
      const msg = aiError instanceof Error ? aiError.message : "AI generation failed";
      console.error("[TJAI] AI call failed:", msg);
      return NextResponse.json({ error: `AI generation failed: ${msg}` }, { status: 502 });
    }

    let plan: unknown;
    try {
      plan = safeParseJSON(rawText);
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : "JSON parse error";
      console.error("[TJAI] JSON parse failed:", msg, "\nRaw:", rawText.slice(0, 500));
      return NextResponse.json({ error: "AI returned an invalid response. Please try again." }, { status: 502 });
    }

    // Save to DB
    const { data: savedPlan, error: saveError } = await adminClient
      .from("saved_tjai_plans")
      .upsert({
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
      }, { onConflict: "user_id" })
      .select("id")
      .maybeSingle();

    if (saveError) {
      console.error("[TJAI] Save error:", saveError);
      // Return plan even if save fails — user still gets their result
      return NextResponse.json({ plan, metrics, generatedAt: new Date().toISOString(), planId: null });
    }

    console.log("[TJAI] Plan generated and saved for user:", authResult.user.id);

    // Non-blocking analytics
    void recordPlanGeneration(adminClient, effectiveAnswers, Number(metrics.calorieTarget ?? 0), Number(metrics.protein ?? 0));

    return NextResponse.json({ plan, metrics, generatedAt: new Date().toISOString(), planId: savedPlan?.id ?? null });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[TJAI] Unhandled error:", msg);
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 });
  }
}

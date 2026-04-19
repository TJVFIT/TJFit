import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { recordPlanGeneration, getSimilarUserInsight } from "@/lib/tjai-analytics";
import { buildTjaiUserProfile, normalizeQuizAnswers } from "@/lib/tjai-intake";
import { buildTJAISystemPrompt, buildTJAIUserPrompt } from "@/lib/tjai-prompts";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { buildTjaiMemorySnapshot, saveTjaiStructuredMemory } from "@/lib/tjai-plan-store";
import { calculateTJAIMetrics } from "@/lib/tjai-science";
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
    const effectiveAnswers = normalizeQuizAnswers(
      paceOverride ? { ...answers, s2_pace: paceOverride } : answers
    );
    const profile = buildTjaiUserProfile(effectiveAnswers);

    if (!Number.isFinite(profile.age) || profile.age <= 0 || !Number.isFinite(profile.weightKg) || profile.weightKg <= 0 || !Number.isFinite(profile.heightCm) || profile.heightCm <= 0) {
      return NextResponse.json({ error: "Missing required fields: age, weight, height. Please complete all questions." }, { status: 400 });
    }

    const quizAnswers = effectiveAnswers as QuizAnswers;
    const metrics = calculateTJAIMetrics(quizAnswers);
    const [learningInsight, memory] = await Promise.all([
      getSimilarUserInsight(adminClient, effectiveAnswers),
      buildTjaiMemorySnapshot(adminClient, authResult.user.id)
    ]);

    const systemPrompt = buildTJAISystemPrompt();
    const userPrompt =
      buildTJAIUserPrompt(profile, metrics, memory) +
      (learningInsight ? `\n\n== LEARNING FROM SIMILAR USERS ==\n${learningInsight}` : "");

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

    // Task 8 — count existing plans to assign version_number; insert instead of upsert
    const { count: existingCount } = await adminClient
      .from("saved_tjai_plans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", authResult.user.id);

    const versionNumber = (existingCount ?? 0) + 1;

    // Save to DB — insert (not upsert) to preserve version history
    const { data: savedPlan, error: saveError } = await adminClient
      .from("saved_tjai_plans")
      .insert({
        user_id: authResult.user.id,
        version_number: versionNumber,
        answers_json: effectiveAnswers,
        metrics_json: metrics,
        plan_json: plan,
        goal: profile.goal,
        daily_calories: Number(metrics.calorieTarget ?? 0),
        protein_g: Number(metrics.protein ?? 0),
        carbs_g: Number(metrics.carbs ?? 0),
        fat_g: Number(metrics.fat ?? 0),
        water_ml: Number(metrics.water ?? 0),
        training_days_per_week: profile.trainingDays,
        training_location: profile.trainingLocation,
        updated_at: new Date().toISOString()
      })
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
    void saveTjaiStructuredMemory(adminClient, authResult.user.id, effectiveAnswers);

    return NextResponse.json({ plan, metrics, generatedAt: new Date().toISOString(), planId: savedPlan?.id ?? null });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[TJAI] Unhandled error:", msg);
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 });
  }
}
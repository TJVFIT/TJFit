import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { runPlanGenerationPipeline } from "@/lib/tjai";
import { buildTjaiUserProfile, normalizeQuizAnswers } from "@/lib/tjai-intake";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { calculateTJAIMetrics } from "@/lib/tjai-science";
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
    const access = getTJAIAccess(tier, {
      hasOneTimePlanPurchase: Boolean(purchase?.id),
      coreTrialMessagesRemaining: isTrialActive ? 10 : 0,
      isAdmin
    });
    if (!access.canGeneratePlan) {
      return NextResponse.json({ error: "A one-time TJAI unlock is required before generating a full plan." }, { status: 402 });
    }

    const body = await request.json().catch(() => null);
    const rawAnswers = body?.answers ?? body;
    const paceOverride = typeof body?.paceOverride === "string" ? body.paceOverride : null;
    if (!rawAnswers || typeof rawAnswers !== "object") {
      return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
    }

    const answers = rawAnswers as Record<string, unknown>;
    const effectiveAnswers = normalizeQuizAnswers(paceOverride ? { ...answers, s2_pace: paceOverride } : answers);
    const profile = buildTjaiUserProfile(effectiveAnswers);

    if (!Number.isFinite(profile.age) || profile.age <= 0 || !Number.isFinite(profile.weightKg) || profile.weightKg <= 0 || !Number.isFinite(profile.heightCm) || profile.heightCm <= 0) {
      return NextResponse.json({ error: "Missing required fields: age, weight, height. Please complete all questions." }, { status: 400 });
    }

    const quizAnswers = effectiveAnswers as QuizAnswers;
    const metrics = calculateTJAIMetrics(quizAnswers);

    console.log("[TJAI] Generating plan for user:", authResult.user.id, "| tier:", tier);

    const result = await runPlanGenerationPipeline({
      userId: authResult.user.id,
      adminClient,
      quizAnswers,
      profile,
      metrics
    });

    if (!result.ok) {
      console.error("[TJAI] Pipeline failed:", result.error, result.trace.errors);
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    console.log("[TJAI] Plan generated and saved for user:", authResult.user.id);

    return NextResponse.json(result.body);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[TJAI] Unhandled error:", msg);
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 });
  }
}

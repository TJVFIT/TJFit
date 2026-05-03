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
    // v5 round 2 — credit gate.
    // Order: existing canGeneratePlan flag (admin / one-time purchase
    // legacy path) → Pro/Apex bypass → TJAI credits fallback → 402.
    let creditConsumed = false;
    let creditsRemaining: number | null = null;

    if (!access.canGeneratePlan) {
      if (tier === "pro" || tier === "apex") {
        // Subscription users: unlimited generations as a perk.
        // No credit decrement needed.
      } else {
        const { data: rpcRows, error: rpcErr } = await adminClient.rpc(
          "consume_tjai_credit",
          {
            p_user_id: authResult.user.id,
            p_amount: 1,
            p_reason: "generation",
            p_metadata: null
          }
        );
        if (rpcErr) {
          console.error("[TJAI generate] consume_tjai_credit RPC error", rpcErr);
          return NextResponse.json(
            { error: "credit_consume_failed", details: rpcErr.message },
            { status: 500 }
          );
        }
        const result = (Array.isArray(rpcRows) ? rpcRows[0] : rpcRows) as
          | { balance_after?: number; ok?: boolean; reason?: string }
          | null;

        if (!result?.ok) {
          const { data: packs } = await adminClient
            .from("tjai_credit_packs")
            .select("slug, name_i18n, credits, price_usd, price_per_tier")
            .eq("is_published", true)
            .order("display_order", { ascending: true });
          return NextResponse.json(
            {
              error: "insufficient_credits",
              code: String(result?.reason ?? "insufficient_credits"),
              message: "Need 1 TJAI credit. Buy a pack to continue.",
              packs: packs ?? []
            },
            { status: 402 }
          );
        }

        creditConsumed = true;
        creditsRemaining = Number(result.balance_after ?? 0);
      }
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

    if (process.env.NODE_ENV !== "production") {
      console.log("[TJAI] Generating plan for user:", authResult.user.id, "| tier:", tier);
    }

    const result = await runPlanGenerationPipeline({
      userId: authResult.user.id,
      adminClient,
      quizAnswers,
      profile,
      metrics
    });

    if (!result.ok) {
      console.error("[TJAI] Pipeline failed:", result.error, result.trace.errors);
      // v5 round 2 — refund the credit if pipeline fails after consume.
      if (creditConsumed) {
        const { error: refundErr } = await adminClient.rpc("grant_tjai_credit", {
          p_user_id: authResult.user.id,
          p_amount: 1,
          p_reason: "refund",
          p_metadata: { reason: "pipeline_failed", error: result.error }
        });
        if (refundErr) {
          console.error("[TJAI generate] credit refund failed", refundErr);
        }
      }
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[TJAI] Plan generated and saved for user:", authResult.user.id);
    }

    return NextResponse.json(
      creditsRemaining !== null
        ? { ...(result.body as object), credits_remaining: creditsRemaining }
        : result.body
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[TJAI] Unhandled error:", msg);
    // Note: credit refund on uncaught-throw is intentionally skipped
    // here — `creditConsumed` is scoped inside the try block for type
    // safety (admin client + auth result are inner). The inner
    // `if (!result.ok)` branch already refunds on pipeline failure
    // (the common case). True uncaught throws are rare and warrant a
    // manual review anyway.
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 });
  }
}

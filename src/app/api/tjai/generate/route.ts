import * as Sentry from "@sentry/nextjs";
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
  // Refund-safety state. These live outside the try so the finally block can
  // refund the credit on any non-delivery path (Vercel timeout, uncaught
  // throw, pipeline failure). `delivered` flips true ONLY after we have a
  // successful response object in hand. `refunded` is the idempotency guard
  // so the finally never double-refunds.
  let creditConsumed = false;
  let delivered = false;
  let refunded = false;
  let userIdForRefund: string | null = null;
  let clientForRefund: NonNullable<ReturnType<typeof getSupabaseServerClient>> | null = null;
  let failureReason: string | null = null;

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
        userIdForRefund = authResult.user.id;
        clientForRefund = adminClient;
        creditsRemaining = Number(result.balance_after ?? 0);
      }
    }

    const body = await request.json().catch(() => null);
    const rawAnswers = body?.answers ?? body;
    const paceOverride = typeof body?.paceOverride === "string" ? body.paceOverride : null;
    if (!rawAnswers || typeof rawAnswers !== "object") {
      failureReason = "invalid_payload";
      return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
    }

    const answers = rawAnswers as Record<string, unknown>;
    const effectiveAnswers = normalizeQuizAnswers(paceOverride ? { ...answers, s2_pace: paceOverride } : answers);
    const profile = buildTjaiUserProfile(effectiveAnswers);

    if (!Number.isFinite(profile.age) || profile.age <= 0 || !Number.isFinite(profile.weightKg) || profile.weightKg <= 0 || !Number.isFinite(profile.heightCm) || profile.heightCm <= 0) {
      failureReason = "missing_required_fields";
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
      failureReason = `pipeline_failed:${result.error}`;
      // Refund handled in finally — see refund-safety state at top.
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[TJAI] Plan generated and saved for user:", authResult.user.id);
    }

    const response = NextResponse.json(
      creditsRemaining !== null
        ? { ...(result.body as object), credits_remaining: creditsRemaining }
        : result.body
    );
    // Mark delivered AFTER we have a successful response in hand. Anything
    // that throws between here and the return will skip the refund (the
    // user got their plan; no double-refund on success-then-throw).
    delivered = true;
    return response;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[TJAI] Unhandled error:", msg);
    failureReason = `uncaught:${msg}`;
    // Generic client message — raw error text logged above, not leaked.
    // The credit is returned by the finally block (delivered is still false).
    return NextResponse.json(
      { error: "Generation failed. Your credit was not charged — please try again." },
      { status: 500 }
    );
  } finally {
    // Refund in finally so Vercel timeouts and uncaught throws still return the credit.
    // Caveat: when Vercel hard-kills the function at maxDuration, the runtime
    // may not actually drain async work in finally. This still covers
    // synchronous throws, rejected promises, and most pre-timeout failure
    // modes — strictly better than the old `if (!result.ok)` gate.
    if (creditConsumed && !delivered && !refunded && clientForRefund && userIdForRefund) {
      refunded = true;
      const { error: refundErr } = await clientForRefund.rpc("grant_tjai_credit", {
        p_user_id: userIdForRefund,
        p_amount: 1,
        p_reason: "refund",
        p_metadata: { reason: failureReason ?? "not_delivered" }
      });
      if (refundErr) {
        console.error("[TJAI generate] credit refund failed", refundErr);
        // WP-SEC-10 / WP-INFRA-11 — the worst silent case on this route: the
        // pipeline already failed to deliver a plan AND the automatic credit
        // refund meant to make the buyer whole also failed, so they paid and
        // got nothing with no compensating write. Capture with enough
        // context (user + original failure reason) to hand-refund from the
        // Sentry event alone.
        Sentry.withScope((scope) => {
          scope.setTag("surface", "tjai-generate");
          scope.setTag("gumroad_action", "credit_refund_failed");
          scope.setContext("tjai_refund", {
            user_id: userIdForRefund,
            failure_reason: failureReason,
            refund_error: refundErr.message
          });
          Sentry.captureMessage(
            `[TJAI generate] credit refund failed for user ${userIdForRefund}: ${refundErr.message}`,
            "fatal"
          );
        });
      }
    }
  }
}

import { NextRequest } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { loadIntakeV2 } from "@/lib/tjai/intake-v2-store";
import { checkRateLimit } from "@/lib/tjai/rate-limit";
import { persistV2Plan, runV2PlanStream } from "@/lib/tjai/v2-plan-orchestrator";
import { getTJAIAccess } from "@/lib/tjai-access";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Plan generation calls Opus + Haiku — cap aggressively. 4 generations
// per hour per user is plenty for normal use.
const PLAN_RATE_WINDOW_SEC = 3600;
const PLAN_RATE_MAX = 4;

export async function POST(_request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const admin = getSupabaseServerClient();
  if (!admin) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Tier gate — full plan is a paid feature.
  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  const [{ data: sub }, { data: profile }, { data: purchase }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    isAdminByEmail
      ? Promise.resolve({ data: { role: "admin" as const } })
      : admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle(),
    admin
      .from("tjai_plan_purchases")
      .select("id")
      .eq("user_id", auth.user.id)
      .order("purchased_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const isAdmin = isAdminByEmail || profile?.role === "admin";
  const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
  const access = getTJAIAccess(tier, {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    isAdmin
  });

  if (!access.canGeneratePlan) {
    return new Response(
      JSON.stringify({ error: "Upgrade required to generate a full plan.", code: "UPGRADE_REQUIRED" }),
      { status: 402, headers: { "Content-Type": "application/json" } }
    );
  }

  // Rate limit
  if (!isAdmin) {
    const rl = await checkRateLimit({
      supabase: admin,
      userId: auth.user.id,
      route: "tjai/v2-workout-generate",
      windowSeconds: PLAN_RATE_WINDOW_SEC,
      max: PLAN_RATE_MAX
    });
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Plan limit reached for this hour.", code: "RATE_LIMITED" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rl.resetIn)
          }
        }
      );
    }
  }

  // Load v2 intake — must have answers to generate
  const intake = await loadIntakeV2(auth.supabase, auth.user.id);
  if (!intake.answers || Object.keys(intake.answers).length < 5) {
    return new Response(
      JSON.stringify({ error: "Complete the intake before generating a plan.", code: "INTAKE_INCOMPLETE" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const planId = crypto.randomUUID();
  const locale = intake.answers["locale"];
  const localeStr = typeof locale === "string" ? locale : "en";

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let finalPlan: import("@/lib/tjai/v2-plan-schema").V2Plan | null = null;
        for await (const event of runV2PlanStream({
          answers: intake.answers,
          userId: auth.user.id,
          locale: localeStr,
          planId
        })) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          if (event.type === "done") finalPlan = event.plan;
        }

        // Persist after stream ends
        if (finalPlan) {
          const savedId = await persistV2Plan(auth.supabase, auth.user.id, finalPlan);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "saved", planId: savedId })}\n\n`)
          );
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message: msg })}\n\n`)
        );
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}

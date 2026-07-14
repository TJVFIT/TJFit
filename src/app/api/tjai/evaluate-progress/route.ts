import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { llmCall } from "@/lib/tjai/llm";
import { getLatestTjaiPlan, saveAdaptiveCheckpoint } from "@/lib/tjai-plan-store";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type EvaluationResult = {
  shouldAdapt: boolean;
  urgency: "low" | "medium" | "high";
  headline: string;
  findings: string[];
  recommendations: Array<{
    type: "calories" | "protein" | "training" | "recovery" | "mindset";
    action: string;
    reason: string;
  }>;
  triggerRegen: boolean;
  regenReason: string | null;
};

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const uid = auth.user.id;

  // Tier gate — previously this OpenAI-backed endpoint had no access check.
  // Use canUseProgress (pro/apex/purchaser) so free users can't spam-evaluate.
  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  const [{ data: sub }, { data: purchase }, { data: profile }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", uid).maybeSingle(),
    admin.from("tjai_plan_purchases").select("id").eq("user_id", uid).order("purchased_at", { ascending: false }).limit(1).maybeSingle(),
    isAdminByEmail
      ? Promise.resolve({ data: { role: "admin" } })
      : admin.from("profiles").select("role").eq("id", uid).maybeSingle()
  ]);
  const access = getTJAIAccess((sub?.tier ?? "core") as "core" | "pro" | "apex", {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    isAdmin: isAdminByEmail || profile?.role === "admin"
  });
  if (!access.canUseProgress) {
    return NextResponse.json({ error: "Upgrade required.", code: "access_denied" }, { status: 402 });
  }

  // Rate limit — evaluations are LLM-backed (~600 tokens of gpt-4o-mini); 5/hr
  // is generous for legitimate UI use (the user typically pulls this once a
  // week after their check-in) and bounds spam.
  const limiter = await rateLimit({
    key: `tjai-evaluate:${uid}`,
    limit: 5,
    windowMs: 60 * 60 * 1000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const [plan, { data: entries }, { data: workouts }, { data: progress }] =
    await Promise.all([
      getLatestTjaiPlan(admin, uid),
      admin
        .from("progress_entries")
        .select("entry_date,weight_kg,body_fat_percent")
        .eq("user_id", uid)
        .not("weight_kg", "is", null)
        .order("entry_date", { ascending: false })
        .limit(12),
      admin
        .from("workout_logs")
        .select("workout_date,exercise")
        .eq("user_id", uid)
        .order("workout_date", { ascending: false })
        .limit(60),
      admin
        .from("program_progress")
        .select("week_number,is_complete")
        .eq("user_id", uid)
    ]);

  if (!plan) {
    return NextResponse.json({
      hasEnoughData: false,
      message: "No plan found. Generate your TJAI plan first."
    });
  }

  if (!entries || entries.length < 2) {
    return NextResponse.json({
      hasEnoughData: false,
      message: "Log your weight at least twice to unlock adaptive evaluation."
    });
  }

  // Compute actual vs projected
  const metrics = (plan.metrics_json ?? {}) as Record<string, unknown>;
  const projectedWeeklyChange = Number(metrics.weeklyWeightChange ?? 0);
  const planCreatedAt = new Date(plan.created_at as string);
  const weeksSincePlan = Math.max(
    1,
    (Date.now() - planCreatedAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const latestWeight = Number(entries[0].weight_kg);
  const oldestWeight = Number(entries[entries.length - 1].weight_kg);
  const actualWeeklyChange = (latestWeight - oldestWeight) / Math.max(1, entries.length - 1);

  const recentWorkouts = workouts ?? [];
  const lastFourWeeksWorkouts = recentWorkouts.filter((w) => {
    if (!w.workout_date) return false;
    const d = new Date(w.workout_date as string);
    return Date.now() - d.getTime() < 28 * 24 * 60 * 60 * 1000;
  });
  const workoutsPerWeek = lastFourWeeksWorkouts.length / 4;

  const completedWeeks = Math.max(
    0,
    ...((progress ?? []).map((r) => Number(r.week_number ?? 0)))
  );

  const evaluationPrompt = `You are TJAI, an elite AI fitness coach evaluating a user's progress against their plan.

PLAN DATA:
- Goal: ${plan.goal ?? "not set"}
- Plan calories: ${plan.daily_calories ?? "not set"} kcal/day
- Plan protein: ${plan.protein_g ?? "not set"}g/day
- Projected weekly change: ${projectedWeeklyChange > 0 ? "+" : ""}${projectedWeeklyChange}kg/week
- Weeks since plan generated: ${weeksSincePlan.toFixed(1)}

ACTUAL RESULTS:
- Weight change: ${oldestWeight}kg → ${latestWeight}kg (${actualWeeklyChange > 0 ? "+" : ""}${actualWeeklyChange.toFixed(2)}kg/week actual vs ${projectedWeeklyChange}kg/week projected)
- Workouts per week (last 4 weeks): ${workoutsPerWeek.toFixed(1)}
- Completed weeks: ${completedWeeks}

Respond ONLY with valid JSON matching this exact schema:
{
  "shouldAdapt": boolean,
  "urgency": "low" | "medium" | "high",
  "headline": "One sentence summary (max 12 words)",
  "findings": ["finding 1", "finding 2", "finding 3"],
  "recommendations": [
    { "type": "calories" | "protein" | "training" | "recovery" | "mindset", "action": "Specific actionable recommendation", "reason": "Why" }
  ],
  "triggerRegen": boolean,
  "regenReason": "Why regeneration is recommended, or null if not needed"
}

Rules:
- shouldAdapt: true if actual change deviates >30% from projected, or workoutsPerWeek < 2.5
- triggerRegen: true only if shouldAdapt AND weeksSincePlan > 3
- Be specific. Reference the actual numbers.`;

  let evaluation: EvaluationResult | null = null;
  try {
    const raw = await llmCall({
      task: "progress_evaluate",
      system: "You are TJAI. Return strict JSON only. No markdown.",
      user: evaluationPrompt,
      maxTokens: 600,
      jsonMode: true,
      // gpt-4o-mini handles bounded structured-JSON extraction fine and is
      // ~95% cheaper than gpt-4o for this size of input. Same pattern as the
      // preference-extraction call in tjai/chat.
      openaiModel: "gpt-4o-mini",
      route: "tjai/evaluate-progress",
      userId: uid
    });
    evaluation = JSON.parse(raw) as EvaluationResult;
  } catch (err) {
    console.error("[TJAI evaluate-progress] AI error:", err);
    return NextResponse.json({
      hasEnoughData: true,
      evaluation: null,
      error: "AI evaluation temporarily unavailable."
    });
  }

  if (evaluation) {
    void saveAdaptiveCheckpoint(admin, uid, {
      shouldAdapt: evaluation.shouldAdapt,
      urgency: evaluation.urgency,
      triggerRegen: evaluation.triggerRegen,
      regenReason: evaluation.regenReason,
      snapshot: {
        projectedWeeklyChange,
        actualWeeklyChange,
        workoutsPerWeek,
        completedWeeks
      }
    });
  }

  return NextResponse.json({
    hasEnoughData: true,
    weeksSincePlan: parseFloat(weeksSincePlan.toFixed(1)),
    actualWeeklyChange: parseFloat(actualWeeklyChange.toFixed(2)),
    projectedWeeklyChange,
    workoutsPerWeek: parseFloat(workoutsPerWeek.toFixed(1)),
    evaluation
  });
}

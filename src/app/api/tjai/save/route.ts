import { NextResponse } from "next/server";

import { normalizeQuizAnswers } from "@/lib/tjai-intake";
import { getLatestTjaiPlan, saveTjaiStructuredMemory } from "@/lib/tjai-plan-store";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const { plan, answers, metrics } = body ?? {};
    if (!plan || !answers) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const normalizedAnswers = normalizeQuizAnswers(answers as Record<string, unknown>);
    const latest = await getLatestTjaiPlan(auth.supabase, auth.user.id);
    const payload = {
      user_id: auth.user.id,
      plan_json: plan,
      answers_json: normalizedAnswers,
      metrics_json: metrics ?? null,
      updated_at: new Date().toISOString()
    };
    const { error } = latest?.id
      ? await auth.supabase.from("saved_tjai_plans").update(payload).eq("id", latest.id)
      : await auth.supabase.from("saved_tjai_plans").insert(payload);

    if (error) {
      console.error("[TJAI Save POST] DB error:", error.message, error.code);
      // Still return ok — client shouldn't crash because save failed
      return NextResponse.json({ ok: true, warning: "Plan generated but not saved" });
    }
    void saveTjaiStructuredMemory(auth.supabase, auth.user.id, normalizedAnswers, "save");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TJAI Save POST] Crash:", err);
    return NextResponse.json({ ok: true, warning: "Save error" });
  }
}

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      // Not logged in — return null plan, never 500
      return NextResponse.json({ plan: null, plans: [] });
    }

    const data = await getLatestTjaiPlan(auth.supabase, auth.user.id);

    return NextResponse.json({ plan: data ?? null, plans: data ? [data] : [] });
  } catch (err) {
    console.error("[TJAI Save GET] Crash:", err);
    return NextResponse.json({ plan: null, plans: [] });
  }
}


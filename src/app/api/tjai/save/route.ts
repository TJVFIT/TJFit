import { NextResponse } from "next/server";

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

    const { error } = await auth.supabase.from("saved_tjai_plans").upsert(
      {
        user_id: auth.user.id,
        plan_json: plan,
        answers_json: answers,
        metrics_json: metrics ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("[TJAI Save POST] DB error:", error.message, error.code);
      // Still return ok — client shouldn't crash because save failed
      return NextResponse.json({ ok: true, warning: "Plan generated but not saved" });
    }
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

    const { data, error } = await auth.supabase
      .from("saved_tjai_plans")
      .select("id, plan_json, answers_json, metrics_json, created_at, updated_at")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Table may not exist yet or permission error — never crash
      console.error("[TJAI Save GET] DB error:", error.message, error.code);
      return NextResponse.json({ plan: null, plans: [] });
    }

    return NextResponse.json({ plan: data ?? null, plans: data ? [data] : [] });
  } catch (err) {
    console.error("[TJAI Save GET] Crash:", err);
    return NextResponse.json({ plan: null, plans: [] });
  }
}


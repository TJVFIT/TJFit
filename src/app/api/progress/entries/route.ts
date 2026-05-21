import { NextRequest, NextResponse } from "next/server";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
import { getLatestTjaiPlan } from "@/lib/tjai-plan-store";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("progress_entries")
    .select("id,user_id,entry_date,weight_kg,body_fat_percent,waist_cm,chest_cm,hips_cm,notes,created_at")
    .eq("user_id", auth.user.id)
    .order("entry_date", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[progress/entries] read failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to load entries" }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = await rateLimit({
    key: `progress-entry:${auth.user.id}`,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;

  // Defensive bounds — previously every numeric field accepted any value
  // (including Infinity, negative) and notes was unbounded.
  const boundedNumber = (v: unknown, max: number): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
  };
  const dateStr =
    typeof body.entry_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.entry_date)
      ? body.entry_date
      : new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: auth.user.id,
    entry_date: dateStr,
    weight_kg: boundedNumber(body.weight_kg, 700),
    body_fat_percent: boundedNumber(body.body_fat_percent, 100),
    waist_cm: boundedNumber(body.waist_cm, 300),
    chest_cm: boundedNumber(body.chest_cm, 300),
    hips_cm: boundedNumber(body.hips_cm, 300),
    notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null
  };

  const { data, error } = await auth.supabase
    .from("progress_entries")
    .insert(payload)
    .select("id,user_id,entry_date,weight_kg,body_fat_percent,waist_cm,chest_cm,hips_cm,notes,created_at")
    .single();

  if (error) {
    console.error("[progress/entries] insert failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 400 });
  }

  // Fire-and-forget: populate outcome_weight_change in tjai_plan_analytics
  void (async () => {
    try {
      const admin = getSupabaseServerClient();
      if (!admin) return;
      const plan = await getLatestTjaiPlan(admin, auth.user.id);
      if (!plan?.created_at) return;
      const { data: entries } = await admin
        .from("progress_entries")
        .select("entry_date,weight_kg")
        .eq("user_id", auth.user.id)
        .not("weight_kg", "is", null)
        .gte("entry_date", plan.created_at.slice(0, 10))
        .order("entry_date", { ascending: true });
      if (!entries || entries.length < 2) return;
      const firstWeight = Number(entries[0].weight_kg);
      const lastWeight = Number(entries[entries.length - 1].weight_kg);
      const firstDate = new Date(entries[0].entry_date as string);
      const lastDate = new Date(entries[entries.length - 1].entry_date as string);
      const weeksDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weeklyChange = (lastWeight - firstWeight) / weeksDiff;
      const answers = plan.answers_json as Record<string, unknown> | null;
      const goal = String(answers?.s2_goal ?? "");
      const sex = String(answers?.s1_gender ?? "");
      if (!goal || !sex) return;
      await admin
        .from("tjai_plan_analytics")
        .update({ outcome_weight_change: parseFloat(weeklyChange.toFixed(3)) })
        .eq("goal", goal)
        .eq("sex", sex)
        .is("outcome_weight_change", null);
    } catch (outcomeErr) {
      console.error("[TJAI outcome tracking] (non-fatal):", outcomeErr);
    }
  })();

  return NextResponse.json({ entry: data }, { status: 201 });
}

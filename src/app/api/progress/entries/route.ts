import { NextRequest, NextResponse } from "next/server";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = rateLimit({
    key: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.ip ?? auth.user.id,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const payload = {
    user_id: auth.user.id,
    entry_date: body.entry_date ?? new Date().toISOString().slice(0, 10),
    weight_kg: body.weight_kg ?? null,
    body_fat_percent: body.body_fat_percent ?? null,
    waist_cm: body.waist_cm ?? null,
    chest_cm: body.chest_cm ?? null,
    hips_cm: body.hips_cm ?? null,
    notes: typeof body.notes === "string" ? body.notes.trim() : null
  };

  const { data, error } = await auth.supabase
    .from("progress_entries")
    .insert(payload)
    .select("id,user_id,entry_date,weight_kg,body_fat_percent,waist_cm,chest_cm,hips_cm,notes,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Task 4 — fire-and-forget: populate outcome_weight_change in tjai_plan_analytics
  void (async () => {
    try {
      const admin = getSupabaseServerClient();
      if (!admin) return;

      const { data: plan } = await admin
        .from("saved_tjai_plans")
        .select("daily_calories,protein_g,created_at,answers_json")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan) return;

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

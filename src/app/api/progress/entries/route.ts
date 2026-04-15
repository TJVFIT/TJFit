import { NextRequest, NextResponse } from "next/server";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
import { rateLimit } from "@/lib/rate-limit";

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

  return NextResponse.json({ entry: data }, { status: 201 });
}

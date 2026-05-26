import { NextResponse } from "next/server";

import { loadLongMemoryFacts } from "@/lib/tjai";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

const FACT_MAX_LEN = 280;

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const facts = await loadLongMemoryFacts(auth.supabase, auth.user.id, 200);
  return NextResponse.json({ facts });
}

export async function DELETE(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const all = url.searchParams.get("all");

  if (all === "1") {
    await auth.supabase.from("tjai_long_memory").delete().eq("user_id", auth.user.id);
    return NextResponse.json({ ok: true, cleared: "all" });
  }
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await auth.supabase.from("tjai_long_memory").delete().eq("user_id", auth.user.id).eq("id", id);
  return NextResponse.json({ ok: true });
}

// PATCH /api/tjai/memory — edit a single fact's text.
// Body: { id: string, fact: string }
// Owner-only via the auth.user.id filter on the UPDATE.
export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { id?: unknown; fact?: unknown }
    | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const factRaw = typeof body?.fact === "string" ? body.fact.trim() : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!factRaw) return NextResponse.json({ error: "fact required" }, { status: 400 });
  const fact = factRaw.slice(0, FACT_MAX_LEN);

  const { data, error } = await auth.supabase
    .from("tjai_long_memory")
    .update({ fact })
    .eq("user_id", auth.user.id)
    .eq("id", id)
    .select("id,user_id,fact,category,source,created_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Fact not found" }, { status: 404 });
  return NextResponse.json({ ok: true, fact: data });
}

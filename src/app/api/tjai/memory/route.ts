import { NextResponse } from "next/server";

import { loadLongMemoryFacts } from "@/lib/tjai";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

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

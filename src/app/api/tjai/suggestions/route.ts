import { NextResponse } from "next/server";

import {
  decideSuggestion,
  gatherSignals,
  generateSuggestion,
  loadPendingSuggestions,
  persistSuggestion,
  shouldSuggest
} from "@/lib/tjai/suggestions";
import { getLatestTjaiPlan } from "@/lib/tjai-plan-store";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const suggestions = await loadPendingSuggestions(auth.supabase, auth.user.id);
  return NextResponse.json({ suggestions });
}

export async function POST() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const signals = await gatherSignals(auth.supabase, auth.user.id);
  if (!shouldSuggest(signals)) {
    return NextResponse.json({ suggestion: null, reason: "no signal" });
  }

  const generated = await generateSuggestion(signals, auth.user.id);
  if (!generated) {
    return NextResponse.json({ suggestion: null, reason: "generation failed" });
  }

  const plan = await getLatestTjaiPlan(auth.supabase, auth.user.id);
  const id = await persistSuggestion(
    auth.supabase,
    auth.user.id,
    generated,
    signals,
    (plan as { id?: string } | null)?.id ?? null
  );

  return NextResponse.json({ suggestion: { id, ...generated, signals } });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { id?: unknown; decision?: unknown }
    | null;

  const id = typeof body?.id === "string" ? body.id : "";
  const decision = body?.decision === "accepted" || body?.decision === "rejected" ? body.decision : null;
  if (!id || !decision) return NextResponse.json({ error: "id and decision required" }, { status: 400 });

  const ok = await decideSuggestion(auth.supabase, auth.user.id, id, decision);
  if (!ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

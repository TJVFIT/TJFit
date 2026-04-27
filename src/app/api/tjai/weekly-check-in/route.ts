import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import {
  gatherSignals,
  generateSuggestion,
  persistSuggestion,
  shouldSuggest
} from "@/lib/tjai/suggestions";
import { getLatestTjaiPlan } from "@/lib/tjai-plan-store";

export const dynamic = "force-dynamic";

function weekStartUtcMonday(d = new Date()): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setUTCDate(x.getUTCDate() + diff);
  return x.toISOString().slice(0, 10);
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const weekStart = weekStartUtcMonday();
  const { data, error } = await auth.supabase
    .from("tjai_weekly_check_ins")
    .select("week_start,energy,adherence,win,blockers,created_at,updated_at")
    .eq("user_id", auth.user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (error) {
    if (error.message.toLowerCase().includes("tjai_weekly_check_ins") && error.message.toLowerCase().includes("relation")) {
      return NextResponse.json(
        { error: "Weekly check-in storage is not migrated yet.", week_start: weekStart, check_in: null },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ week_start: weekStart, check_in: data ?? null });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const energy = Number(body?.energy);
  const adherence = Number(body?.adherence);
  const win = typeof body?.win === "string" ? body.win.trim().slice(0, 2000) : "";
  const blockers = typeof body?.blockers === "string" ? body.blockers.trim().slice(0, 2000) : "";

  if (!Number.isFinite(energy) || !Number.isInteger(energy) || energy < 1 || energy > 5) {
    return NextResponse.json({ error: "energy must be an integer from 1 to 5" }, { status: 400 });
  }
  if (!Number.isFinite(adherence) || !Number.isInteger(adherence) || adherence < 1 || adherence > 5) {
    return NextResponse.json({ error: "adherence must be an integer from 1 to 5" }, { status: 400 });
  }

  const weekStart = weekStartUtcMonday();
  const now = new Date().toISOString();

  const { data, error } = await auth.supabase
    .from("tjai_weekly_check_ins")
    .upsert(
      {
        user_id: auth.user.id,
        week_start: weekStart,
        energy,
        adherence,
        win: win.length > 0 ? win : null,
        blockers: blockers.length > 0 ? blockers : null,
        updated_at: now
      },
      { onConflict: "user_id,week_start" }
    )
    .select("week_start,energy,adherence,win,blockers,created_at,updated_at")
    .maybeSingle();

  if (error) {
    if (error.message.toLowerCase().includes("tjai_weekly_check_ins") && error.message.toLowerCase().includes("relation")) {
      return NextResponse.json({ error: "Weekly check-in storage is not migrated yet." }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let newBadges: import("@/lib/tjai/badges").BadgeMeta[] = [];
  let streak: import("@/lib/tjai/streaks").Streak | null = null;
  try {
    const { bumpStreak } = await import("@/lib/tjai/streaks");
    const { evaluateBadges } = await import("@/lib/tjai/badges");
    streak = await bumpStreak(auth.supabase, auth.user.id);
    const { count } = await auth.supabase
      .from("tjai_weekly_check_ins")
      .select("week_start", { count: "exact", head: true })
      .eq("user_id", auth.user.id);
    newBadges = await evaluateBadges(auth.supabase, auth.user.id, {
      checkInCount: count ?? null,
      currentStreak: streak.current_streak
    });
  } catch {
    /* swallow */
  }

  void (async () => {
    try {
      const signals = await gatherSignals(auth.supabase, auth.user.id);
      if (!shouldSuggest(signals)) return;
      const generated = await generateSuggestion(signals, auth.user.id);
      if (!generated) return;
      const plan = await getLatestTjaiPlan(auth.supabase, auth.user.id);
      await persistSuggestion(
        auth.supabase,
        auth.user.id,
        generated,
        signals,
        (plan as { id?: string } | null)?.id ?? null
      );
    } catch {
      /* swallow */
    }
  })();

  return NextResponse.json({ ok: true, check_in: data, streak, newBadges });
}

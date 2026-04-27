import type { SupabaseClient } from "@supabase/supabase-js";

import { callOpenAI, safeParseJSON } from "@/lib/tjai-openai";

export type SuggestionKind =
  | "deload"
  | "progression"
  | "swap"
  | "volume_change"
  | "frequency_change"
  | "recovery_week"
  | "general";

export type SuggestionSignals = {
  // Most recent weekly check-in.
  energy?: number | null;
  adherence?: number | null;
  win?: string | null;
  blockers?: string | null;
  // RPE / soreness rolling averages (last 7 sessions).
  avgRpe?: number | null;
  avgSoreness?: number | null;
  // Days since last logged workout.
  daysSinceLastWorkout?: number | null;
  // Sessions logged in last 14 days.
  recentSessionCount?: number;
};

export type GeneratedSuggestion = {
  kind: SuggestionKind;
  title: string;
  summary: string;
  rationale: string;
  patch: Record<string, unknown>;
};

export type StoredSuggestion = GeneratedSuggestion & {
  id: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  created_at: string;
  signals: SuggestionSignals;
};

type WorkoutRow = { workout_date: string; rpe: number | null; soreness: number | null };
type CheckInRow = {
  energy: number | null;
  adherence: number | null;
  win: string | null;
  blockers: string | null;
};

export async function gatherSignals(
  supabase: SupabaseClient,
  userId: string
): Promise<SuggestionSignals> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [{ data: logs }, { data: checkIn }] = await Promise.all([
    supabase
      .from("workout_logs")
      .select("workout_date,rpe,soreness")
      .eq("user_id", userId)
      .gte("workout_date", fourteenDaysAgo)
      .order("workout_date", { ascending: false })
      .limit(20),
    supabase
      .from("tjai_weekly_check_ins")
      .select("energy,adherence,win,blockers")
      .eq("user_id", userId)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const rows = ((logs ?? []) as WorkoutRow[]).slice(0, 7);
  const rpes = rows.map((r) => r.rpe).filter((v): v is number => typeof v === "number" && v > 0);
  const sors = rows.map((r) => r.soreness).filter((v): v is number => typeof v === "number" && v >= 0);

  const lastDate = rows[0]?.workout_date ?? null;
  const daysSinceLastWorkout = lastDate
    ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86_400_000)
    : null;

  const ci = (checkIn ?? null) as CheckInRow | null;

  return {
    energy: ci?.energy ?? null,
    adherence: ci?.adherence ?? null,
    win: ci?.win ?? null,
    blockers: ci?.blockers ?? null,
    avgRpe: rpes.length ? Number((rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1)) : null,
    avgSoreness: sors.length ? Number((sors.reduce((a, b) => a + b, 0) / sors.length).toFixed(1)) : null,
    daysSinceLastWorkout,
    recentSessionCount: (logs ?? []).length
  };
}

// Returns true when there's enough signal to be worth a suggestion.
export function shouldSuggest(signals: SuggestionSignals): boolean {
  const overreached =
    (signals.avgRpe ?? 0) >= 9 || (signals.avgSoreness ?? 0) >= 4;
  const lowEnergy = (signals.energy ?? 5) <= 2;
  const lowAdherence = (signals.adherence ?? 5) <= 2;
  const stale = (signals.daysSinceLastWorkout ?? 0) >= 5;
  const cruising =
    (signals.avgRpe ?? 0) > 0 &&
    (signals.avgRpe ?? 0) <= 6.5 &&
    (signals.recentSessionCount ?? 0) >= 6 &&
    (signals.adherence ?? 0) >= 4;

  return overreached || lowEnergy || lowAdherence || stale || cruising;
}

const SUGGESTION_SYSTEM = `You are TJAI proposing a single small adjustment to the user's training plan.
Output strict JSON only:
{"kind":"deload|progression|swap|volume_change|frequency_change|recovery_week|general","title":"...","summary":"...","rationale":"...","patch":{...}}

Rules:
- ONE suggestion. The smallest useful change.
- title: under 60 chars, action-oriented ("Drop volume 20% this week").
- summary: 2-3 sentences explaining what to do.
- rationale: 1-2 sentences citing the specific signals (RPE, soreness, adherence, days off).
- patch: structured change the system can apply later (e.g., {"scope":"all","weight_multiplier":0.9,"sets_delta":-1} or {"scope":"specific_lift","lift":"bench","add_kg":2.5}).
- Never recommend doses, drugs, or extreme cuts. If signals look healthy, suggest progression. If overreached, suggest deload. If absent, suggest a recovery week + low-friction restart.
- Be human, short, no headers.`;

export async function generateSuggestion(
  signals: SuggestionSignals,
  userId: string
): Promise<GeneratedSuggestion | null> {
  const userPrompt = `Signals (last 7 sessions / latest check-in):
- avgRpe: ${signals.avgRpe ?? "n/a"}
- avgSoreness: ${signals.avgSoreness ?? "n/a"} / 5
- daysSinceLastWorkout: ${signals.daysSinceLastWorkout ?? "n/a"}
- sessions in last 14d: ${signals.recentSessionCount ?? 0}
- energy: ${signals.energy ?? "n/a"} / 5
- adherence: ${signals.adherence ?? "n/a"} / 5
- win: ${signals.win ?? "n/a"}
- blockers: ${signals.blockers ?? "n/a"}

Propose ONE adjustment.`;

  try {
    const text = await callOpenAI({
      system: SUGGESTION_SYSTEM,
      user: userPrompt,
      maxTokens: 600,
      jsonMode: true,
      task: "plan",
      route: "tjai/suggestions-generate",
      userId
    });
    const parsed = safeParseJSON<Partial<GeneratedSuggestion>>(text);
    if (
      !parsed ||
      typeof parsed.title !== "string" ||
      typeof parsed.summary !== "string" ||
      typeof parsed.rationale !== "string"
    ) {
      return null;
    }
    const validKinds: SuggestionKind[] = [
      "deload",
      "progression",
      "swap",
      "volume_change",
      "frequency_change",
      "recovery_week",
      "general"
    ];
    const kind = validKinds.includes(parsed.kind as SuggestionKind)
      ? (parsed.kind as SuggestionKind)
      : "general";
    return {
      kind,
      title: parsed.title.trim().slice(0, 100),
      summary: parsed.summary.trim().slice(0, 600),
      rationale: parsed.rationale.trim().slice(0, 400),
      patch: typeof parsed.patch === "object" && parsed.patch !== null ? (parsed.patch as Record<string, unknown>) : {}
    };
  } catch {
    return null;
  }
}

export async function persistSuggestion(
  supabase: SupabaseClient,
  userId: string,
  s: GeneratedSuggestion,
  signals: SuggestionSignals,
  planId?: string | null
): Promise<string | null> {
  const { data, error } = await supabase
    .from("tjai_plan_suggestions")
    .insert({
      user_id: userId,
      plan_id: planId ?? null,
      kind: s.kind,
      title: s.title,
      summary: s.summary,
      rationale: s.rationale,
      patch_json: s.patch,
      signals_json: signals,
      status: "pending"
    })
    .select("id")
    .single();
  if (error) return null;
  return (data as { id: string } | null)?.id ?? null;
}

export async function loadPendingSuggestions(
  supabase: SupabaseClient,
  userId: string
): Promise<StoredSuggestion[]> {
  const { data } = await supabase
    .from("tjai_plan_suggestions")
    .select("id,kind,title,summary,rationale,patch_json,signals_json,status,created_at")
    .eq("user_id", userId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(5);

  return ((data ?? []) as Array<{
    id: string;
    kind: SuggestionKind;
    title: string;
    summary: string;
    rationale: string;
    patch_json: Record<string, unknown>;
    signals_json: SuggestionSignals;
    status: "pending";
    created_at: string;
  }>).map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    rationale: row.rationale,
    patch: row.patch_json,
    signals: row.signals_json,
    status: row.status,
    created_at: row.created_at
  }));
}

export async function decideSuggestion(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  decision: "accepted" | "rejected"
): Promise<boolean> {
  const { error } = await supabase
    .from("tjai_plan_suggestions")
    .update({ status: decision, decided_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", id);
  return !error;
}

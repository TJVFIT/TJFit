import type { SupabaseClient } from "@supabase/supabase-js";

import { isTjaiPersona, type TjaiPersona } from "@/lib/tjai/persona";
import type { QuizAnswers } from "@/lib/tjai-types";

export type IntakeV2Stage = "persona" | "personal" | "local" | "health" | "complete";

export type IntakeV2Row = {
  user_id: string;
  stage: IntakeV2Stage;
  answers: QuizAnswers;
  persona: TjaiPersona | null;
  baseline_weight_kg: number | null;
  baseline_set_at: string | null;
  updated_at: string;
};

const DEFAULT_ROW = (userId: string): IntakeV2Row => ({
  user_id: userId,
  stage: "persona",
  answers: {},
  persona: null,
  baseline_weight_kg: null,
  baseline_set_at: null,
  updated_at: new Date().toISOString()
});

const VALID_STAGES: IntakeV2Stage[] = ["persona", "personal", "local", "health", "complete"];

export async function loadIntakeV2(
  supabase: SupabaseClient,
  userId: string
): Promise<IntakeV2Row> {
  const { data } = await supabase
    .from("tjai_intake_v2_answers")
    .select("user_id,stage,answers,persona,baseline_weight_kg,baseline_set_at,updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return DEFAULT_ROW(userId);
  return {
    user_id: userId,
    stage: VALID_STAGES.includes(data.stage as IntakeV2Stage) ? (data.stage as IntakeV2Stage) : "persona",
    answers: (data.answers ?? {}) as QuizAnswers,
    persona: isTjaiPersona(data.persona) ? data.persona : null,
    baseline_weight_kg: typeof data.baseline_weight_kg === "number" ? data.baseline_weight_kg : null,
    baseline_set_at: data.baseline_set_at ?? null,
    updated_at: data.updated_at ?? new Date().toISOString()
  };
}

export async function saveIntakeV2(
  supabase: SupabaseClient,
  userId: string,
  patch: {
    stage?: IntakeV2Stage;
    answers?: QuizAnswers;
    persona?: TjaiPersona | null;
    baselineWeightKg?: number | null;
  }
): Promise<IntakeV2Row> {
  const current = await loadIntakeV2(supabase, userId);
  const merged: IntakeV2Row = {
    ...current,
    stage: patch.stage && VALID_STAGES.includes(patch.stage) ? patch.stage : current.stage,
    answers: patch.answers ? { ...current.answers, ...patch.answers } : current.answers,
    persona:
      patch.persona === undefined
        ? current.persona
        : isTjaiPersona(patch.persona)
          ? patch.persona
          : null,
    baseline_weight_kg:
      patch.baselineWeightKg === undefined
        ? current.baseline_weight_kg
        : patch.baselineWeightKg,
    baseline_set_at:
      patch.baselineWeightKg !== undefined && patch.baselineWeightKg !== current.baseline_weight_kg
        ? new Date().toISOString()
        : current.baseline_set_at,
    updated_at: new Date().toISOString()
  };

  await supabase.from("tjai_intake_v2_answers").upsert(
    {
      user_id: userId,
      stage: merged.stage,
      answers: merged.answers,
      persona: merged.persona,
      baseline_weight_kg: merged.baseline_weight_kg,
      baseline_set_at: merged.baseline_set_at,
      updated_at: merged.updated_at
    },
    { onConflict: "user_id" }
  );
  return merged;
}

/**
 * Returns true if the user's current weight is > 3 kg different from
 * their last-set baseline. Used to suggest a tune-up.
 */
export function shouldSuggestTuneUp(row: IntakeV2Row, currentWeightKg: number | null): boolean {
  if (!row.baseline_weight_kg || !currentWeightKg) return false;
  return Math.abs(currentWeightKg - row.baseline_weight_kg) > 3;
}

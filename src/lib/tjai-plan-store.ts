import type { SupabaseClient } from "@supabase/supabase-js";

import { buildTjaiUserProfile } from "@/lib/tjai-intake";
import type { TjaiMemorySnapshot } from "@/lib/tjai-types";

type LatestPlanRow = {
  id: string;
  goal: string | null;
  daily_calories: number | null;
  protein_g: number | null;
  training_days_per_week: number | null;
  training_location: string | null;
  plan_json: Record<string, unknown> | null;
  answers_json: Record<string, unknown> | null;
  metrics_json: Record<string, unknown> | null;
  version_number: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type PreferenceRow = {
  preference_key: string;
  preference_value: string;
};

type WorkoutRow = {
  workout_date?: string | null;
  logged_at?: string | null;
  exercise?: string | null;
  exercise_name?: string | null;
  sets?: number | null;
  reps?: number | null;
  weight_kg?: number | null;
};

type ProgressRow = {
  entry_date?: string | null;
  weight_kg?: number | null;
  body_fat_percent?: number | null;
  waist_cm?: number | null;
};

type AdaptiveCheckpointRow = {
  should_adapt: boolean | null;
  urgency: "low" | "medium" | "high" | null;
  trigger_regen: boolean | null;
  regen_reason: string | null;
};

function planSummaryLine(planRow: LatestPlanRow | null) {
  if (!planRow?.plan_json) return null;
  const summary = (planRow.plan_json.summary ?? {}) as Record<string, unknown>;
  return [
    summary.greeting ? String(summary.greeting) : null,
    planRow.daily_calories ? `${planRow.daily_calories} kcal/day` : null,
    planRow.protein_g ? `${planRow.protein_g}g protein` : null,
    planRow.training_days_per_week ? `${planRow.training_days_per_week} training days/week` : null
  ]
    .filter(Boolean)
    .join(" | ");
}

export async function getLatestTjaiPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<LatestPlanRow | null> {
  const { data, error } = await supabase
    .from("saved_tjai_plans")
    .select("id,goal,daily_calories,protein_g,training_days_per_week,training_location,plan_json,answers_json,metrics_json,version_number,created_at,updated_at")
    .eq("user_id", userId)
    .order("version_number", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[TJAI plan-store] latest plan query failed:", error.message);
    return null;
  }

  return (data as LatestPlanRow | null) ?? null;
}

export async function buildTjaiMemorySnapshot(
  supabase: SupabaseClient,
  userId: string
): Promise<TjaiMemorySnapshot> {
  const [latestPlan, prefRows, workoutRows, progressRows, adaptiveRow] = await Promise.all([
    getLatestTjaiPlan(supabase, userId),
    supabase
      .from("user_chat_preferences")
      .select("preference_key,preference_value")
      .eq("user_id", userId),
    supabase
      .from("workout_logs")
      .select("workout_date,logged_at,exercise,exercise_name,sets,reps,weight_kg")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(10),
    supabase
      .from("progress_entries")
      .select("entry_date,weight_kg,body_fat_percent,waist_cm")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .limit(6),
    supabase
      .from("tjai_adaptive_checkpoints")
      .select("should_adapt,urgency,trigger_regen,regen_reason")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const preferences = ((prefRows.data ?? []) as PreferenceRow[]).map((row) => ({
    key: row.preference_key,
    value: row.preference_value
  }));
  const workouts = (workoutRows.data ?? []) as WorkoutRow[];
  const progress = (progressRows.data ?? []) as ProgressRow[];
  const latest = progress[0];
  const oldest = progress[progress.length - 1];

  return {
    latestPlanSummary: planSummaryLine(latestPlan),
    priorPlanGoal: latestPlan?.goal ?? null,
    planVersion: latestPlan?.version_number ?? null,
    preferences,
    workoutSummary: workouts.map((row) => {
      const date = row.workout_date ?? row.logged_at ?? "?";
      const exercise = row.exercise_name ?? row.exercise ?? "workout";
      const setLine =
        row.sets && row.reps ? ` ${row.sets}x${row.reps}` : "";
      const load = row.weight_kg ? ` @ ${row.weight_kg}kg` : "";
      return `${date}: ${exercise}${setLine}${load}`;
    }),
    progressSummary: {
      latestWeightKg: typeof latest?.weight_kg === "number" ? latest.weight_kg : null,
      changeKg:
        typeof latest?.weight_kg === "number" && typeof oldest?.weight_kg === "number"
          ? Number((latest.weight_kg - oldest.weight_kg).toFixed(1))
          : null,
      latestBodyFatPercent: typeof latest?.body_fat_percent === "number" ? latest.body_fat_percent : null,
      latestWaistCm: typeof latest?.waist_cm === "number" ? latest.waist_cm : null
    },
    adaptiveCheckpoint: adaptiveRow.data
      ? {
          shouldAdapt: Boolean((adaptiveRow.data as AdaptiveCheckpointRow).should_adapt),
          urgency: ((adaptiveRow.data as AdaptiveCheckpointRow).urgency ?? "low") as "low" | "medium" | "high",
          triggerRegen: Boolean((adaptiveRow.data as AdaptiveCheckpointRow).trigger_regen),
          regenReason: (adaptiveRow.data as AdaptiveCheckpointRow).regen_reason ?? null
        }
      : null
  };
}

export async function saveTjaiStructuredMemory(
  supabase: SupabaseClient,
  userId: string,
  answers: Record<string, unknown>,
  source = "generation"
) {
  try {
    const profile = buildTjaiUserProfile(answers);
    const payload = {
      user_id: userId,
      source,
      goal: profile.goal,
      training_location: profile.trainingLocation,
      training_days: profile.trainingDays,
      diet_style: profile.dietStyle,
      obstacles: profile.biggestObstacles,
      profile_json: profile,
      updated_at: new Date().toISOString()
    };
    await supabase.from("tjai_user_memory").upsert(payload, { onConflict: "user_id,source" });
  } catch (error) {
    console.error("[TJAI plan-store] save structured memory failed:", error);
  }
}

export async function saveAdaptiveCheckpoint(
  supabase: SupabaseClient,
  userId: string,
  checkpoint: {
    shouldAdapt: boolean;
    urgency: "low" | "medium" | "high";
    triggerRegen: boolean;
    regenReason: string | null;
    snapshot?: Record<string, unknown>;
  }
) {
  try {
    await supabase.from("tjai_adaptive_checkpoints").upsert(
      {
        user_id: userId,
        should_adapt: checkpoint.shouldAdapt,
        urgency: checkpoint.urgency,
        trigger_regen: checkpoint.triggerRegen,
        regen_reason: checkpoint.regenReason,
        snapshot_json: checkpoint.snapshot ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );
  } catch (error) {
    console.error("[TJAI plan-store] save adaptive checkpoint failed:", error);
  }
}

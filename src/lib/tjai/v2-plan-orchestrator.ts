import type { SupabaseClient } from "@supabase/supabase-js";

import { generateV2Diet } from "@/lib/tjai/generators/diet-v2";
import {
  blockingSignals,
  computeV2Macros,
  intakeContext as buildIntakeContext
} from "@/lib/tjai/generators/macros-v2";
import { getOrGenerateRecipe } from "@/lib/tjai/generators/recipes-v2";
import { generateV2Workout } from "@/lib/tjai/generators/workout-v2";
import {
  TJAI_PLAN_VERSION,
  type V2Plan,
  type V2PlanStreamEvent,
  type V2Recipe
} from "@/lib/tjai/v2-plan-schema";
import type { QuizAnswers } from "@/lib/tjai-types";

/**
 * Orchestrates the v2 plan generation pipeline. Runs each section in
 * sequence and emits a stream event after each one. Caller (the SSE
 * route) writes events to the wire and persists the final plan.
 *
 * Sequence:
 *   1. Block-check (BMI<16 + fat_loss → refuse) — emit error+done, stop.
 *   2. Macros (deterministic, instant) — emit "section: macros".
 *   3. Disclaimers (from intake signals) — emit each as "disclaimer".
 *   4. Workout (Opus, ~10-15s) — emit "section: workout".
 *   5. Diet (Haiku, ~5-8s) — emit "section: diet".
 *   6. Final "done" event with the assembled V2Plan.
 *
 * Recipes/grocery/supplements are PR5/6/7 — orchestrator hooks in once
 * those generators exist.
 */

export async function* runV2PlanStream(args: {
  answers: QuizAnswers;
  userId: string;
  locale: string;
  planId: string;
}): AsyncGenerator<V2PlanStreamEvent, void, void> {
  const { answers, userId, locale, planId } = args;

  yield { type: "start", planId };

  // 1. Hard blocks
  const blocker = blockingSignals(answers);
  if (blocker) {
    yield { type: "error", message: blocker.message };
    return;
  }

  // 2. Macros
  const { macros, disclaimers: macroDisclaimers } = computeV2Macros(answers);
  yield { type: "section", key: "macros", data: macros };

  for (const d of macroDisclaimers) {
    yield { type: "disclaimer", data: d };
  }

  // 3. Build intake context for downstream generators
  const intake = buildIntakeContext(answers);

  // 4. Workout (Opus)
  const workout = await generateV2Workout({ intake, userId });
  if (workout) {
    yield { type: "section", key: "workout", data: workout };
  }

  // 5. Diet (Haiku)
  const diet = await generateV2Diet({ intake, macros, userId });
  if (diet) {
    yield { type: "section", key: "diet", data: diet };
  }

  // 6. Recipes for day 1 only (~3-4 meals). Other days lazily generate
  //    when the user expands them via /api/tjai/recipe-v2. We mutate the
  //    diet's day-1 meals in place to attach recipeHash references.
  const recipes: Record<string, V2Recipe> = {};
  if (diet) {
    const day1 = diet.days.find((d) => d.day === 1);
    if (day1) {
      for (const meal of day1.meals) {
        const recipe = await getOrGenerateRecipe({
          mealName: meal.name,
          intake,
          locale,
          targetKcal: meal.kcal,
          userId
        });
        if (recipe) {
          meal.recipeHash = recipe.hash;
          recipes[recipe.hash] = recipe;
        }
      }
    }
  }
  // Don't emit a recipes section until at least one cooked successfully.
  if (Object.keys(recipes).length > 0) {
    yield { type: "section", key: "recipes", data: recipes };
  }

  // 7. Final assembled plan
  const plan: V2Plan = {
    version: TJAI_PLAN_VERSION,
    generatedAt: new Date().toISOString(),
    locale,
    intakeSnapshotKeys: Object.keys(answers),
    macros,
    workout: workout ?? undefined,
    diet: diet ?? undefined,
    recipes: Object.keys(recipes).length > 0 ? recipes : undefined,
    disclaimers: macroDisclaimers
  };

  yield { type: "done", plan };
}

/**
 * Persist the final plan into `saved_tjai_plans.plan_json` with a v2
 * shape. Reuses the existing table — no new migration.
 *
 * The legacy plan-version column on saved_tjai_plans (`version_number`)
 * tracks user revisions. The schema field on plan_json (`version: 2`)
 * tracks which generator wrote it.
 */
export async function persistV2Plan(
  supabase: SupabaseClient,
  userId: string,
  plan: V2Plan
): Promise<string | null> {
  const { data, error } = await supabase
    .from("saved_tjai_plans")
    .insert({
      user_id: userId,
      plan_json: plan,
      // saved_tjai_plans requires NOT NULL on these two — we put a small
      // pointer here. Full intake answers live in tjai_intake_v2_answers.
      answers_json: { __v2_intake_snapshot_keys: plan.intakeSnapshotKeys },
      metrics_json: {
        bmrKcal: plan.macros.bmrKcal,
        tdeeKcal: plan.macros.tdeeKcal,
        targetKcal: plan.macros.targetKcal,
        proteinG: plan.macros.proteinG
      }
    })
    .select("id")
    .single();
  if (error) return null;
  return (data as { id: string } | null)?.id ?? null;
}

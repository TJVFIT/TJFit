import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import { callClaude, extractJsonBlock } from "@/lib/tjai-anthropic";
import type { IntakeContext } from "@/lib/tjai/generators/macros-v2";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { V2Recipe } from "@/lib/tjai/v2-plan-schema";

/**
 * v2 recipe generator. Routes to Haiku, cohort-cached.
 *
 * Cache key = sha256 of:
 *   meal_name + locale + religion_diet + sorted-allergies + cook_time
 *
 * Two users with the same dietary profile asking for the same meal name
 * get the same cached recipe — no LLM call. Personalization happens via
 * the cache key itself.
 */

type CacheKeyInput = {
  mealName: string;
  locale: string;
  religionDiet: string;
  allergies: string[];
  cookTime: string;
};

export function recipeCacheKey(input: CacheKeyInput): string {
  const allergiesNormalized = [...input.allergies].sort().join(",");
  const raw = [
    input.mealName.trim().toLowerCase(),
    input.locale,
    input.religionDiet,
    allergiesNormalized,
    input.cookTime
  ].join("::");
  return createHash("sha256").update(raw).digest("hex");
}

const SYSTEM_PROMPT = `You write a single recipe. Output STRICT JSON ONLY, no prose, no markdown.

Schema:
{
  "cookTimeMin": <number, 5-90>,
  "difficulty": 1 | 2 | 3,
  "servings": <integer 1-6>,
  "ingredients": [
    {
      "name": "Chicken breast",
      "quantity": "200 g",
      "swaps": ["turkey breast", "firm tofu"]
    }
  ],
  "steps": [
    { "n": 1, "text": "Pat chicken dry, season with salt and pepper." }
  ],
  "macros": {
    "kcal": <integer>,
    "proteinG": <integer>,
    "carbsG": <integer>,
    "fatG": <integer>
  },
  "estCost": "<currency-aware short range, e.g. '₺40-60' or '$3-5'>",
  "substitutionNote": "<one short line, e.g. 'Swap chicken for chickpeas for vegetarian'>"
}

Rules:
- Honor the user's locale: write step text and ingredient names in that locale's language.
- Honor restrictions: NEVER include forbidden ingredients (halal/kosher/vegetarian/etc.) or listed allergens.
- 4-10 ingredients. 4-8 steps. Steps are short imperatives.
- Use cuisine appropriate to locale: TR users get Turkish-inflected recipes (kofte, mercimek, menemen), AR Middle-Eastern, ES Spanish, FR French.
- cookTimeMin must respect the user's cook-time budget (15/30/60/any).
- difficulty: 1 = sheet-pan / one-pan, 2 = standard, 3 = involves multiple components.
- Output valid JSON only. No leading text. No trailing text.`;

export type RecipeGenInput = {
  mealName: string;
  intake: IntakeContext;
  locale: string;
  /** Macros target for THIS meal (per-meal slice of daily target). */
  targetKcal?: number;
  userId?: string;
};

/**
 * Get a recipe — from cache if present, otherwise generate and persist.
 */
export async function getOrGenerateRecipe(
  args: RecipeGenInput
): Promise<V2Recipe | null> {
  const admin = getSupabaseServerClient();
  if (!admin) return null;

  const hash = recipeCacheKey({
    mealName: args.mealName,
    locale: args.locale,
    religionDiet: args.intake.religionDiet,
    allergies: args.intake.allergies,
    cookTime: args.intake.cookTime
  });

  const cached = await readCache(admin, hash);
  if (cached) {
    void bumpCacheHit(admin, hash);
    return { ...cached, hash };
  }

  const generated = await generateRecipe(args, hash);
  if (!generated) return null;

  void writeCache(admin, generated);
  return generated;
}

async function readCache(supabase: SupabaseClient, hash: string): Promise<V2Recipe | null> {
  const { data } = await supabase
    .from("tjai_recipes_cache")
    .select("hash,recipe_json")
    .eq("hash", hash)
    .maybeSingle();
  if (!data) return null;
  return data.recipe_json as V2Recipe;
}

async function bumpCacheHit(supabase: SupabaseClient, hash: string): Promise<void> {
  // Two-step bump because supabase-js doesn't expose RPC inc; race is fine.
  const { data } = await supabase
    .from("tjai_recipes_cache")
    .select("hit_count")
    .eq("hash", hash)
    .maybeSingle();
  const next = ((data as { hit_count?: number } | null)?.hit_count ?? 0) + 1;
  await supabase
    .from("tjai_recipes_cache")
    .update({ hit_count: next, last_hit_at: new Date().toISOString() })
    .eq("hash", hash);
}

async function writeCache(supabase: SupabaseClient, recipe: V2Recipe): Promise<void> {
  await supabase.from("tjai_recipes_cache").upsert(
    {
      hash: recipe.hash,
      meal_name: recipe.mealName,
      locale: recipe.locale,
      recipe_json: recipe,
      est_cost: recipe.estCost ?? null
    },
    { onConflict: "hash" }
  );
}

async function generateRecipe(args: RecipeGenInput, hash: string): Promise<V2Recipe | null> {
  const userPrompt = buildPrompt(args);

  try {
    const text = await callClaude({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 1500,
      task: "creative",
      route: "tjai/v2-recipe-generate",
      userId: args.userId ?? null
    });
    const json = extractJsonBlock(text);
    if (!json) return null;
    const parsed = JSON.parse(json) as Omit<V2Recipe, "hash" | "mealName" | "locale">;
    if (!Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) return null;

    return {
      hash,
      mealName: args.mealName,
      locale: args.locale,
      cookTimeMin: parsed.cookTimeMin ?? 30,
      difficulty: ([1, 2, 3] as const).includes(parsed.difficulty)
        ? parsed.difficulty
        : 2,
      servings: Math.max(1, Math.min(6, parsed.servings ?? 1)),
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      macros: parsed.macros ?? { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
      estCost: parsed.estCost,
      substitutionNote: parsed.substitutionNote
    };
  } catch {
    return null;
  }
}

function buildPrompt(args: RecipeGenInput): string {
  const { mealName, intake, locale, targetKcal } = args;
  const allergiesLine =
    intake.allergies.length > 0 && intake.allergies[0] !== "none"
      ? `Allergies (must avoid): ${intake.allergies.join(", ")}.`
      : "No allergies.";
  const restrictionLine =
    intake.religionDiet === "none"
      ? "No religious restriction."
      : `Restriction: ${intake.religionDiet}.`;

  return `Recipe for: "${mealName}"
Locale: ${locale}
Country: ${intake.country || "international"}
Cook time budget: ${intake.cookTime} min
Family size: ${intake.familySize}
${restrictionLine}
${allergiesLine}
${targetKcal ? `Target kcal for this meal: ~${targetKcal}` : ""}

Generate the recipe JSON now.`;
}

/**
 * TJAI v2 plan output schema.
 *
 * One row per user lives in `saved_tjai_plans.plan_json`. The schema is
 * versioned so the same table can hold both v1 (legacy quiz) and v2
 * plans during the transition window.
 *
 * Sections are independently generated and streamed back to the client
 * one at a time. Every section is optional — partial plans render the
 * sections they have.
 */

export const TJAI_PLAN_VERSION = 2 as const;

export type V2Macros = {
  bmrKcal: number;
  tdeeKcal: number;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Goal-bias delta applied to TDEE (-500/-200/+300/etc). */
  goalBiasKcal: number;
  /** Why we landed on this number, one line for transparency. */
  rationale: string;
};

export type V2WorkoutExercise = {
  name: string;
  sets: number;
  reps: string; // "8-10" or "AMRAP" — keep flexible
  rpe: string; // "7-8" / "8" / "RIR 2"
  tempo?: string; // e.g. "2-1-2-0"
  restSec?: number;
  cue?: string; // 1-line form note
  videoUrl?: string;
};

export type V2WorkoutDay = {
  /** "1" / "2" / etc. within the week. */
  day: number;
  label: string; // "Push" / "Upper" / "Full body"
  exercises: V2WorkoutExercise[];
  conditioning?: string; // optional cardio finisher
};

export type V2WorkoutPhase = {
  /** 1, 2, or 3 for a 12-week plan (4 weeks per phase). */
  phase: number;
  weeksLabel: string; // "Weeks 1–4"
  focus: string; // "Hypertrophy base"
  days: V2WorkoutDay[];
};

export type V2Workout = {
  split: string; // "PPL" / "upper-lower" / "full-body"
  daysPerWeek: number;
  phases: V2WorkoutPhase[];
  progressionRule: string; // 1-line description
};

export type V2DietMeal = {
  slot: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  description?: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Cache hash for this meal's full recipe in tjai_recipes_cache. */
  recipeHash?: string;
};

export type V2RecipeStep = {
  /** 1-based step number. */
  n: number;
  text: string;
};

export type V2RecipeIngredient = {
  name: string;
  quantity: string;
  /** Substitution suggestions if user lacks this. */
  swaps?: string[];
};

export type V2Recipe = {
  hash: string;
  mealName: string;
  locale: string;
  cookTimeMin: number;
  difficulty: 1 | 2 | 3;
  servings: number;
  ingredients: V2RecipeIngredient[];
  steps: V2RecipeStep[];
  macros: {
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  estCost?: string;
  /** One-line substitution note (e.g. "Swap chicken for tofu for vegetarian."). */
  substitutionNote?: string;
};

export type V2DietDay = {
  day: number; // 1-7
  label: string; // "Mon" / "Tue"
  meals: V2DietMeal[];
  totalKcal: number;
  totalProteinG: number;
};

export type V2Diet = {
  pattern: "standard" | "ramadan" | "intermittent_fasting";
  /** "Suhoor 5:00 / Iftar 19:30" or "12pm-8pm window" or empty for standard */
  schedule?: string;
  days: V2DietDay[];
  swappableMeals: boolean;
};

export type V2GroceryItem = {
  category: "proteins" | "carbs" | "produce" | "dairy_eggs" | "pantry" | "supplements";
  name: string;
  quantity: string; // "1.5 kg"
  estCost?: string; // "₺120-180"
  brandHint?: string;
  alternates?: string[]; // ["turkey", "fish"]
  priority: "must" | "optional";
};

export type V2Grocery = {
  weekOf: string; // ISO date
  market?: string; // resolved market id from intake
  items: V2GroceryItem[];
  estTotalCost?: string;
  deliveryLink?: string; // url for online delivery if available
};

export type V2SupplementItem = {
  name: string;
  category: "core" | "performance" | "recovery" | "health";
  doseLine: string; // e.g. "3-5g/day" — published-range citations
  rationale: string;
  buyLink?: string;
  /** Set true if this overlaps with current_supplements from intake. */
  alreadyTaking?: boolean;
};

export type V2Supplements = {
  items: V2SupplementItem[];
  monthlyCostEstimate?: string;
  warnings?: string[]; // e.g. caffeine + heart issues
};

export type V2Disclaimer = {
  kind: "cv" | "diabetes" | "pregnancy" | "ed" | "underweight" | "extreme_pace" | "doctor_clearance";
  message: string;
};

export type V2Plan = {
  version: typeof TJAI_PLAN_VERSION;
  generatedAt: string; // ISO timestamp
  locale: string;
  /** Snapshot of intake answers used to generate this plan. */
  intakeSnapshotKeys: string[];
  macros: V2Macros;
  workout?: V2Workout;
  diet?: V2Diet;
  /** Map of recipeHash → recipe. Populated lazily; only meals the user
   *  actually expanded get full recipe text. The diet step references
   *  these via meal.recipeHash. */
  recipes?: Record<string, V2Recipe>;
  grocery?: V2Grocery;
  supplements?: V2Supplements;
  disclaimers: V2Disclaimer[];
};

/** Streaming event envelope. */
export type V2PlanStreamEvent =
  | { type: "start"; planId: string }
  | { type: "section"; key: keyof V2Plan; data: unknown }
  | { type: "disclaimer"; data: V2Disclaimer }
  | { type: "error"; message: string }
  | { type: "done"; plan: V2Plan };

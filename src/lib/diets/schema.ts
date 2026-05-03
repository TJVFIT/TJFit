// v3.9 diet schema — macro-precise meal plans paired with programs.
//
// Same locale strategy as the program schema: EN authored, other
// locales filled by the translation pipeline.

import type { Locale, LocalizedString } from "@/lib/programs/schema";
export type { Locale, LocalizedString };

// ============================================================
// Macros — the universal unit
// ============================================================
export type Macros = {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  /** Computed: protein*4 + carbs*4 + fat*9. Stored for fast PDF render. */
  calories: number;
};

export function computeCalories(m: Omit<Macros, "calories">): number {
  return Math.round(m.protein_g * 4 + m.carbs_g * 4 + m.fat_g * 9);
}

// ============================================================
// Ingredient — atomic food, shared across diets
// ============================================================
export type IngredientCategory =
  | "protein"
  | "carb"
  | "fat"
  | "vegetable"
  | "fruit"
  | "condiment"
  | "beverage"
  | "snack"
  | "dairy"
  | "supplement";

export type Ingredient = {
  id: string;
  name: LocalizedString;
  /** Always grams for consistency; UI converts to imperial. */
  amount_g: number;
  /** Display string per locale ('150g' / '5 oz' / 'بيضتان'). */
  amount_display: LocalizedString;
  /** Macros for `amount_g` of this ingredient (not per 100g). */
  macros_per_amount: Macros;
  category: IngredientCategory;
  /** Other ingredients that swap 1:1 (or scaled by ratio) for the same role. */
  substitutions?: { ingredientId: string; ratio: number }[];
  cultural_tags?: string[];
};

// ============================================================
// Meal
// ============================================================
export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "pre_workout"
  | "post_workout"
  | "suhoor"
  | "iftar";

export type Meal = {
  id: string;
  name: LocalizedString;
  type: MealType;
  prep_time_minutes: number;
  ingredients: Ingredient[];
  instructions: LocalizedString;
  total_macros: Macros;
  notes?: LocalizedString;
};

// ============================================================
// DayPlan
// ============================================================
export type DayPlan = {
  day: number;
  weekNumber: number;
  meals: Meal[];
  total_macros: Macros;
  hydration_target_liters: number;
  notes?: LocalizedString;
};

// ============================================================
// DietWeek
// ============================================================
export type DietPhase =
  | "adaptation"
  | "progression"
  | "maintenance"
  | "refeed"
  | "cut_aggressive";

export type DietWeek = {
  weekNumber: number;
  phase: DietPhase;
  focus: LocalizedString;
  days: DayPlan[];
  shopping_list: Ingredient[];
};

// ============================================================
// Diet
// ============================================================
export type DietCategory =
  | "cutting"
  | "bulking"
  | "maintenance"
  | "recomp"
  | "cultural"
  | "specialty";

export type Diet = {
  id: string;
  slug: string;
  category: DietCategory;
  cultural_tag?: string;
  goal: LocalizedString;
  duration_weeks: number;
  /** Calorie target for the 70 kg / 154 lb baseline adult. */
  daily_calories_baseline: number;
  macro_split_target: { protein_pct: number; carbs_pct: number; fat_pct: number };
  who_for: LocalizedString;
  who_not_for: LocalizedString;
  results_expected: LocalizedString;
  pricing_usd: number;
  cover_image_path: string;
  weeks: DietWeek[];
  ingredients_used: string[];
  why_this_works: LocalizedString;
  scaling_guidance: LocalizedString;
  evidence_citations: string[];
  created_at: string;
  version: string;
};

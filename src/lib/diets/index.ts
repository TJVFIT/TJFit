// v3.9 round 2 — diets registry placeholder.
//
// Real diets ship in a future authoring session per
// docs/MASTER_PLAN_v4.md and docs/SHIP_REPORT_v3_9.md. For now we
// surface ONE placeholder so the /[locale]/diets and
// /[locale]/diets/[slug] routes render something instead of
// redirecting back to home.
//
// To replace with real diets: author files under
// src/lib/diets/diets/{slug}.ts following the Diet schema, then
// import + register in REGISTRY below.

import type { Diet } from "./schema";
import { en } from "@/lib/programs/schema";

const placeholderDiet: Diet = {
  id: "middle-eastern-cutting-12w",
  slug: "middle-eastern-cutting",
  category: "cutting",
  cultural_tag: "middle_eastern",
  goal: en(
    "Lose fat eating real food. Foul, shakshuka, kabsa, grilled meats, tabbouleh — calibrated to a calorie deficit without losing the flavour you actually want."
  ),
  duration_weeks: 12,
  daily_calories_baseline: 1900,
  macro_split_target: { protein_pct: 35, carbs_pct: 40, fat_pct: 25 },
  who_for: en(
    "MENA users, Middle Eastern diaspora, and anyone who's bored of grilled-chicken-and-rice cutting plans. You eat regional food and want a cut that respects that."
  ),
  who_not_for: en(
    "Not for users who don't eat any of the listed foods. Not a strict deficit — if you need >25% deficit (extreme cut), pair with a different plan."
  ),
  results_expected: en(
    "If you hit ≥80% of meals: 0.4-0.7 kg of fat loss per week, training preserved, energy stable through the day. Variance high — depends on starting weight, training volume, sleep."
  ),
  pricing_usd: 4.99,
  cover_image_path: "/diets/middle-eastern-cutting/cover.jpg",
  weeks: [],
  ingredients_used: [],
  why_this_works: en(
    "Cultural authenticity + macro-precise calibration is the lever. Most diets fail because the food sucks; people drop off in week 3. Foul, hummus, fattoush, kabsa with controlled portions hit protein and fibre targets while staying delicious. The mediterranean diet pattern is the most-studied long-term sustainable nutrition strategy in the literature."
  ),
  scaling_guidance: en(
    "Baseline = 1900 kcal/day for 70 kg / 154 lb adult. Scale linearly: your target kcal = 1900 × (your kg / 70). Recompute macros at the same percentages."
  ),
  evidence_citations: [
    "https://pubmed.ncbi.nlm.nih.gov/30706257/ — Mediterranean diet patterns + cardiovascular outcomes",
    "https://pubmed.ncbi.nlm.nih.gov/30943941/ — Protein intake + lean-mass preservation during energy deficit"
  ],
  created_at: "2026-05-03",
  version: "0.1.0-placeholder"
};

const REGISTRY: Record<string, Diet> = {
  [placeholderDiet.slug]: placeholderDiet
};

export function getDiet(slug: string): Diet | undefined {
  return REGISTRY[slug];
}

export function listDiets(): Diet[] {
  return Object.values(REGISTRY);
}

export function listDietSlugs(): string[] {
  return Object.keys(REGISTRY);
}

export type { Diet } from "./schema";

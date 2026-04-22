import type { Program } from "@/lib/content";

export type DietPhase = "cutting" | "bulking";

const CUTTING_SLUGS = new Set<string>([
  "keto-shred-diet-12w",
  "gut-health-fat-loss-diet-12w",
  "student-fat-loss-diet-12w",
  "clean-cutting-diet-12w",
  "hard-cut-athlete-diet-12w",
  "clean-cut-starter",
  "mediterranean-lean-protocol-12w",
  "high-protein-fat-loss-12w",
  "intermittent-fasting-cut-12w",
  "carb-cycling-system-12w",
  "flexible-dieting-framework-12w",
  "anti-inflammatory-reset-12w",
  "hormone-balance-nutrition-12w",
  "low-fodmap-fat-loss-12w",
  "halal-high-protein-cut-12w",
  "mediterranean-maintenance-12w",
  "high-volume-low-calorie-cut-12w",
  "budget-cutting-meal-plan-12w",
  "travel-and-restaurant-diet-12w",
  "endomorph-fat-loss-diet-12w"
]);

const BULKING_SLUGS = new Set<string>([
  "lean-bulk-diet-12w",
  "high-calorie-mass-diet-12w",
  "muscle-gain-athlete-diet-12w",
  "student-bulk-diet-12w",
  "clean-weight-gain-diet-12w",
  "lean-bulk-starter",
  "plant-based-muscle-gain-12w",
  "vegetarian-lean-bulk-12w",
  "gluten-free-performance-12w",
  "dairy-free-muscle-plan-12w",
  "kosher-clean-bulk-12w",
  "post-workout-recovery-nutrition-12w"
]);

/** Catalog nutrition plans (excludes training programs that only include a nutrition asset). */
export function isCatalogDiet(program: Program): boolean {
  return program.category.toLowerCase() === "nutrition";
}

export function getDietPhase(program: Program): DietPhase {
  if (CUTTING_SLUGS.has(program.slug)) return "cutting";
  if (BULKING_SLUGS.has(program.slug)) return "bulking";
  const t = program.title.toLowerCase();
  if (/\bbulk\b|\bmass\b|weight gain|muscle gain|lean bulk/i.test(t)) return "bulking";
  return "cutting";
}

export type DietCalorieSpec =
  | { mode: "target"; kcal: number }
  | { mode: "range"; min: number; max: number };

/** Display hints for cards; omit when unknown. */
export function getDietCalorieSpec(program: Program): DietCalorieSpec | null {
  switch (program.slug) {
    case "clean-cut-starter":
      return { mode: "target", kcal: 1800 };
    case "lean-bulk-starter":
      return { mode: "target", kcal: 2800 };
    case "keto-shred-diet-12w":
      return { mode: "range", min: 1600, max: 2000 };
    case "gut-health-fat-loss-diet-12w":
    case "student-fat-loss-diet-12w":
      return { mode: "range", min: 1700, max: 2100 };
    case "clean-cutting-diet-12w":
      return { mode: "range", min: 1800, max: 2200 };
    case "hard-cut-athlete-diet-12w":
      return { mode: "range", min: 1900, max: 2400 };
    case "lean-bulk-diet-12w":
    case "clean-weight-gain-diet-12w":
      return { mode: "range", min: 2600, max: 3000 };
    case "high-calorie-mass-diet-12w":
      return { mode: "range", min: 3000, max: 3800 };
    case "muscle-gain-athlete-diet-12w":
      return { mode: "range", min: 2800, max: 3400 };
    case "student-bulk-diet-12w":
      return { mode: "range", min: 2500, max: 3200 };
    default:
      return null;
  }
}

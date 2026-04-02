import type { Program } from "@/lib/content";

export type DietPhase = "cutting" | "bulking";

const CUTTING_SLUGS = new Set<string>([
  "keto-shred-diet-12w",
  "gut-health-fat-loss-diet-12w",
  "student-fat-loss-diet-12w",
  "clean-cutting-diet-12w",
  "hard-cut-athlete-diet-12w",
  "clean-cut-starter"
]);

const BULKING_SLUGS = new Set<string>([
  "lean-bulk-diet-12w",
  "high-calorie-mass-diet-12w",
  "muscle-gain-athlete-diet-12w",
  "student-bulk-diet-12w",
  "clean-weight-gain-diet-12w",
  "lean-bulk-starter"
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

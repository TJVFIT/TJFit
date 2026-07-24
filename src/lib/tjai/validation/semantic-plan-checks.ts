import type { QuizAnswers, TJAIPlan, TjaiUserProfile } from "@/lib/tjai-types";

/**
 * Always-on semantic safety validation for generated plans (TJFITV.10X PR5).
 *
 * Treats model output as untrusted (OWASP LLM05): after JSON parse + structural
 * shape pass, this catches hard-stop content that must never reach a saved plan —
 * foods that violate the user's declared restrictions/allergies, PED/Rx dosing,
 * HTML/script injection, and impossible macros. Returns stable issue codes so the
 * pipeline can build a targeted repair prompt and the trace stays auditable.
 *
 * Softer coherence checks (calorie/protein drift) remain in enhanced-plan-checks
 * behind TJAI_STRICT_PLAN_VALIDATION; this layer is for non-negotiable safety.
 */

export type TjaiValidationSeverity = "error" | "warn";

export type TjaiValidationIssue = {
  severity: TjaiValidationSeverity;
  code: string;
  path: string;
  message: string;
  repairHint?: string;
};

export type TjaiValidationResult = {
  ok: boolean;
  issues: TjaiValidationIssue[];
  repairable: boolean;
};

export type TjaiFoodConstraints = {
  dietStyle: string;
  dietaryRestrictions: string[];
  avoidedFoods: string[];
  likedFoods: string[];
  allergyTerms: string[];
};

// Hard-stop term groups. Context-aware allowances below prevent false positives.
const FORBIDDEN_FOOD_TERMS: Record<string, string[]> = {
  halal: ["pork", "bacon", "ham", "lard", "prosciutto", "pepperoni", "wine", "beer", "alcohol"],
  vegetarian: ["beef", "chicken", "turkey", "pork", "fish", "salmon", "tuna", "shrimp", "seafood", "gelatin"],
  vegan: ["beef", "chicken", "fish", "egg", "eggs", "milk", "yogurt", "cheese", "whey", "casein", "butter", "honey", "gelatin"],
  nut_free: ["peanut", "almond", "cashew", "walnut", "pistachio", "hazelnut", "pecan", "macadamia", "peanut butter"],
  dairy_free: ["milk", "yogurt", "greek yogurt", "cheese", "cottage cheese", "whey", "casein", "butter"],
  gluten_free: ["wheat", "barley", "rye", "seitan", "couscous"]
};

const SESAME_TERMS = ["sesame", "tahini", "halvah"];

// Phrases that neutralize a forbidden match when present in the same food string.
const ALLOWANCES: Record<string, string[]> = {
  vegan: ["vegan", "plant-based", "plant based", "soy milk", "almond milk", "oat milk", "coconut milk", "egg substitute", "egg replacer"],
  vegetarian: ["vegan", "plant-based", "plant based", "meat-free", "meatless"],
  halal: ["halal"],
  dairy_free: ["soy milk", "almond milk", "oat milk", "coconut milk", "dairy-free", "dairy free", "non-dairy", "vegan"],
  gluten_free: ["gluten-free", "gluten free", "certified gluten-free"],
  nut_free: ["coconut"]
};

// Ambiguous terms that warn (rather than error) for halal unless explicitly compliant.
const HALAL_AMBIGUOUS = ["sausage", "salami", "hot dog", "marshmallow"];

const UNSAFE_CONTENT =
  /\b(anavar|dianabol|trenbolone|testosterone (?:enanthate|cypionate|propionate)|ostarine|ligandrol|rad-?140|sarm|sarms|semaglutide|ozempic|tirzepatide|clenbuterol|winstrol|steroid cycle|pct protocol)\b/i;

const HTML_SCRIPT = /<\s*script\b|javascript:\s*|<\s*\/?\s*[a-z][a-z0-9]*(?:\s[^>]*)?>/i;

function norm(value: string): string {
  return value.toLowerCase().replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsTerm(haystack: string, term: string): boolean {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`).test(haystack);
}

function hasAllowance(haystack: string, allowances: string[] | undefined): boolean {
  if (!allowances) return false;
  return allowances.some((phrase) => haystack.includes(phrase));
}

export function buildTjaiFoodConstraints(profile: TjaiUserProfile, _answers?: QuizAnswers): TjaiFoodConstraints {
  const allergyTerms = (profile.restrictionNotes ?? "")
    .toLowerCase()
    .split(/[,;\n]/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
  return {
    dietStyle: profile.dietStyle,
    dietaryRestrictions: profile.dietaryRestrictions.filter((restriction) => restriction !== "none"),
    avoidedFoods: profile.avoidedFoods.filter((food) => food !== "nothing_specific").map((food) => norm(food)),
    likedFoods: profile.likedFoods.map((food) => norm(food)),
    allergyTerms
  };
}

function activeForbiddenGroups(constraints: TjaiFoodConstraints): string[] {
  const groups = new Set<string>(constraints.dietaryRestrictions);
  // dietStyle can imply a restriction even if the multi-select missed it.
  if (constraints.dietStyle === "vegan") groups.add("vegan");
  if (constraints.dietStyle === "vegetarian") groups.add("vegetarian");
  if (constraints.dietStyle === "halal") groups.add("halal");
  return [...groups].filter((group) => FORBIDDEN_FOOD_TERMS[group]);
}

function checkFoodString(
  raw: string,
  path: string,
  constraints: TjaiFoodConstraints,
  groups: string[],
  issues: TjaiValidationIssue[]
): void {
  const food = norm(raw);
  if (!food) return;

  for (const group of groups) {
    if (hasAllowance(food, ALLOWANCES[group])) continue;
    for (const term of FORBIDDEN_FOOD_TERMS[group]) {
      if (containsTerm(food, norm(term))) {
        issues.push({
          severity: "error",
          code: `forbidden_food_${group}`,
          path,
          message: `"${raw}" contains "${term}", which violates the ${group.replace("_", "-")} restriction.`,
          repairHint: `Replace with a ${group.replace("_", "-")}-compliant alternative.`
        });
        break;
      }
    }
  }

  if (groups.includes("halal")) {
    for (const ambiguous of HALAL_AMBIGUOUS) {
      if (containsTerm(food, ambiguous) && !food.includes("halal")) {
        issues.push({
          severity: "warn",
          code: "halal_ambiguous_food",
          path,
          message: `"${raw}" includes "${ambiguous}" — confirm it is halal-certified.`,
          repairHint: `Label it "halal ${ambiguous}" or swap for a clearly halal option.`
        });
      }
    }
  }

  // Sesame is the 9th major US allergen; flag when the user lists it in free text.
  const sesameDeclared = constraints.allergyTerms.some((token) => token.includes("sesame"));
  if (sesameDeclared) {
    for (const term of SESAME_TERMS) {
      if (containsTerm(food, term)) {
        issues.push({
          severity: "error",
          code: "allergen_sesame",
          path,
          message: `"${raw}" contains "${term}"; user declared a sesame allergy.`,
          repairHint: "Remove sesame/tahini and use a safe substitute."
        });
        break;
      }
    }
  }

  for (const token of constraints.allergyTerms) {
    if (token.includes("sesame")) continue;
    if (containsTerm(food, token)) {
      issues.push({
        severity: "error",
        code: "allergen_declared",
        path,
        message: `"${raw}" matches a declared allergy/restriction note: "${token}".`,
        repairHint: `Avoid "${token}" entirely.`
      });
    }
  }
}

function scanUnsafeText(text: string, path: string, issues: TjaiValidationIssue[]): void {
  if (HTML_SCRIPT.test(text)) {
    issues.push({
      severity: "error",
      code: "html_script_content",
      path,
      message: "Field contains HTML/script-like markup.",
      repairHint: "Return plain text only."
    });
  }
  if (UNSAFE_CONTENT.test(text)) {
    issues.push({
      severity: "error",
      code: "unsafe_drug_content",
      path,
      message: "Field references PED/SARM/Rx dosing, which is out of coaching scope.",
      repairHint: "Remove drug/PED references; keep advice to evidence-tiered supplements and food."
    });
  }
}

export function validateTjaiPlanSemantics(params: {
  plan: TJAIPlan;
  profile: TjaiUserProfile;
  quizAnswers?: QuizAnswers;
}): TjaiValidationResult {
  const { plan, profile } = params;
  const constraints = buildTjaiFoodConstraints(profile, params.quizAnswers);
  const groups = activeForbiddenGroups(constraints);
  const issues: TjaiValidationIssue[] = [];

  scanUnsafeText(plan.summary?.greeting ?? "", "summary.greeting", issues);
  scanUnsafeText(plan.summary?.keyInsight ?? "", "summary.keyInsight", issues);
  scanUnsafeText(plan.diet?.philosophy ?? "", "diet.philosophy", issues);

  const dietWeeks = plan.diet?.weeks ?? [];
  dietWeeks.forEach((week, wi) => {
    (week.days ?? []).forEach((day, di) => {
      (day.meals ?? []).forEach((meal, mi) => {
        const base = `diet.weeks[${wi}].days[${di}].meals[${mi}]`;
        scanUnsafeText(meal.name ?? "", `${base}.name`, issues);
        scanUnsafeText((meal.prepNote ?? "") + " " + (meal.recipe?.steps ?? []).join(" "), `${base}.recipe`, issues);
        checkFoodString(meal.name ?? "", `${base}.name`, constraints, groups, issues);
        (meal.foods ?? []).forEach((food, fi) => {
          scanUnsafeText(food, `${base}.foods[${fi}]`, issues);
          checkFoodString(food, `${base}.foods[${fi}]`, constraints, groups, issues);
        });
        for (const macro of ["calories", "protein", "carbs", "fat"] as const) {
          const value = meal[macro];
          if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) {
            issues.push({
              severity: "error",
              code: "invalid_meal_macro",
              path: `${base}.${macro}`,
              message: `Meal ${macro} is ${value}; must be a finite, non-negative number.`,
              repairHint: "Recompute the meal macros as realistic non-negative numbers."
            });
          }
        }
      });
    });
  });

  const errors = issues.filter((issue) => issue.severity === "error");
  return {
    ok: errors.length === 0,
    issues,
    // Food, macro, and content issues are all fixable by a targeted re-roll.
    repairable: errors.length > 0,
  };
}

export function mergeValidationResults(...results: TjaiValidationResult[]): TjaiValidationResult {
  const issues = results.flatMap((result) => result.issues);
  const errors = issues.filter((issue) => issue.severity === "error");
  return { ok: errors.length === 0, issues, repairable: errors.length > 0 };
}

export function formatValidationIssuesForRepair(result: TjaiValidationResult): string {
  const lines = result.issues
    .slice(0, 12)
    .map((issue) => `- [${issue.severity}] ${issue.path}: ${issue.message}${issue.repairHint ? ` ${issue.repairHint}` : ""}`);
  return [
    "Your previous JSON was structurally valid but failed TJFit safety validation.",
    "Return ONE corrected JSON object that matches the schema exactly. No commentary, no markdown.",
    "Fix these issues:",
    ...lines
  ].join("\n");
}

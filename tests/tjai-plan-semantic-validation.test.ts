/**
 * TJAI semantic plan safety validation (TJFITV.10X PR5).
 * Hard-stop checks: forbidden foods per restriction, declared allergens,
 * PED/Rx content, HTML/script, impossible macros — plus context-aware
 * allowances that must NOT false-positive (soy milk, gluten-free bread, etc.).
 */

import { describe, it, expect } from "vitest";

import { validateTjaiPlanSemantics } from "@/lib/tjai/validation/semantic-plan-checks";
import type { TJAIMeal, TJAIPlan, TjaiUserProfile } from "@/lib/tjai-types";

function profile(overrides: Partial<TjaiUserProfile> = {}): TjaiUserProfile {
  return {
    sex: "male", age: 30, heightCm: 178, weightKg: 80, targetWeightKg: 75,
    goal: "muscle_gain", goalDetail: "size", pace: "moderate", bodyType: "average",
    estimatedBodyFat: 18, injuries: [], injuryNotes: null, activityLevel: "moderate",
    sleepHours: 8, stressLevel: "low", scheduleConstraint: "none", scheduleNotes: null,
    experienceLevel: "intermediate", trainingLocation: "gym", equipment: ["barbell_rack"],
    trainingDays: 4, sessionMinutes: 60, trainingPreference: "hypertrophy",
    dietStyle: "balanced", dietaryRestrictions: ["none"], restrictionNotes: null,
    likedFoods: ["chicken", "rice"], avoidedFoods: ["nothing_specific"],
    monthlyFoodBudget: "moderate", cookingStyle: "simple", mealsPerDay: 4,
    supplements: ["none"], biggestObstacles: [], successVision: "look_different",
    dailyRoutine: "",
    country: "other", groceryMarket: "other_market", jobType: "desk",
    dailySteps: "4k_8k", dietHistory: "first_plan", sleepQuality: "restless",
    drinkHabits: ["mostly_water"], eatingOutFrequency: "rarely", weekendConsistency: "slightly_off",
    ...overrides
  };
}

function planWithFoods(foods: string[], mealOverrides: Partial<TJAIMeal> = {}): TJAIPlan {
  const meal: TJAIMeal = {
    name: "Lunch", time: "1pm", foods, calories: 600, protein: 45, carbs: 60, fat: 18,
    prepNote: "Cook and serve.", ...mealOverrides
  };
  return {
    summary: { greeting: "Hi", calorieTarget: 2800, protein: 170, fat: 70, carbs: 320, water: 3000, weeklyChange: "+0.2kg/wk", timeToGoal: "12 weeks", keyInsight: "Train hard." },
    diet: { philosophy: "Balanced.", weeks: [{ weekRange: "Weeks 1-4", phase: "Foundation", calories: 2800, adjustment: "n/a", days: [{ label: "Training Day", meals: [meal], totals: { calories: 600, protein: 45, carbs: 60, fat: 18 } }] }] },
    program: { philosophy: "Progressive.", structure: "Upper/Lower", weeks: [{ weekRange: "Weeks 1-4", phase: "Foundation", focus: "Base", days: [{ day: "Monday", label: "Upper", exercises: [{ name: "Bench", sets: 3, reps: "8-10", rest: "90s" }] }] }] }
  };
}

describe("validateTjaiPlanSemantics — forbidden foods", () => {
  it("halal rejects bacon and alcohol", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Bacon strips", "200ml wine"]), profile: profile({ dietStyle: "halal" }) });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "forbidden_food_halal")).toBe(true);
  });

  it("vegetarian rejects fish and gelatin", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Grilled salmon", "Gelatin dessert"]), profile: profile({ dietStyle: "vegetarian", dietaryRestrictions: ["vegetarian"] }) });
    expect(r.ok).toBe(false);
  });

  it("vegan rejects whey and eggs", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Whey protein shake", "3 eggs"]), profile: profile({ dietStyle: "vegan", dietaryRestrictions: ["vegan"] }) });
    expect(r.ok).toBe(false);
  });

  it("nut-free rejects peanut butter", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Peanut butter toast"]), profile: profile({ dietaryRestrictions: ["nut_free"] }) });
    expect(r.ok).toBe(false);
  });
});

describe("validateTjaiPlanSemantics — allowances (no false positives)", () => {
  it("dairy-free allows soy milk but rejects whey", () => {
    const ok = validateTjaiPlanSemantics({ plan: planWithFoods(["Soy milk smoothie"]), profile: profile({ dietaryRestrictions: ["dairy_free"] }) });
    expect(ok.ok).toBe(true);
    const bad = validateTjaiPlanSemantics({ plan: planWithFoods(["Whey shake"]), profile: profile({ dietaryRestrictions: ["dairy_free"] }) });
    expect(bad.ok).toBe(false);
  });

  it("gluten-free allows gluten-free bread but rejects regular wheat pasta", () => {
    const ok = validateTjaiPlanSemantics({ plan: planWithFoods(["Gluten-free bread"]), profile: profile({ dietaryRestrictions: ["gluten_free"] }) });
    expect(ok.ok).toBe(true);
    const bad = validateTjaiPlanSemantics({ plan: planWithFoods(["Wheat pasta bowl"]), profile: profile({ dietaryRestrictions: ["gluten_free"] }) });
    expect(bad.ok).toBe(false);
  });

  it("vegan allows plant-based cheese", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Vegan cheese"]), profile: profile({ dietStyle: "vegan", dietaryRestrictions: ["vegan"] }) });
    expect(r.ok).toBe(true);
  });
});

describe("validateTjaiPlanSemantics — allergens & ambiguity", () => {
  it("sesame allergy from notes rejects tahini", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Tahini dressing"]), profile: profile({ restrictionNotes: "sesame allergy" }) });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "allergen_sesame")).toBe(true);
  });

  it("halal warns (not errors) on ambiguous sausage", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Beef sausage"]), profile: profile({ dietStyle: "halal" }) });
    // "sausage" is ambiguous -> warn; but "beef" is fine for halal, so no error expected.
    expect(r.issues.some((i) => i.code === "halal_ambiguous_food" && i.severity === "warn")).toBe(true);
  });
});

describe("validateTjaiPlanSemantics — unsafe content & macros", () => {
  it("errors on PED/SARM content", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Chicken"], { prepNote: "Run an ostarine cycle for gains" }), profile: profile() });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "unsafe_drug_content")).toBe(true);
  });

  it("errors on HTML/script content", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["<script>alert(1)</script>"]), profile: profile() });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "html_script_content")).toBe(true);
  });

  it("errors on negative meal macros", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Chicken"], { protein: -10 }), profile: profile() });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "invalid_meal_macro")).toBe(true);
  });

  it("passes a clean compliant plan", () => {
    const r = validateTjaiPlanSemantics({ plan: planWithFoods(["Grilled chicken", "Brown rice", "Broccoli"]), profile: profile() });
    expect(r.ok).toBe(true);
    expect(r.issues).toHaveLength(0);
  });
});

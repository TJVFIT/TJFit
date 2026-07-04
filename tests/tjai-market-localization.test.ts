import { describe, expect, it } from "vitest";

import { buildTjaiUserProfile, normalizeQuizAnswers } from "@/lib/tjai-intake";
import { buildTJAIUserPrompt } from "@/lib/tjai-prompts";
import { calculateTJAIMetrics, detectReverseDietNeeded } from "@/lib/tjai-science";
import {
  MARKET_DATA,
  TJAI_COUNTRY_OPTIONS,
  buildShoppingContext,
  getMarketQuizOptions,
  normalizeCountry,
  normalizeMarket
} from "@/lib/tjai/market-data";

const baseAnswers: Record<string, unknown> = {
  s1_gender: "male",
  s1_age: 30,
  s1_weight: 90,
  s1_height: 180,
  s2_goal: "fat_loss",
  s2_pace: "moderate",
  s3_body_silhouette: "overweight",
  s4_daily_activity: "moderate",
  s5_trains: "beginner",
  s5_type: "gym",
  s5_days: 4,
  s5_duration: 45,
  s8_hours: 7,
  s9_stress: "moderate",
  s11_meals: 4,
  s12_diet_style: "balanced",
  s13_allergies: ["none"],
  s14_budget: "moderate",
  s14_time: "simple",
  s19_daily_routine: "Desk job, trains in the evening."
};

describe("market dataset integrity", () => {
  it("every country has markets, staples, a budget tip, and an escape hatch", () => {
    for (const [slug, data] of Object.entries(MARKET_DATA)) {
      expect(data.label.length, slug).toBeGreaterThan(0);
      expect(data.markets.length, slug).toBeGreaterThanOrEqual(3);
      expect(data.staples.length, slug).toBeGreaterThan(20);
      expect(data.budgetTip.length, slug).toBeGreaterThan(20);
      expect(data.markets.some((m) => m.value === "other_market"), `${slug} needs other_market`).toBe(true);
      const values = data.markets.map((m) => String(m.value));
      expect(new Set(values).size, `${slug} has duplicate market values`).toBe(values.length);
    }
  });

  it("country options cover the dataset and include a fallback", () => {
    expect(TJAI_COUNTRY_OPTIONS.length).toBe(Object.keys(MARKET_DATA).length);
    expect(TJAI_COUNTRY_OPTIONS.some((o) => o.value === "other")).toBe(true);
  });

  it("sanitizes adversarial country/market input to safe fallbacks", () => {
    expect(normalizeCountry("'; drop table users; --")).toBe("other");
    expect(normalizeCountry(42)).toBe("other");
    expect(normalizeCountry(undefined)).toBe("other");
    expect(normalizeMarket("turkey", "<script>alert(1)</script>")).toBe("other_market");
    // A real market from the WRONG country must not pass through.
    expect(normalizeMarket("turkey", "walmart")).toBe("other_market");
    expect(normalizeMarket("turkey", "bim")).toBe("bim");
    expect(normalizeMarket("us", "walmart")).toBe("walmart");
  });

  it("market options fall back to generic for unknown countries", () => {
    const generic = getMarketQuizOptions("atlantis");
    expect(generic.some((o) => o.value === "local_supermarket")).toBe(true);
  });

  it("shopping context grounds the prompt in store + staples", () => {
    const context = buildShoppingContext("turkey", "bim");
    expect(context).toContain("BİM");
    expect(context).toContain("Türkiye");
    expect(context).toContain("bulgur");
  });
});

describe("intake backward compatibility and normalization", () => {
  it("legacy answers without the new questions still build a valid profile", () => {
    const profile = buildTjaiUserProfile(baseAnswers);
    expect(profile.country).toBe("other");
    expect(profile.groceryMarket).toBe("other_market");
    expect(profile.jobType).toBe("desk");
    expect(profile.dailySteps).toBe("4k_8k");
    expect(profile.dietHistory).toBe("first_plan");
    expect(profile.sleepQuality).toBe("restless");
    expect(profile.drinkHabits).toEqual(["mostly_water"]);
    expect(profile.eatingOutFrequency).toBe("rarely");
    expect(profile.weekendConsistency).toBe("slightly_off");
  });

  it("normalizes the new answers into the profile", () => {
    const profile = buildTjaiUserProfile({
      ...baseAnswers,
      s20_country: "turkey",
      s20_market: "bim",
      s4_job_type: "physical",
      s4_daily_steps: "over_12k",
      s7_diet_history: "yo_yo",
      s8_sleep_quality: "poor",
      s10_drinks: ["sugary_drinks", "alcohol"],
      s11_eating_out: "several_weekly",
      s15_weekend_consistency: "derails"
    });
    expect(profile.country).toBe("turkey");
    expect(profile.groceryMarket).toBe("bim");
    expect(profile.jobType).toBe("physical");
    expect(profile.dailySteps).toBe("over_12k");
    expect(profile.dietHistory).toBe("yo_yo");
    expect(profile.sleepQuality).toBe("poor");
    expect(profile.drinkHabits).toEqual(["sugary_drinks", "alcohol"]);
    expect(profile.eatingOutFrequency).toBe("several_weekly");
    expect(profile.weekendConsistency).toBe("derails");
  });
});

describe("quiz answer normalization regressions", () => {
  it('keeps "none" selected on the required injuries step (quiz was impassable without it)', () => {
    // The quiz re-normalizes answers on every click; if "none" is stripped the
    // None button never stays pressed and Continue stays disabled.
    const normalized = normalizeQuizAnswers({ ...baseAnswers, s17_injuries: ["none"] });
    expect(normalized.s17_injuries).toEqual(["none"]);
    // But the built profile must still translate "none" to no injuries.
    const profile = buildTjaiUserProfile({ ...baseAnswers, s17_injuries: ["none"] });
    expect(profile.injuries).toEqual([]);
  });

  it('drops "none" from injuries when a real injury is also selected', () => {
    const normalized = normalizeQuizAnswers({ ...baseAnswers, s17_injuries: ["none", "knee"] });
    expect(normalized.s17_injuries).toEqual(["knee"]);
  });
});

describe("science integration", () => {
  it("physical job + high steps yields a higher TDEE than desk + low steps", () => {
    const sedentary = calculateTJAIMetrics({ ...baseAnswers, s4_job_type: "desk", s4_daily_steps: "under_4k" });
    const active = calculateTJAIMetrics({ ...baseAnswers, s4_job_type: "physical", s4_daily_steps: "over_12k" });
    expect(active.tdee).toBeGreaterThan(sedentary.tdee);
  });

  it("caps an aggressive cut at a moderate deficit for rebound-prone dieters", () => {
    const firstTimer = calculateTJAIMetrics({ ...baseAnswers, s2_pace: "aggressive", s7_diet_history: "first_plan" });
    const rebounder = calculateTJAIMetrics({ ...baseAnswers, s2_pace: "aggressive", s7_diet_history: "yo_yo" });
    expect(rebounder.calorieTarget).toBeGreaterThan(firstTimer.calorieTarget);
  });

  it("flags reverse diet for yo-yo dieters carrying body fat regardless of pace", () => {
    const profile = buildTjaiUserProfile({ ...baseAnswers, s2_pace: "slow", s7_diet_history: "yo_yo" });
    expect(detectReverseDietNeeded(profile)).toBe(true);
  });

  it("poor sleep quality reduces the calorie target like short sleep does", () => {
    const rested = calculateTJAIMetrics({ ...baseAnswers, s8_hours: 8, s8_sleep_quality: "restorative", s9_stress: "high" });
    const poorQuality = calculateTJAIMetrics({ ...baseAnswers, s8_hours: 8, s8_sleep_quality: "poor", s9_stress: "high" });
    expect(poorQuality.calorieTarget).toBeLessThan(rested.calorieTarget);
  });
});

describe("prompt integration", () => {
  it("plan-generation prompt carries the shopping context and lifestyle flags", () => {
    const answers = {
      ...baseAnswers,
      s20_country: "turkey",
      s20_market: "bim",
      s7_diet_history: "yo_yo",
      s10_drinks: ["sugary_drinks"],
      s15_weekend_consistency: "derails"
    };
    const profile = buildTjaiUserProfile(answers);
    const metrics = calculateTJAIMetrics(answers);
    const prompt = buildTJAIUserPrompt(profile, metrics);
    expect(prompt).toContain("SHOPPING & FOOD ENVIRONMENT");
    expect(prompt).toContain("BİM");
    expect(prompt).toContain("Rebound dieting history");
    expect(prompt).toContain("Liquid Calories");
    expect(prompt).toContain("Weekend Protocol");
  });
});

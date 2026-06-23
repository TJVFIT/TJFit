import { describe, it, expect } from "vitest";

import { calculateTJAIMetrics } from "@/lib/tjai-science";

/**
 * The calorie floor (1200 kcal female / 1500 male) is a hard safety guarantee.
 * The goal calc applies it, but several downstream multipliers (stress/sleep
 * ×0.95, slow/stress-dominant/hormonal metabolic ×0.92–0.95) run afterwards and
 * can stack. This pins that the floor is re-clamped last and can't be bypassed.
 */
const worstCase = (gender: "male" | "female") => ({
  s1_gender: gender,
  s1_age: 100,
  s1_height: 120,
  s1_weight: 30,
  s2_goal: "fat_loss",
  s2_pace: "aggressive",
  s4_daily_activity: "very_low",
  s8_hours: 4, // poor sleep → ×0.95
  s9_stress: "very_high", // high stress → ×0.95 + stress-dominant metabolic type
  s5_days: 0
});

describe("calculateTJAIMetrics — calorie safety floor", () => {
  it("keeps a female ≥ 1200 kcal even with every reducer stacked", () => {
    expect(calculateTJAIMetrics(worstCase("female")).calorieTarget).toBeGreaterThanOrEqual(1200);
  });

  it("keeps a male ≥ 1500 kcal even with every reducer stacked", () => {
    expect(calculateTJAIMetrics(worstCase("male")).calorieTarget).toBeGreaterThanOrEqual(1500);
  });

  it("does not inflate a normal fat-loss target (floor only binds at the extreme)", () => {
    const normal = calculateTJAIMetrics({
      s1_gender: "male", s1_age: 30, s1_height: 180, s1_weight: 85,
      s2_goal: "fat_loss", s2_pace: "moderate", s4_daily_activity: "moderate",
      s8_hours: 7, s9_stress: "low", s5_days: 4
    });
    expect(normal.calorieTarget).toBeGreaterThan(1800);
    expect(normal.calorieTarget).toBeLessThan(3200);
  });
});

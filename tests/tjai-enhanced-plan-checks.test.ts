import { describe, it, expect, afterEach } from "vitest";

import { runEnhancedPlanCoherenceChecks } from "@/lib/tjai/validation/enhanced-plan-checks";
import type { TJAIPlan, TJAIMetrics } from "@/lib/tjai-types";

/**
 * Hallucination guard: when TJAI_STRICT_PLAN_VALIDATION=true, the model's
 * plan-summary numbers must stay within tolerance of the server-computed
 * science (calorie 15% / protein 20%). Off by default; pinned both ways.
 */
const plan = (calorieTarget: number, protein: number) =>
  ({ summary: { calorieTarget, protein } } as unknown as TJAIPlan);
const metrics = (calorieTarget: number, protein: number) =>
  ({ calorieTarget, protein } as unknown as TJAIMetrics);

describe("runEnhancedPlanCoherenceChecks", () => {
  afterEach(() => {
    delete process.env.TJAI_STRICT_PLAN_VALIDATION;
  });

  it("is a no-op unless TJAI_STRICT_PLAN_VALIDATION=true", () => {
    // Gross drift, but the flag is off → passes.
    expect(runEnhancedPlanCoherenceChecks(plan(9000, 5), metrics(2000, 150)).ok).toBe(true);
  });

  it("passes a plan whose summary matches the science within tolerance", () => {
    process.env.TJAI_STRICT_PLAN_VALIDATION = "true";
    expect(runEnhancedPlanCoherenceChecks(plan(2050, 155), metrics(2000, 150)).ok).toBe(true);
  });

  it("flags gross calorie drift (>15%)", () => {
    process.env.TJAI_STRICT_PLAN_VALIDATION = "true";
    expect(runEnhancedPlanCoherenceChecks(plan(3000, 150), metrics(2000, 150)).ok).toBe(false);
  });

  it("flags gross protein drift (>20%)", () => {
    process.env.TJAI_STRICT_PLAN_VALIDATION = "true";
    expect(runEnhancedPlanCoherenceChecks(plan(2000, 250), metrics(2000, 150)).ok).toBe(false);
  });
});

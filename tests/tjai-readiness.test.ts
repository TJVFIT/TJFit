/**
 * TJAI readiness/risk profile (TJFITV.10X PR1).
 * Verifies deterministic risk classification, derived plan complexity/coaching mode,
 * confidence downgrade on risk, and the safety-driven prompt block.
 */

import { describe, it, expect } from "vitest";

import { buildReadinessProfile, formatReadinessForPrompt } from "@/lib/tjai/readiness";
import type { TjaiUserProfile } from "@/lib/tjai-types";

function baseProfile(overrides: Partial<TjaiUserProfile> = {}): TjaiUserProfile {
  return {
    sex: "male",
    age: 30,
    heightCm: 178,
    weightKg: 80,
    targetWeightKg: 75,
    goal: "fat_loss",
    goalDetail: "sustainable_cut",
    pace: "moderate",
    bodyType: "average",
    estimatedBodyFat: 22,
    injuries: [],
    injuryNotes: null,
    activityLevel: "moderate",
    sleepHours: 8,
    stressLevel: "low",
    scheduleConstraint: "none",
    scheduleNotes: null,
    experienceLevel: "intermediate",
    trainingLocation: "gym",
    equipment: ["barbell_rack", "dumbbells"],
    trainingDays: 4,
    sessionMinutes: 45,
    trainingPreference: "hypertrophy",
    dietStyle: "balanced",
    dietaryRestrictions: ["none"],
    restrictionNotes: null,
    likedFoods: ["chicken", "rice", "eggs"],
    avoidedFoods: ["nothing_specific"],
    monthlyFoodBudget: "moderate",
    cookingStyle: "simple",
    mealsPerDay: 4,
    supplements: ["none"],
    biggestObstacles: [],
    successVision: "look_different",
    dailyRoutine: "",
    ...overrides
  };
}

describe("buildReadinessProfile", () => {
  it("returns low risk and high confidence for a balanced intermediate profile", () => {
    const r = buildReadinessProfile(baseProfile());
    expect(r.recoveryRisk).toBe("low");
    expect(r.adherenceRisk).toBe("low");
    expect(r.injuryRisk).toBe("low");
    expect(r.confidence).toBe("high");
    expect(r.coachingMode).toBe("execute");
    expect(r.flags).toHaveLength(0);
  });

  it("flags high recovery risk for low sleep + high stress", () => {
    const r = buildReadinessProfile(baseProfile({ sleepHours: 5, stressLevel: "very_high" }));
    expect(r.recoveryRisk).toBe("high");
    expect(r.flags.some((f) => f.code === "recovery_risk_high")).toBe(true);
  });

  it("flags high adherence risk + minimal complexity for a beginner training 6 days", () => {
    const r = buildReadinessProfile(
      baseProfile({ experienceLevel: "beginner", trainingDays: 6 })
    );
    expect(r.adherenceRisk).toBe("high");
    expect(r.planComplexity).toBe("minimal");
    expect(r.coachingMode).toBe("repair");
  });

  it("uses teach mode for a beginner without adherence risk", () => {
    const r = buildReadinessProfile(baseProfile({ experienceLevel: "beginner", trainingDays: 3 }));
    expect(r.coachingMode).toBe("teach");
    expect(r.planComplexity).toBe("minimal");
  });

  it("blocks on serious injury history and downgrades confidence", () => {
    const r = buildReadinessProfile(baseProfile({ injuries: ["recent_surgery"] }));
    expect(r.injuryRisk).toBe("high");
    const injuryFlag = r.flags.find((f) => f.code === "injury_risk_high");
    expect(injuryFlag?.severity).toBe("block");
    expect(r.confidence).toBe("low");
  });

  it("treats a loaded-pattern conflict (knee + hypertrophy) as high injury risk", () => {
    const r = buildReadinessProfile(baseProfile({ injuries: ["knee"], trainingPreference: "hypertrophy" }));
    expect(r.injuryRisk).toBe("high");
  });

  it("detects sharp-pain language in injury notes", () => {
    const r = buildReadinessProfile(baseProfile({ injuries: ["hip"], injuryNotes: "sharp shooting pain when squatting" }));
    expect(r.injuryRisk).toBe("high");
  });

  it("marks vegan muscle-gain without legumes as low nutrition feasibility", () => {
    const r = buildReadinessProfile(
      baseProfile({ dietStyle: "vegan", goal: "muscle_gain", likedFoods: ["rice", "oats"] })
    );
    expect(r.nutritionFeasibility).toBe("low");
    expect(r.flags.some((f) => f.code === "nutrition_feasibility_low")).toBe(true);
  });

  it("marks schedule infeasible when weekly minutes exceed the constraint ceiling", () => {
    const r = buildReadinessProfile(
      baseProfile({ scheduleConstraint: "short_sessions", trainingDays: 6, sessionMinutes: 60 })
    );
    expect(r.scheduleFeasibility).toBe("low");
  });

  it("includes block-severity instructions in the prompt block", () => {
    const r = buildReadinessProfile(baseProfile({ injuries: ["recent_surgery"] }));
    const block = formatReadinessForPrompt(r);
    expect(block).toContain("READINESS & RISK PROFILE");
    expect(block).toContain("[block] injury_risk_high");
    expect(block).toContain("smallest effective intervention");
  });
});

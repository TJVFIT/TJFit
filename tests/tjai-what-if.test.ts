/**
 * WHAT-IF projection models (Progress tab sliders).
 * Verifies deterministic energy-balance math, the 1% bodyweight/week safety
 * clamp, protein ranges inside the 1.6-2.2 g/kg evidence window, and
 * training-volume tier boundaries.
 */

import { describe, it, expect } from "vitest";

import {
  KCAL_PER_KG,
  MAX_SAFE_WEEKLY_LOSS_PCT,
  projectWeightChange,
  proteinTarget,
  trainingVolumeTier
} from "@/lib/tjai/what-if";

describe("projectWeightChange", () => {
  it("holds weight steady at zero deficit", () => {
    const p = projectWeightChange({ currentKg: 80, dailyDeficitKcal: 0, weeks: 12 });
    expect(p.projectedKg).toBe(80);
    expect(p.totalChangeKg).toBe(0);
    expect(p.weeklyChangeKg).toBe(0);
    expect(p.tier).toBe("maintenance");
    expect(p.rateClamped).toBe(false);
  });

  it("projects a standard cut from the 7700 kcal/kg model", () => {
    const p = projectWeightChange({ currentKg: 80, dailyDeficitKcal: 500, weeks: 12 });
    expect(p.weeklyChangeKg).toBeCloseTo(-(500 * 7) / KCAL_PER_KG, 2);
    expect(p.rateClamped).toBe(false);
    expect(p.tier).toBe("standard");
    expect(p.projectedKg).toBeCloseTo(80 - ((500 * 7) / KCAL_PER_KG) * 12, 1);
  });

  it("clamps an extreme deficit at 1% bodyweight per week", () => {
    const p = projectWeightChange({ currentKg: 70, dailyDeficitKcal: 2000, weeks: 8 });
    expect(p.safeWeeklyChangeKg).toBeCloseTo(-70 * MAX_SAFE_WEEKLY_LOSS_PCT, 2);
    expect(p.rateClamped).toBe(true);
    expect(p.tier).toBe("aggressive");
    expect(p.projectedKg).toBeCloseTo(70 - 0.7 * 8, 1);
  });

  it("classifies a small deficit as gradual", () => {
    const p = projectWeightChange({ currentKg: 80, dailyDeficitKcal: 300, weeks: 12 });
    expect(p.tier).toBe("gradual");
    expect(p.rateClamped).toBe(false);
  });

  it("projects gain for a surplus and never clamps it", () => {
    const p = projectWeightChange({ currentKg: 80, dailyDeficitKcal: -300, weeks: 12 });
    expect(p.totalChangeKg).toBeGreaterThan(0);
    expect(p.projectedKg).toBeGreaterThan(80);
    expect(p.tier).toBe("surplus");
    expect(p.rateClamped).toBe(false);
  });

  it("keeps total loss monotonically non-decreasing over longer horizons", () => {
    const totals = [4, 8, 12, 24].map((weeks) =>
      Math.abs(projectWeightChange({ currentKg: 90, dailyDeficitKcal: 600, weeks }).totalChangeKg)
    );
    for (let i = 1; i < totals.length; i++) expect(totals[i]).toBeGreaterThanOrEqual(totals[i - 1]);
  });

  it("bounds always straddle the projection", () => {
    const p = projectWeightChange({ currentKg: 80, dailyDeficitKcal: 500, weeks: 12 });
    expect(p.lowerBoundKg).toBeLessThanOrEqual(p.projectedKg);
    expect(p.upperBoundKg).toBeGreaterThanOrEqual(p.projectedKg);
  });

  it("never projects below zero even on absurd inputs", () => {
    const p = projectWeightChange({ currentKg: 40, dailyDeficitKcal: 2000, weeks: 200 });
    expect(p.projectedKg).toBeGreaterThanOrEqual(0);
    expect(p.lowerBoundKg).toBeGreaterThanOrEqual(0);
  });
});

describe("proteinTarget", () => {
  it("stays inside the 1.6-2.2 g/kg evidence range for every goal", () => {
    const goals = ["fat_loss", "muscle_gain", "recomposition", "fitness", "stay_active"] as const;
    for (const goal of goals) {
      const p = proteinTarget({ weightKg: 80, goal });
      expect(p.perKgMin).toBeGreaterThanOrEqual(1.6);
      expect(p.perKgMax).toBeLessThanOrEqual(2.2);
      expect(p.minGrams).toBeLessThanOrEqual(p.maxGrams);
    }
  });

  it("pushes fat loss to the top of the range to protect lean mass", () => {
    const p = proteinTarget({ weightKg: 80, goal: "fat_loss" });
    expect(p.tier).toBe("preserve");
    expect(p.minGrams).toBe(160);
    expect(p.maxGrams).toBe(176);
  });

  it("maps muscle gain to build and general goals to maintain", () => {
    expect(proteinTarget({ weightKg: 70, goal: "muscle_gain" }).tier).toBe("build");
    expect(proteinTarget({ weightKg: 70, goal: "fitness" }).tier).toBe("maintain");
    expect(proteinTarget({ weightKg: 70, goal: "stay_active" }).tier).toBe("maintain");
  });

  it("scales grams linearly with bodyweight", () => {
    const light = proteinTarget({ weightKg: 60, goal: "fat_loss" });
    const heavy = proteinTarget({ weightKg: 120, goal: "fat_loss" });
    expect(heavy.minGrams).toBe(light.minGrams * 2);
  });
});

describe("trainingVolumeTier", () => {
  it("flags volume under the 150-minute guideline as minimal", () => {
    expect(trainingVolumeTier({ sessionsPerWeek: 2, minutesPerSession: 45 }).tier).toBe("minimal");
  });

  it("meets the guideline exactly at 150 minutes", () => {
    const v = trainingVolumeTier({ sessionsPerWeek: 3, minutesPerSession: 50 });
    expect(v.weeklyMinutes).toBe(150);
    expect(v.tier).toBe("foundation");
  });

  it("classifies 300-480 minutes as solid", () => {
    expect(trainingVolumeTier({ sessionsPerWeek: 5, minutesPerSession: 60 }).tier).toBe("solid");
    expect(trainingVolumeTier({ sessionsPerWeek: 8, minutesPerSession: 60 }).tier).toBe("solid");
  });

  it("flags recovery-limited volume past 480 minutes", () => {
    expect(trainingVolumeTier({ sessionsPerWeek: 7, minutesPerSession: 75 }).tier).toBe("high");
  });

  it("treats zero sessions as minimal", () => {
    const v = trainingVolumeTier({ sessionsPerWeek: 0, minutesPerSession: 60 });
    expect(v.weeklyMinutes).toBe(0);
    expect(v.tier).toBe("minimal");
  });
});

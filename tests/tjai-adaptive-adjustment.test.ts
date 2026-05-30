/**
 * Closed adaptive loop (TJFITV.10X PR9).
 * computeAdaptiveAdjustment is pure and safety-capped: calorie moves are bounded
 * (±200 kcal/wk) and never breach the floor; goal/energy/adherence drive the branch.
 */

import { describe, it, expect } from "vitest";

import { computeAdaptiveAdjustment, formatAdjustmentForPrompt } from "@/lib/tjai/adaptive-adjustment";
import type { AdaptiveCheckIn } from "@/lib/tjai/adaptive-adjustment";

const ci = (energy: number, adherence: number): AdaptiveCheckIn => ({ energy, adherence });

describe("computeAdaptiveAdjustment", () => {
  it("holds with zero confidence when there are no check-ins", () => {
    const adj = computeAdaptiveAdjustment({ checkIns: [] });
    expect(adj.calorieDelta).toBe(0);
    expect(adj.intensityAction).toBe("hold");
    expect(adj.confidence).toBe(0);
  });

  it("cuts calories and pushes intensity on a strong cut week", () => {
    const adj = computeAdaptiveAdjustment({
      checkIns: [ci(5, 5), ci(4, 4), ci(5, 4)],
      currentCalories: 2200,
      goal: "fat_loss"
    });
    expect(adj.calorieDelta).toBe(-150);
    expect(adj.intensityAction).toBe("increase");
    expect(adj.confidence).toBe(1);
  });

  it("adds a surplus and pushes intensity on a strong bulk week", () => {
    const adj = computeAdaptiveAdjustment({
      checkIns: [ci(5, 5), ci(4, 4)],
      currentCalories: 2800,
      goal: "muscle_gain"
    });
    expect(adj.calorieDelta).toBe(150);
    expect(adj.intensityAction).toBe("increase");
  });

  it("deloads and refeeds when low energy meets high adherence (overreaching)", () => {
    const adj = computeAdaptiveAdjustment({
      checkIns: [ci(1, 5), ci(2, 4)],
      currentCalories: 2000,
      goal: "fat_loss"
    });
    expect(adj.intensityAction).toBe("deload");
    expect(adj.refeedRecommended).toBe(true);
    expect(adj.calorieDelta).toBe(150);
  });

  it("holds and rebuilds consistency when adherence is low", () => {
    const adj = computeAdaptiveAdjustment({
      checkIns: [ci(3, 1), ci(3, 2)],
      currentCalories: 2000,
      goal: "fat_loss"
    });
    expect(adj.calorieDelta).toBe(0);
    expect(adj.intensityAction).toBe("hold");
  });

  it("never cuts below the calorie floor", () => {
    const adj = computeAdaptiveAdjustment({
      checkIns: [ci(5, 5), ci(5, 5)],
      currentCalories: 1600,
      calorieFloorKcal: 1500,
      goal: "fat_loss"
    });
    // Only 100 kcal of headroom above the floor, so a -150 cut clamps to -100.
    expect(adj.calorieDelta).toBe(-100);
  });

  it("hard-caps the calorie delta at the weekly step", () => {
    const adj = computeAdaptiveAdjustment({
      checkIns: [ci(5, 5), ci(5, 5), ci(5, 5)],
      currentCalories: 5000,
      goal: "muscle_gain"
    });
    expect(adj.calorieDelta).toBeLessThanOrEqual(200);
  });
});

describe("formatAdjustmentForPrompt", () => {
  it("renders a compact, signed prompt block", () => {
    const block = formatAdjustmentForPrompt(
      computeAdaptiveAdjustment({ checkIns: [ci(5, 5), ci(4, 4)], currentCalories: 2200, goal: "fat_loss" })
    );
    expect(block).toMatch(/ADAPTIVE ADJUSTMENT/);
    expect(block).toMatch(/-150 kcal\/day/);
    expect(block).toMatch(/Training: increase/);
  });
});

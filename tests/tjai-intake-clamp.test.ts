import { describe, it, expect } from "vitest";

import { buildTjaiUserProfile } from "@/lib/tjai-intake";

/**
 * Guards the BMR/TDEE safety boundary: a malformed or adversarial quiz
 * submission must never push absurd values into the metabolic math.
 * Bounds: age 13–100, height 120–250 cm, weight 30–300 kg.
 */
describe("buildTjaiUserProfile — input clamping", () => {
  it("clamps absurdly high age/height/weight to the plausible maxima", () => {
    const p = buildTjaiUserProfile({ s1_age: 999, s1_height: 900, s1_weight: 5000 });
    expect(p.age).toBeLessThanOrEqual(100);
    expect(p.heightCm).toBeLessThanOrEqual(250);
    expect(p.weightKg).toBeLessThanOrEqual(300);
  });

  it("clamps absurdly low values up to the plausible minima", () => {
    const p = buildTjaiUserProfile({ s1_age: 1, s1_height: 10, s1_weight: 2 });
    expect(p.age).toBeGreaterThanOrEqual(13);
    expect(p.heightCm).toBeGreaterThanOrEqual(120);
    expect(p.weightKg).toBeGreaterThanOrEqual(30);
  });

  it("preserves valid in-range values unchanged", () => {
    const p = buildTjaiUserProfile({ s1_age: 30, s1_height: 180, s1_weight: 80 });
    expect(p.age).toBe(30);
    expect(p.heightCm).toBe(180);
    expect(p.weightKg).toBe(80);
  });

  it("falls back to in-range defaults for missing values", () => {
    const p = buildTjaiUserProfile({});
    expect(p.age).toBeGreaterThanOrEqual(13);
    expect(p.age).toBeLessThanOrEqual(100);
    expect(p.heightCm).toBeGreaterThanOrEqual(120);
    expect(p.weightKg).toBeGreaterThanOrEqual(30);
  });
});

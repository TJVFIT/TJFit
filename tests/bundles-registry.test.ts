import { describe, it, expect } from "vitest";

import {
  BUNDLES,
  getBundle,
  listBundleSlugs,
  type BundleGoal
} from "@/lib/bundles";

const VALID_GOALS: ReadonlyArray<BundleGoal> = [
  "fat-loss",
  "muscle-gain",
  "recomp",
  "strength",
  "conditioning",
  "foundation"
];

describe("bundles registry invariants", () => {
  it("ships exactly 12 bundles", () => {
    expect(BUNDLES).toHaveLength(12);
  });

  it("every slug is unique", () => {
    const slugs = BUNDLES.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every slug is a kebab-case identifier", () => {
    for (const b of BUNDLES) {
      expect(b.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("every goal is one of the BundleGoal union members", () => {
    for (const b of BUNDLES) {
      expect(VALID_GOALS).toContain(b.goal);
    }
  });

  it("week and session counts are sane", () => {
    for (const b of BUNDLES) {
      expect(b.weeks).toBeGreaterThan(0);
      expect(b.weeks).toBeLessThanOrEqual(52);
      expect(b.sessionsPerWeek).toBeGreaterThan(0);
      expect(b.sessionsPerWeek).toBeLessThanOrEqual(7);
    }
  });

  it("every bundle has at least 1 phase + 1 exercise + 1 meal", () => {
    for (const b of BUNDLES) {
      expect(b.phases.length).toBeGreaterThan(0);
      expect(b.sampleTrainingDay.exercises.length).toBeGreaterThan(0);
      expect(b.sampleMealDay.length).toBeGreaterThan(0);
    }
  });

  it("phase names are unique within a bundle", () => {
    for (const b of BUNDLES) {
      const names = b.phases.map((p) => p.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it("heroImage references the slug under /bundles/", () => {
    for (const b of BUNDLES) {
      expect(b.heroImage).toBe(`/bundles/${b.slug}.svg`);
    }
  });

  it("`save` chip matches `isFree` (Free iff isFree=true)", () => {
    for (const b of BUNDLES) {
      const looksFree = b.save.toLowerCase() === "free";
      expect(looksFree).toBe(b.isFree);
    }
  });

  it("required string fields are non-empty + trimmed", () => {
    for (const b of BUNDLES) {
      for (const field of [
        "name",
        "hook",
        "goalLabel",
        "programTitle",
        "dietTitle",
        "description"
      ] as const) {
        const value = b[field];
        expect(value.length).toBeGreaterThan(0);
        expect(value).toBe(value.trim());
      }
    }
  });

  it("nutrition block is fully populated", () => {
    for (const b of BUNDLES) {
      expect(b.nutrition.style.length).toBeGreaterThan(0);
      expect(b.nutrition.proteinTarget.length).toBeGreaterThan(0);
      expect(b.nutrition.calorieBias.length).toBeGreaterThan(0);
      expect(b.nutrition.notes.length).toBeGreaterThan(0);
    }
  });
});

describe("bundles registry lookups", () => {
  it("listBundleSlugs() matches BUNDLES order and length", () => {
    const expected = BUNDLES.map((b) => b.slug);
    expect(listBundleSlugs()).toEqual(expected);
  });

  it("getBundle(slug) round-trips for every bundle", () => {
    // getBundle enriches the base entry with its content layer ({ ...b, ...content }),
    // so it returns a new object rather than the registry instance. The lookup
    // contract is that it resolves to the bundle with the same slug.
    for (const b of BUNDLES) {
      expect(getBundle(b.slug)?.slug).toBe(b.slug);
    }
  });

  it("getBundle(unknown) returns undefined", () => {
    expect(getBundle("does-not-exist")).toBeUndefined();
  });
});

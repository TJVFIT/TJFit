/**
 * Exercise catalogue + name resolution.
 *
 * The catalogue is generated from free-exercise-db pinned to a commit. These
 * tests pin two things: that a regeneration did not silently truncate or
 * reshape the data, and — more importantly — the resolver's MEASURED hit rate
 * against TJFit's own library, so the 50% limitation stays visible instead of
 * being rediscovered by whoever wires it into validation.
 */

import { describe, it, expect } from "vitest";

import { EXERCISE_CATALOG } from "@/lib/programs/exercises/catalog.generated";
import {
  CATALOG_SIZE,
  auditExerciseNames,
  isKnownExercise,
  normalizeExerciseName,
  resolveExercise
} from "@/lib/programs/exercises/resolve";
import { exercises as libraryExercises } from "@/lib/programs/exercises/library";

describe("catalogue integrity", () => {
  it("has the full pinned dataset", () => {
    expect(CATALOG_SIZE).toBe(873);
    expect(EXERCISE_CATALOG).toHaveLength(873);
  });

  it("has no duplicate names", () => {
    expect(new Set(EXERCISE_CATALOG.map((e) => e.n)).size).toBe(873);
  });

  it("keeps every record shaped — a broken generator must fail here, not at runtime", () => {
    for (const ex of EXERCISE_CATALOG) {
      expect(typeof ex.n).toBe("string");
      expect(ex.n.length).toBeGreaterThan(0);
      expect(Array.isArray(ex.m)).toBe(true);
      expect(["beginner", "intermediate", "expert"]).toContain(ex.l);
      // equipment is legitimately null for 77 bodyweight-ish entries
      expect(ex.e === null || typeof ex.e === "string").toBe(true);
    }
  });

  it("covers all 17 muscle groups as a primary mover", () => {
    const seen = new Set(EXERCISE_CATALOG.flatMap((e) => e.m));
    expect(seen.size).toBe(17);
    expect(seen).toContain("quadriceps");
    expect(seen).toContain("abductors");
  });
});

describe("name normalisation", () => {
  it("folds case, punctuation and plurals to one key", () => {
    const a = normalizeExerciseName("Barbell Curls");
    expect(normalizeExerciseName("barbell curl")).toBe(a);
    expect(normalizeExerciseName("  BARBELL   CURL!! ")).toBe(a);
  });

  it("drops filler words that carry no identity", () => {
    expect(normalizeExerciseName("Squat with the Barbell")).toBe(normalizeExerciseName("Squat Barbell"));
  });

  it("does not depluralise short words or double-s endings", () => {
    // "press" must not become "pres"
    expect(normalizeExerciseName("Press")).toBe("press");
  });
});

describe("resolution", () => {
  it("resolves an exact catalogue name", () => {
    const first = EXERCISE_CATALOG[0]!;
    expect(resolveExercise(first.n)?.n).toBe(first.n);
  });

  it("absorbs compound-word splits — Pull-Up finds Pullups", () => {
    expect(isKnownExercise("Pull-Up")).toBe(true);
    expect(isKnownExercise("Push-Up")).toBe(true);
  });

  it("returns null rather than guessing at an unknown movement", () => {
    expect(resolveExercise("Quantum Deadlift of Doom")).toBeNull();
    expect(resolveExercise("")).toBeNull();
  });

  it("does NOT collapse a real word difference into a false match", () => {
    // The guard that keeps this a lookup rather than a fuzzy matcher: an extra
    // meaningful word must produce a miss, not silently map onto a neighbour.
    const backSquat = resolveExercise("Barbell Back Squat");
    const squat = resolveExercise("Barbell Squat");
    expect(squat).not.toBeNull();
    expect(backSquat).toBeNull();
  });
});

describe("measured hit rate against TJFit's own library", () => {
  const libraryNames = Object.values(libraryExercises).map((e) => {
    const n = (e as { name: unknown }).name;
    return typeof n === "string" ? n : ((n as { en?: string })?.en ?? "");
  });

  it("has 18 hand-authored library exercises", () => {
    expect(libraryNames).toHaveLength(18);
  });

  it("matches only about half of them — this is the documented limitation", () => {
    const audit = auditExerciseNames(libraryNames);
    // Pinned deliberately. If a future alias table raises this, the test should
    // fail and be updated UP — that is the signal the gap has been closed. It
    // must never silently drop.
    expect(audit.known.length).toBe(9);
    expect(audit.knownRatio).toBeCloseTo(0.5, 2);
  });

  it("names the specific misses, so the naming gap is legible", () => {
    const audit = auditExerciseNames(libraryNames);
    expect(audit.unknown).toContain("Barbell Back Squat");
    expect(audit.unknown).toContain("Lat Pulldown");
  });

  it("scores an empty plan as fully known rather than dividing by zero", () => {
    expect(auditExerciseNames([]).knownRatio).toBe(1);
  });
});

/**
 * Contextual quick-reply selection + chip copy coverage.
 *
 * The picker is the server half (route sends keys on the `done` SSE event);
 * the copy map is the client half (keys -> localized chip text). A key without
 * text in some locale silently renders nothing there — so coverage is pinned
 * across all five locales.
 */

import { describe, it, expect } from "vitest";

import { pickCoachSuggestionKeys, type CoachSuggestionKey } from "@/lib/tjai/chat-suggestions";
import { getTJAIChatCopy } from "@/lib/tjai-chat-copy";

const NOW = new Date("2026-08-09T12:00:00Z");

function base(overrides: Partial<Parameters<typeof pickCoachSuggestionKeys>[0]> = {}) {
  return pickCoachSuggestionKeys({
    hasPlan: true,
    goal: "fat_loss",
    workoutDates: ["2026-08-08"],
    entries: [],
    now: NOW,
    ...overrides
  });
}

describe("pickCoachSuggestionKeys", () => {
  it("no plan short-circuits to generate_plan alone", () => {
    expect(base({ hasPlan: false, goal: null, workoutDates: [] })).toEqual(["generate_plan"]);
  });

  it("stale training (>7 days) suggests a restart", () => {
    expect(base({ workoutDates: ["2026-07-25"] })).toEqual(["restart_training"]);
  });

  it("no workouts at all counts as stale, not as an error", () => {
    expect(base({ workoutDates: [] })).toEqual(["restart_training"]);
  });

  it("weight trend opposing a fat-loss goal suggests a diagnosis", () => {
    expect(
      base({ entries: [{ weight_kg: 91 }, { weight_kg: 89 }] }) // +2kg while cutting
    ).toEqual(["diagnose_progress"]);
  });

  it("weight trend opposing a muscle-gain goal also triggers it", () => {
    expect(
      base({ goal: "muscle_gain", entries: [{ weight_kg: 78 }, { weight_kg: 80 }] }) // -2kg while bulking
    ).toEqual(["diagnose_progress"]);
  });

  it("a single entry or sub-noise change never triggers a diagnosis", () => {
    expect(base({ entries: [{ weight_kg: 91 }] })).toEqual(["plan_checkin"]);
    expect(base({ entries: [{ weight_kg: 89.3 }, { weight_kg: 89 }] })).toEqual(["plan_checkin"]);
  });

  it("stale training + bad trend stack, capped at two", () => {
    const keys = base({
      workoutDates: ["2026-07-20"],
      entries: [{ weight_kg: 92 }, { weight_kg: 89 }]
    });
    expect(keys).toEqual(["restart_training", "diagnose_progress"]);
    expect(keys.length).toBeLessThanOrEqual(2);
  });

  it("engaged user with nothing urgent gets the check-in default", () => {
    expect(base()).toEqual(["plan_checkin"]);
  });

  it("garbage workout dates count as stale rather than throwing", () => {
    expect(base({ workoutDates: ["not-a-date", null] })).toEqual(["restart_training"]);
  });
});

describe("chip copy coverage", () => {
  const KEYS: CoachSuggestionKey[] = [
    "generate_plan",
    "restart_training",
    "diagnose_progress",
    "plan_checkin"
  ];
  const LOCALES = ["en", "tr", "ar", "es", "fr"] as const;

  it.each(LOCALES)("every suggestion key has non-empty chip text in %s", (locale) => {
    const copy = getTJAIChatCopy(locale);
    for (const key of KEYS) {
      expect(copy.contextual[key], `${locale}:${key}`).toBeTruthy();
      expect(copy.contextual[key].trim().length).toBeGreaterThan(10);
    }
  });

  it("Turkish chip text carries proper diacritics, not ASCII-folded forms", () => {
    const tr = getTJAIChatCopy("tr");
    const all = Object.values(tr.contextual).join(" ");
    expect(all).toMatch(/[ğşçöüİı]/);
    expect(all).not.toMatch(/\b(hedefime gore|antrenman yapmadim|soyle)\b/i);
  });
});

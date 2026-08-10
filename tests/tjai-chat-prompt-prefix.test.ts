/**
 * Chat system prompt: static-prefix layout for provider prefix caching.
 *
 * OpenAI and the open-gateway servers (vLLM/SGLang) automatically cache an
 * identical leading prefix across requests. That only pays if the prompt's
 * static bulk (rules, tiers, medical addendum, output contract) comes BEFORE
 * anything per-user. These tests pin that layout: two users with completely
 * different data must share a long byte-identical prefix containing every
 * static block, and all per-user/per-message content must sit after it.
 *
 * If a future edit interleaves user data back into the static region, the
 * shared-prefix assertion fails — that is the regression this file exists for.
 */

import { describe, it, expect } from "vitest";

import { buildChatCoachSystemPrompt } from "@/lib/tjai/context/chat-coach-context";
import type { TjaiMemorySnapshot } from "@/lib/tjai-types";

const emptySnapshot = {
  latestPlanSummary: null,
  priorPlanGoal: null,
  adaptiveCheckpoint: null
} as unknown as TjaiMemorySnapshot;

function promptForUserA(): string {
  return buildChatCoachSystemPrompt({
    planRow: {
      goal: "fat_loss",
      daily_calories: 2100,
      protein_g: 170,
      training_days_per_week: 4,
      training_location: "gym",
      plan_json: {},
      answers_json: null,
      version_number: 1
    } as never,
    memorySnapshot: emptySnapshot,
    preferences: [{ preference_key: "tone", preference_value: "short" } as never],
    workouts: [
      { workout_date: "2026-08-01", exercise: "Bench Press", sets: 3, reps: 8, weight_kg: 80 } as never
    ],
    entries: [{ entry_date: "2026-08-01", weight_kg: 88 } as never],
    coachIntent: "program_training",
    locale: "en",
    persona: "mentor",
    longMemoryBlock: "\nLONG MEMORY:\n- prefers morning sessions",
    coachStateBlock: "COACH STATE: cutting, adherent",
    earlierConversationDigest: "user: asked about squats"
  });
}

function promptForUserB(): string {
  return buildChatCoachSystemPrompt({
    planRow: null, // no plan at all
    memorySnapshot: {
      latestPlanSummary: "12w recomp",
      priorPlanGoal: "muscle_gain",
      adaptiveCheckpoint: { urgency: "high", triggerRegen: true }
    } as unknown as TjaiMemorySnapshot,
    preferences: [],
    workouts: [],
    entries: [],
    coachIntent: "diet_nutrition",
    locale: "en",
    persona: "mentor",
    longMemoryBlock: ""
  });
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

describe("chat prompt static prefix", () => {
  const a = promptForUserA();
  const b = promptForUserB();
  const shared = commonPrefixLength(a, b);
  const sharedPrefix = a.slice(0, shared);

  it("two different users share a long byte-identical prefix", () => {
    // The static region is several KB; a regression that interleaves user data
    // collapses this to a few hundred bytes.
    expect(shared).toBeGreaterThan(3000);
  });

  it("every static block lives inside the shared prefix", () => {
    expect(sharedPrefix).toContain("COACHING RULES:");
    expect(sharedPrefix).toContain("TJAI MEMBERSHIP TIERS");
    expect(sharedPrefix).toContain("OUTPUT FORMAT CONTRACT");
    expect(sharedPrefix).toContain("PERSONA: Mentor");
    // Medical addendum — match on a stable fragment of its header.
    expect(sharedPrefix.toUpperCase()).toContain("MEDICAL");
  });

  it("per-user content sits after the static prefix, never inside it", () => {
    expect(sharedPrefix).not.toContain("USER'S TJAI PLAN:");
    expect(sharedPrefix).not.toContain("LIVE USER DATA");
    expect(sharedPrefix).not.toContain("USER PREFERENCES:");
    expect(sharedPrefix).not.toContain("Bench Press");
  });

  it("per-message intent focus is the final block", () => {
    // Intent differs per message, so it must trail everything cacheable.
    const intentIdx = a.indexOf("FOCUS MODE — TRAINING");
    expect(intentIdx).toBeGreaterThan(-1);
    expect(intentIdx).toBeGreaterThan(a.indexOf("USER PREFERENCES:"));
    expect(intentIdx).toBeGreaterThan(a.indexOf("LIVE USER DATA"));
  });

  it("still carries every dynamic section for a fully-populated user", () => {
    // The reorder must not drop content. User A exercises every input.
    for (const marker of [
      "USER'S TJAI PLAN:",
      "COACH STATE: cutting, adherent",
      "LIVE USER DATA",
      "EARLIER IN THIS CONVERSATION",
      "USER PREFERENCES:",
      "TJAI MEMORY SNAPSHOT:",
      "LONG MEMORY:",
      "TJFIT PROGRAM BUNDLES YOU CAN RECOMMEND"
    ]) {
      expect(a).toContain(marker);
    }
  });

  it("a planless user still gets the no-plan marker and the bundle catalog", () => {
    expect(b).toContain("User has not generated a TJAI plan yet.");
    expect(b).toContain("TJFIT PROGRAM BUNDLES YOU CAN RECOMMEND");
  });

  it("different personas produce different prefixes (cache keys per persona, by design)", () => {
    const drill = buildChatCoachSystemPrompt({
      planRow: null,
      memorySnapshot: emptySnapshot,
      preferences: [],
      workouts: [],
      entries: [],
      locale: "en",
      persona: "drill"
    });
    expect(drill).toContain("PERSONA: Drill Sergeant");
    expect(drill).not.toContain("PERSONA: Mentor");
  });
});

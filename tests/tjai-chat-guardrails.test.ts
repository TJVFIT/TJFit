/**
 * Dry-run (no API): the chat coach system prompt must keep its behavioral
 * guardrails. These protect real money/safety/accuracy behavior, so a future
 * edit to the context builder can't silently drop one.
 */

import { describe, it, expect } from "vitest";

import { buildChatCoachSystemPrompt } from "@/lib/tjai/context/chat-coach-context";

const base = {
  planRow: null,
  memorySnapshot: {
    latestPlanSummary: null,
    priorPlanGoal: null,
    planVersion: null,
    preferences: [],
    workoutSummary: [],
    progressSummary: {
      latestWeightKg: null,
      changeKg: null,
      latestBodyFatPercent: null,
      latestWaistCm: null
    },
    adaptiveCheckpoint: null
  },
  preferences: [],
  workouts: [],
  entries: []
};

describe("chat coach system prompt — guardrail regression", () => {
  const prompt = buildChatCoachSystemPrompt({ ...base });

  it("keeps the billing/refund guardrail (no self-service payments; route to support)", () => {
    expect(prompt).toMatch(/CANNOT process payments/i);
    expect(prompt).toContain("/support");
    expect(prompt).toContain("/refund-policy");
  });

  it("keeps the pricing guardrail (never invent prices; route to the credits page)", () => {
    expect(prompt).toContain("/tjai/credits");
    expect(prompt).toMatch(/never invent a price/i);
  });

  it("grounds recommendations in the real bundle catalog, not phantom programs", () => {
    expect(prompt).toContain("/bundles/recomp");
    expect(prompt).toContain("never invent other prices");
  });

  it("keeps the medical-safety rule", () => {
    expect(prompt).toMatch(/safety disclaimer/i);
    expect(prompt).toMatch(/qualified professional/i);
  });

  it("keeps a fitness scope boundary (declines off-topic requests)", () => {
    expect(prompt).toMatch(/not a general-purpose assistant/i);
  });

  it("knows the membership tiers (Core/Pro/Apex) to guide upgrades without quoting prices", () => {
    expect(prompt).toContain("MEMBERSHIP TIERS");
    expect(prompt).toContain("Core");
    expect(prompt).toContain("Pro");
    expect(prompt).toContain("Apex");
  });

  it("forces the selected language when a non-default locale is provided", () => {
    const tr = buildChatCoachSystemPrompt({ ...base, locale: "tr" });
    expect(tr).toContain("CRITICAL LANGUAGE RULE");
  });
});

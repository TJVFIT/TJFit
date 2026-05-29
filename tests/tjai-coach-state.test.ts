/**
 * TJAI coach-state decision layer + expanded intent routing (TJFITV.10X PR3).
 */

import { describe, it, expect } from "vitest";

import { buildCoachState, formatCoachStateForPrompt } from "@/lib/tjai/coach-state";
import { routeCoachChatIntent } from "@/lib/tjai/orchestrator/chat-intent";
import type { ChatCoachPlanRow, ChatCoachProgressEntry, ChatCoachWorkoutLog } from "@/lib/tjai/context/chat-coach-context";

const NOW = new Date("2026-05-29T12:00:00Z");

function workoutDaysAgo(days: number): ChatCoachWorkoutLog {
  const d = new Date(NOW.getTime() - days * 86_400_000);
  return { workout_date: d.toISOString(), exercise: "Squat", sets: 3, reps: 5, weight_kg: 100, duration_minutes: 45 };
}

function planRow(trainingDays: number | null): ChatCoachPlanRow {
  return {
    goal: "muscle_gain",
    daily_calories: 2800,
    protein_g: 170,
    training_days_per_week: trainingDays,
    training_location: "gym",
    version_number: 1,
    answers_json: null,
    plan_json: null
  };
}

describe("buildCoachState", () => {
  it("recommends rescue when last workout was 6 days ago", () => {
    const state = buildCoachState({
      planRow: planRow(4),
      workouts: [workoutDaysAgo(6)],
      entries: [],
      adaptiveCheckpoint: null,
      now: NOW
    });
    expect(state.nextBestAction.mode).toBe("rescue_missed_workout");
    expect(state.adherence.daysSinceLastWorkout).toBe(6);
  });

  it("recommends logging data when training volume is fine but metrics are missing", () => {
    const state = buildCoachState({
      planRow: planRow(4),
      workouts: [workoutDaysAgo(1), workoutDaysAgo(3), workoutDaysAgo(5), workoutDaysAgo(8)],
      entries: [],
      adaptiveCheckpoint: null,
      now: NOW
    });
    expect(state.nextBestAction.mode).toBe("log_data");
  });

  it("prioritizes regenerate_plan when the adaptive checkpoint triggers it", () => {
    const state = buildCoachState({
      planRow: planRow(4),
      workouts: [workoutDaysAgo(6)],
      entries: [
        { entry_date: "2026-05-28", weight_kg: 80, body_fat_percent: null, waist_cm: null },
        { entry_date: "2026-05-01", weight_kg: 82, body_fat_percent: null, waist_cm: null }
      ] as ChatCoachProgressEntry[],
      adaptiveCheckpoint: { shouldAdapt: true, urgency: "high", triggerRegen: true, regenReason: "goal shift" },
      now: NOW
    });
    expect(state.nextBestAction.mode).toBe("regenerate_plan");
    expect(state.nextBestAction.reason).toContain("goal shift");
  });

  it("continues the plan and computes a weight trend when adherence is healthy", () => {
    const state = buildCoachState({
      planRow: planRow(4),
      workouts: [workoutDaysAgo(1), workoutDaysAgo(3), workoutDaysAgo(5), workoutDaysAgo(8)],
      entries: [
        { entry_date: "2026-05-28", weight_kg: 79, body_fat_percent: null, waist_cm: null },
        { entry_date: "2026-05-01", weight_kg: 81, body_fat_percent: null, waist_cm: null }
      ] as ChatCoachProgressEntry[],
      adaptiveCheckpoint: null,
      now: NOW
    });
    expect(state.nextBestAction.mode).toBe("continue_plan");
    expect(state.body.weightChangeKg).toBe(-2);
    expect(state.body.hasEnoughTrendData).toBe(true);
  });

  it("formats a compact prompt block with the next best action", () => {
    const block = formatCoachStateForPrompt(
      buildCoachState({ planRow: planRow(4), workouts: [workoutDaysAgo(6)], entries: [], adaptiveCheckpoint: null, now: NOW })
    );
    expect(block).toContain("COACH STATE");
    expect(block).toContain("NEXT BEST ACTION");
  });
});

describe("routeCoachChatIntent — expanded intents", () => {
  it("routes refund/billing to support", () => {
    expect(routeCoachChatIntent("I want a refund for my subscription")).toBe("support_refund");
  });

  it("routes Ramadan/fasting questions to fasting_religious", () => {
    expect(routeCoachChatIntent("How should I train during Ramadan fasting?")).toBe("fasting_religious");
  });

  it("routes missed-training language to rescue", () => {
    expect(routeCoachChatIntent("I skipped all my workouts this week")).toBe("missed_workout_rescue");
  });

  it("still routes injury before fasting/nutrition", () => {
    expect(routeCoachChatIntent("sharp knee pain when I squat")).toBe("injury_recovery");
  });
});

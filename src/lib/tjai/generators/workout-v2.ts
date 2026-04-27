import { callOpenAI, safeParseJSON } from "@/lib/tjai-openai";

import type { IntakeContext } from "@/lib/tjai/generators/macros-v2";
import type { V2Workout, V2WorkoutPhase } from "@/lib/tjai/v2-plan-schema";

/**
 * v2 workout generator. Routes to Opus for the structured 12-week plan.
 *
 * Determinism rules (applied before/after the LLM call):
 *   - Split by goal+days (PPL for hypertrophy 5-6d, upper/lower 4d, full
 *     body 3d, hybrid for performance, recovery-focused for recovery).
 *   - Auto-cap days_per_week into a feasible split.
 *   - Inject injuries as exercise-swap hints in the prompt.
 *   - Force progression rule: small load/rep bump weekly unless RPE>9
 *     last week (the existing suggestions phase already handles weekly
 *     adjustment downstream).
 */

function pickSplit(goal: string, days: number): { split: string; daysPerWeek: number } {
  if (days <= 1) return { split: "full-body", daysPerWeek: 2 };
  if (days === 2) return { split: "full-body", daysPerWeek: 2 };
  if (days === 3) return { split: "full-body", daysPerWeek: 3 };
  if (days === 4) return { split: "upper-lower", daysPerWeek: 4 };
  if (days === 5 && (goal === "muscle_gain" || goal === "recomposition")) {
    return { split: "PPL", daysPerWeek: 5 };
  }
  if (days >= 5) return { split: "PPL", daysPerWeek: 6 };
  return { split: "upper-lower", daysPerWeek: days };
}

const SYSTEM_PROMPT = `You design a 12-week training program. Output STRICT JSON ONLY, no prose, no markdown.

Schema:
{
  "phases": [
    {
      "phase": 1|2|3,
      "weeksLabel": "Weeks 1-4" | "Weeks 5-8" | "Weeks 9-12",
      "focus": "<one short line — e.g. 'Hypertrophy base'>",
      "days": [
        {
          "day": 1,
          "label": "Push" | "Upper" | "Full body" | etc,
          "exercises": [
            {
              "name": "Barbell bench press",
              "sets": 4,
              "reps": "6-8",
              "rpe": "7-8",
              "tempo": "2-1-2-0",
              "restSec": 150,
              "cue": "Drive heels, tuck elbows ~60deg"
            }
          ],
          "conditioning": "10 min Z2 cardio (optional)"
        }
      ]
    }
  ]
}

Rules:
- 3 phases, 4 weeks each = 12 weeks total.
- Phase 1: foundation. Phase 2: progression. Phase 3: peak/intensification.
- Use the user's split + daysPerWeek exactly.
- 4-7 exercises per day. Compound lifts first, isolations last.
- Reps + RPE evidence-based for the goal.
- Honor injuries: never program a movement that aggravates a listed injury.
- Tempo only on key lifts (skip if irrelevant).
- restSec realistic (60-90 isolation, 120-180 compound, 180-240 heavy strength).
- Cue is one short line, not a paragraph.
- Use English exercise names everywhere — UI translates labels.
- Output valid JSON only. No leading text. No trailing text.`;

export type WorkoutGenInput = {
  intake: IntakeContext;
  userId: string;
};

export async function generateV2Workout(
  input: WorkoutGenInput
): Promise<V2Workout | null> {
  const { intake } = input;
  const { split, daysPerWeek } = pickSplit(intake.goal, intake.daysPerWeek);

  const userPrompt = buildUserPrompt(intake, split, daysPerWeek);

  try {
    const text = await callOpenAI({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 5000,
      jsonMode: true,
      task: "plan",
      route: "tjai/v2-workout-generate",
      userId: input.userId
    });
    const parsed = safeParseJSON<{ phases?: V2WorkoutPhase[] }>(text);
    if (!Array.isArray(parsed.phases) || parsed.phases.length === 0) return null;

    return {
      split,
      daysPerWeek,
      phases: parsed.phases,
      progressionRule:
        "Add a small rep or load bump each week. If last week's average RPE was 9 or higher, hold loads steady this week and prioritize recovery."
    };
  } catch {
    return null;
  }
}

function buildUserPrompt(intake: IntakeContext, split: string, daysPerWeek: number): string {
  const injuriesLine =
    intake.injuries.length > 0 && intake.injuries[0] !== "none"
      ? `Injuries (program around): ${intake.injuries.join(", ")}.`
      : "No injury restrictions.";

  return `User context:
- Goal: ${intake.goal}
- Training history: ${intake.trainingHistory}
- Sex: ${intake.sex}
- Age: ${intake.age}
- Bodyweight: ${intake.weightKg}kg
- Height: ${intake.heightCm}cm
- Days per week available: ${daysPerWeek}
- Session length: ${intake.sessionLength}
- Sleep avg: ${intake.sleepHours}h
- Stress: ${intake.stress}
- ${injuriesLine}

Split: ${split}.
Generate the 12-week JSON plan now.`;
}

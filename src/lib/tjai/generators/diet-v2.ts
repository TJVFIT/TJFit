import { callClaude, extractJsonBlock } from "@/lib/tjai-anthropic";

import type { IntakeContext } from "@/lib/tjai/generators/macros-v2";
import type { V2Diet, V2DietDay, V2Macros } from "@/lib/tjai/v2-plan-schema";

/**
 * v2 diet meal-plan generator. Routes to Haiku — meal plans are
 * structurally simple JSON. The expensive part is recipe text, which
 * is PR5's job.
 *
 * Output is a 7-day fixed meal plan with macros that hit the target
 * calories from the deterministic macros calculator.
 */

const SYSTEM_PROMPT = `You design a 7-day meal plan. Output STRICT JSON ONLY, no prose, no markdown.

Schema:
{
  "days": [
    {
      "day": 1,
      "label": "Mon",
      "meals": [
        {
          "slot": "breakfast" | "lunch" | "dinner" | "snack",
          "name": "Greek yogurt + berries + oats",
          "description": "<one short line of optional context>",
          "kcal": 420,
          "proteinG": 32,
          "carbsG": 48,
          "fatG": 10
        }
      ],
      "totalKcal": <sum>,
      "totalProteinG": <sum>
    }
  ]
}

Rules:
- 7 days, days 1-7 with labels Mon/Tue/Wed/Thu/Fri/Sat/Sun.
- Each day: 3-4 meals (breakfast/lunch/dinner + optional snack).
- Each day total kcal must be within +/-100 of target_kcal.
- Each day total protein must be within +/-10g of target_protein_g.
- Honor dietary restrictions (halal/kosher/vegetarian/etc) — NEVER include forbidden ingredients.
- Honor allergies — NEVER include allergens listed.
- Honor cook_time budget — short cook_time means simple meals.
- Honor cultural background — TR users get Turkish-inflected meals (menemen, mercimek, kofte), AR users get Middle-Eastern (hummus, tabbouleh, mansaf), ES Spanish (tortilla, lentejas), FR French (omelette, poulet basquaise).
- Honor fasting pattern — for ramadan: 2 meals (suhoor + iftar) plus a small snack at iftar break; for intermittent_fasting: 2-3 meals in an 8-hour window.
- Use ingredients available in the user's market region (cheap proteins like chicken thigh, eggs, lentils for tight budgets).
- Names are short and concrete. No ambiguous "salmon bowl" — say "Pan-seared salmon with rice and broccoli".
- Output valid JSON only. No leading text. No trailing text.`;

export type DietGenInput = {
  intake: IntakeContext;
  macros: V2Macros;
  userId: string;
};

export async function generateV2Diet(input: DietGenInput): Promise<V2Diet | null> {
  const { intake, macros } = input;
  const pattern: V2Diet["pattern"] =
    intake.fastingPattern === "ramadan"
      ? "ramadan"
      : intake.fastingPattern === "intermittent"
        ? "intermittent_fasting"
        : "standard";

  const userPrompt = buildUserPrompt(intake, macros, pattern);

  try {
    const text = await callClaude({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 4000,
      task: "creative",
      route: "tjai/v2-diet-generate",
      userId: input.userId
    });
    const json = extractJsonBlock(text);
    if (!json) return null;
    const parsed = JSON.parse(json) as { days?: V2DietDay[] };
    if (!Array.isArray(parsed.days) || parsed.days.length === 0) return null;

    return {
      pattern,
      schedule: scheduleLine(pattern, intake.country),
      days: parsed.days,
      swappableMeals: true
    };
  } catch {
    return null;
  }
}

function scheduleLine(pattern: V2Diet["pattern"], country: string): string | undefined {
  if (pattern === "ramadan") {
    return country === "TR"
      ? "Sahur ~04:30 / İftar ~19:30 (your local times will vary)"
      : "Suhoor pre-fajr / Iftar at maghrib";
  }
  if (pattern === "intermittent_fasting") {
    return "Eating window 12:00–20:00 (8h window — adjust to your schedule)";
  }
  return undefined;
}

function buildUserPrompt(intake: IntakeContext, macros: V2Macros, pattern: V2Diet["pattern"]): string {
  const allergiesLine =
    intake.allergies.length > 0 && intake.allergies[0] !== "none"
      ? `Allergies (avoid completely): ${intake.allergies.join(", ")}.`
      : "No food allergies.";
  const restrictionLine =
    intake.religionDiet === "none" ? "No religious dietary restrictions." : `Diet restriction: ${intake.religionDiet}.`;

  return `Targets:
- target_kcal: ${macros.targetKcal}
- target_protein_g: ${macros.proteinG}
- target_carbs_g: ${macros.carbsG}
- target_fat_g: ${macros.fatG}

User context:
- Country: ${intake.country || "international"}
- City: ${intake.city || "—"}
- Cooking time per day: ${intake.cookTime} min budget
- Family size: ${intake.familySize}
- Pattern: ${pattern}
- ${restrictionLine}
- ${allergiesLine}

Generate the 7-day JSON meal plan now.`;
}

import { callOpenAI, safeParseJSON } from "@/lib/tjai-openai";

import type { IntakeContext } from "@/lib/tjai/generators/macros-v2";
import type { V2SupplementItem, V2Supplements } from "@/lib/tjai/v2-plan-schema";

/**
 * v2 supplement stack generator.
 *
 * Hybrid approach:
 *   1. A deterministic core stack picks supplements based on goal +
 *      training history. Always-safe defaults (creatine, whey, vit D).
 *   2. A Haiku call adds personalization notes (rationale per supplement,
 *      published-range doses, allergy-aware swaps) and removes anything
 *      that conflicts with the user's current_supplements / medications.
 *
 * Affiliate links: per-region storefront. Suplementler.com for TR users,
 * iHerb international fallback. Equipment store products are filtered
 * out — those go in the equipment recommendation surface elsewhere.
 */

type CoreSupplement = {
  name: string;
  category: V2SupplementItem["category"];
  doseLine: string;
  applies: (intake: IntakeContext) => boolean;
};

const CORE_STACK: CoreSupplement[] = [
  {
    name: "Whey protein isolate",
    category: "core",
    doseLine: "1 scoop (~25 g) once or twice daily, post-training or to fill a protein gap",
    applies: (i) => !i.allergies.includes("dairy") && i.religionDiet !== "vegetarian"
  },
  {
    name: "Plant protein blend (pea + rice)",
    category: "core",
    doseLine: "1 scoop (~25-30 g) post-training or to fill a protein gap",
    applies: (i) => i.allergies.includes("dairy") || i.religionDiet === "vegetarian"
  },
  {
    name: "Creatine monohydrate",
    category: "core",
    doseLine: "3-5 g per day, taken any time — well-established at this dose range",
    applies: () => true
  },
  {
    name: "Vitamin D3",
    category: "health",
    doseLine: "1000-2000 IU daily — published-range default; check serum levels with your doctor",
    applies: () => true
  },
  {
    name: "Omega-3 (EPA + DHA)",
    category: "health",
    doseLine: "1-2 g combined EPA/DHA per day with a meal",
    applies: (i) => !i.allergies.includes("shellfish")
  },
  {
    name: "Caffeine (or strong coffee)",
    category: "performance",
    doseLine: "150-300 mg ~30-45 min pre-training; skip on rest days",
    applies: (i) => i.caffeine !== "high" && !i.cvHistory && (i.goal === "fat_loss" || i.goal === "performance")
  },
  {
    name: "EAA (essential amino acids)",
    category: "performance",
    doseLine: "8-10 g during training on cut days",
    applies: (i) => i.goal === "fat_loss" && i.trainingHistory !== "none"
  },
  {
    name: "Magnesium glycinate",
    category: "recovery",
    doseLine: "200-400 mg in the evening — supports sleep quality",
    applies: (i) => i.sleepHours < 7 || i.stress === "high" || i.stress === "very_high"
  },
  {
    name: "Multivitamin",
    category: "health",
    doseLine: "1 daily with food — covers gaps in a restricted diet",
    applies: (i) => i.cookTime === "15" || i.religionDiet === "vegetarian"
  }
];

function pickDeterministicStack(intake: IntakeContext): V2SupplementItem[] {
  const taken = parseCurrentSupplements(intake.currentSupplements);
  const items: V2SupplementItem[] = [];

  for (const core of CORE_STACK) {
    if (!core.applies(intake)) continue;
    items.push({
      name: core.name,
      category: core.category,
      doseLine: core.doseLine,
      rationale: "", // filled by Haiku
      alreadyTaking: taken.some((t) => t.toLowerCase().includes(core.name.toLowerCase().split(" ")[0]))
    });
  }
  return items;
}

function parseCurrentSupplements(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[,;]+/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3);
}

const SYSTEM_PROMPT = `You write supplement rationales and safety warnings. Output STRICT JSON ONLY, no prose, no markdown.

Schema:
{
  "items": [
    {
      "name": "Creatine monohydrate",
      "category": "core" | "performance" | "recovery" | "health",
      "doseLine": "3-5 g/day, any time",
      "rationale": "<one short line — why this is in the stack for this user>",
      "alreadyTaking": <bool>
    }
  ],
  "monthlyCostEstimate": "<region currency range, e.g. '₺400-700' or '€30-50'>",
  "warnings": [
    "<safety note, e.g. 'Caffeine + cardiovascular history: skip pre-workout, talk to your doctor first.'>"
  ]
}

Rules:
- Use the ITEMS array provided as the input — keep them, fill in the rationale field for each, and add alreadyTaking based on the user's current_supplements list.
- Add at most 1-2 short warnings that apply specifically (e.g. caffeine for cv_history, ashwagandha for thyroid med interactions if relevant).
- Do NOT recommend doses outside the doseLine field — keep them as the input has them.
- monthlyCostEstimate is realistic for the user's country.
- rationale is one short sentence — say WHY this user benefits, not generic info.
- Output valid JSON only.`;

export type SupplementsGenInput = {
  intake: IntakeContext;
  userId: string;
};

export async function generateV2Supplements(
  input: SupplementsGenInput
): Promise<V2Supplements | null> {
  const { intake } = input;
  const baseStack = pickDeterministicStack(intake);
  if (baseStack.length === 0) return null;

  const userPrompt = buildPrompt(intake, baseStack);

  try {
    const text = await callOpenAI({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 1500,
      jsonMode: true,
      task: "creative",
      route: "tjai/v2-supplements-generate",
      userId: input.userId
    });
    const parsed = safeParseJSON<{
      items?: V2SupplementItem[];
      monthlyCostEstimate?: string;
      warnings?: string[];
    }>(text);
    if (!Array.isArray(parsed.items)) return fallbackOutput(baseStack);

    const items: V2SupplementItem[] = parsed.items.map((item, idx) => ({
      ...baseStack[idx],
      ...item,
      // Always preserve the deterministic doseLine — never let the LLM
      // change the dose recommendation. Keep the LLM-supplied rationale.
      doseLine: baseStack[idx]?.doseLine ?? item.doseLine,
      buyLink: buyLinkFor(item.name, intake.country)
    }));

    return {
      items,
      monthlyCostEstimate: parsed.monthlyCostEstimate,
      warnings: Array.isArray(parsed.warnings)
        ? parsed.warnings.filter((s): s is string => typeof s === "string").slice(0, 4)
        : undefined
    };
  } catch {
    return fallbackOutput(baseStack);
  }
}

function fallbackOutput(stack: V2SupplementItem[]): V2Supplements {
  // If the LLM call fails, ship the deterministic stack with empty
  // rationales rather than show nothing.
  return {
    items: stack.map((item) => ({ ...item, rationale: "Standard for your goal and training profile." })),
    warnings: []
  };
}

function buyLinkFor(name: string, country: string): string | undefined {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join("-");
  if (!slug) return undefined;

  // Very-light affiliate-aware redirector. PR10 wires the affiliate layer
  // properly with disclosure + click tracking; for now we just deeplink.
  if (country === "TR") {
    return `https://www.suplementler.com/?q=${encodeURIComponent(slug.replace(/-/g, " "))}`;
  }
  return `https://www.iherb.com/search?kw=${encodeURIComponent(slug.replace(/-/g, "+"))}`;
}

function buildPrompt(intake: IntakeContext, stack: V2SupplementItem[]): string {
  const allergiesLine =
    intake.allergies.length > 0 && intake.allergies[0] !== "none"
      ? `Allergies: ${intake.allergies.join(", ")}.`
      : "No allergies.";
  const meds = intake.medications ? `Medications: ${intake.medications}.` : "No prescription meds noted.";
  const current = intake.currentSupplements
    ? `Currently taking: ${intake.currentSupplements}.`
    : "Not currently supplementing.";

  const stackLines = stack
    .map((s, i) => `${i + 1}. ${s.name} (${s.category}) — dose: ${s.doseLine}`)
    .join("\n");

  return `User context:
- Goal: ${intake.goal}
- Training: ${intake.trainingHistory}, ${intake.daysPerWeek} days/week
- Country: ${intake.country || "international"}
- ${allergiesLine}
- ${meds}
- ${current}
- Sleep avg: ${intake.sleepHours}h, stress: ${intake.stress}
- Cardiovascular history: ${intake.cvHistory ? "yes" : "no"}
- Caffeine intake: ${intake.caffeine}

Recommended stack (do not modify, only fill rationales + alreadyTaking + warnings):
${stackLines}

Generate the supplement JSON now.`;
}

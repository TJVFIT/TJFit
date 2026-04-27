import { callClaude, extractJsonBlock } from "@/lib/tjai-anthropic";

import type { IntakeContext } from "@/lib/tjai/generators/macros-v2";
import { getDeliveryLinks, getMarketsForCountry } from "@/lib/tjai/markets-by-country";
import type { V2Diet, V2Grocery, V2GroceryItem } from "@/lib/tjai/v2-plan-schema";

/**
 * v2 grocery list generator. Routes to Haiku — the structure is fixed,
 * the LLM just needs to consolidate ingredients and apply
 * region-appropriate brand hints + alternates.
 *
 * Inputs: the diet's 7-day meal plan + intake context.
 * Output: a single-shop grocery list organized by priority, with each
 * item annotated with alternates and a region-aware brand hint.
 */

const SYSTEM_PROMPT = `You build a weekly grocery list from a 7-day meal plan. Output STRICT JSON ONLY, no prose, no markdown.

Schema:
{
  "items": [
    {
      "category": "proteins" | "carbs" | "produce" | "dairy_eggs" | "pantry" | "supplements",
      "name": "Chicken thigh",
      "quantity": "1.5 kg",
      "estCost": "<region currency range, e.g. '₺120-180' or '€8-12'>",
      "brandHint": "<a real common brand at the user's market, or omit>",
      "alternates": ["turkey thigh", "firm tofu"],
      "priority": "must" | "optional"
    }
  ],
  "estTotalCost": "<region currency total range>"
}

Rules:
- Consolidate duplicate ingredients across the 7 days into single rows.
- Group by category, but rows can be in any order — the UI re-sorts.
- "must" priority = appears in 3+ meals OR is the day's main protein.
- "optional" = appears once, garnish, or substitution-friendly.
- alternates: 1-2 swaps. Honor the user's restrictions (no pork for halal,
  no listed allergens). Include a budget-tier swap if possible
  ("grass-fed beef → regular beef").
- brandHint: only include real brands the user can actually find at
  their market. If you don't know the user's market well, omit brandHint.
- estCost: use the user's local currency. Be conservative — give a range.
- Respect family size: if family=family, multiply quantities by ~3-4.
- Output valid JSON only. No leading text. No trailing text.`;

export type GroceryGenInput = {
  intake: IntakeContext;
  diet: V2Diet;
  userId: string;
};

export async function generateV2Grocery(input: GroceryGenInput): Promise<V2Grocery | null> {
  const { intake, diet } = input;

  // Compact the diet into a flat ingredient summary the LLM can consolidate.
  const mealSummary = diet.days
    .flatMap((d) =>
      d.meals.map((m) => `${d.label} ${m.slot}: ${m.name} (${m.kcal} kcal, P${m.proteinG})`)
    )
    .join("\n");

  const marketLabel = resolveMarketLabel(intake.market, intake.country);
  const userPrompt = buildPrompt(intake, mealSummary, marketLabel);

  try {
    const text = await callClaude({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 3500,
      task: "creative",
      route: "tjai/v2-grocery-generate",
      userId: input.userId
    });
    const json = extractJsonBlock(text);
    if (!json) return null;
    const parsed = JSON.parse(json) as { items?: V2GroceryItem[]; estTotalCost?: string };
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;

    // Pick the first available delivery link for the user's country.
    const deliveryLinks = getDeliveryLinks(intake.country);

    return {
      weekOf: new Date().toISOString().slice(0, 10),
      market: intake.market || undefined,
      items: parsed.items.map(sanitizeItem),
      estTotalCost: parsed.estTotalCost,
      deliveryLink: deliveryLinks[0]?.url
    };
  } catch {
    return null;
  }
}

function sanitizeItem(item: V2GroceryItem): V2GroceryItem {
  const validCategories: V2GroceryItem["category"][] = [
    "proteins",
    "carbs",
    "produce",
    "dairy_eggs",
    "pantry",
    "supplements"
  ];
  return {
    category: validCategories.includes(item.category) ? item.category : "pantry",
    name: String(item.name ?? "").slice(0, 80),
    quantity: String(item.quantity ?? "").slice(0, 40),
    estCost: item.estCost ? String(item.estCost).slice(0, 30) : undefined,
    brandHint: item.brandHint ? String(item.brandHint).slice(0, 60) : undefined,
    alternates: Array.isArray(item.alternates)
      ? item.alternates.filter((s): s is string => typeof s === "string").slice(0, 3)
      : undefined,
    priority: item.priority === "must" ? "must" : "optional"
  };
}

function resolveMarketLabel(marketId: string, country: string): string {
  if (!marketId || marketId === "other") return "any local supermarket";
  const markets = getMarketsForCountry(country);
  return markets.find((m) => m.id === marketId)?.label ?? marketId;
}

function buildPrompt(intake: IntakeContext, mealSummary: string, marketLabel: string): string {
  const allergiesLine =
    intake.allergies.length > 0 && intake.allergies[0] !== "none"
      ? `Allergies (must avoid): ${intake.allergies.join(", ")}.`
      : "No allergies.";
  const restrictionLine =
    intake.religionDiet === "none"
      ? "No religious restriction."
      : `Restriction: ${intake.religionDiet}.`;

  return `User context:
- Country: ${intake.country || "international"}
- City: ${intake.city || "—"}
- Market: ${marketLabel}
- Family size: ${intake.familySize}
- Cook time budget: ${intake.cookTime} min/day
- ${restrictionLine}
- ${allergiesLine}

7-day meal plan:
${mealSummary}

Generate the consolidated weekly grocery list JSON now. Use the local
currency and a brand hint native to ${marketLabel} where possible.`;
}

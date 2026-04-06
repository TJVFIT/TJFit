import { NextResponse } from "next/server";

import { callClaude, extractJsonBlock } from "@/lib/tjai-anthropic";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const originalMeal = body?.originalMeal;
  const planContext = body?.planContext;
  if (!originalMeal || !planContext) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  try {
    const text = await callClaude({
      maxTokens: 1500,
      system: "You are TJAI. Generate 3 alternative meals. Return JSON only.",
      user: `Generate 3 meals that can replace this meal:
${JSON.stringify(originalMeal)}
Requirements:
- Same calories (+/-30 kcal)
- Same protein (+/-5g)
- Similar carbs and fat
- User likes: ${JSON.stringify(planContext.preferences ?? [])}
- User avoids: ${JSON.stringify(planContext.restrictions ?? [])}
- Budget: ${planContext.budget}
- Return JSON: {"alternatives":[MealObject,MealObject,MealObject]}
MealObject fields: name,time,foods,calories,protein,carbs,fat,prepNote,recipe`
    });
    const json = extractJsonBlock(text);
    if (!json) return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    const parsed = JSON.parse(json);
    return NextResponse.json({ alternatives: parsed.alternatives ?? [] });
  } catch (error) {
    return NextResponse.json({ error: "Swap generation failed", details: String(error) }, { status: 500 });
  }
}


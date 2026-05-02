import { NextResponse } from "next/server";

// Anthropic-backed (dual-provider). Uses Claude via @/lib/tjai-anthropic
// for grocery-list extraction; the rest of TJAI runs on OpenAI.
// Requires ANTHROPIC_API_KEY in env (see .env.example).
import { callClaude, extractJsonBlock } from "@/lib/tjai-anthropic";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const week = body?.week;
  if (!week) return NextResponse.json({ error: "Missing week meals" }, { status: 400 });

  try {
    const text = await callClaude({
      maxTokens: 2000,
      task: "extract",
      route: "tjai/grocery-list",
      userId: auth.user.id,
      system: "You are TJAI. Return JSON only.",
      user: `Extract ingredients from these meals, combine duplicates, total quantities for one week.
Organize categories: proteins, carbs_and_grains, vegetables_and_fruits, dairy_and_eggs, pantry_and_condiments, supplements.
Return JSON:
{"categories":[{"name":"Proteins","items":[{"name":"Chicken breast","quantity":"1.2","unit":"kg"}]}]}
Meals:
${JSON.stringify(week)}`
    });
    const json = extractJsonBlock(text);
    if (!json) return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    return NextResponse.json(JSON.parse(json));
  } catch (error) {
    return NextResponse.json({ error: "Grocery list generation failed", details: String(error) }, { status: 500 });
  }
}


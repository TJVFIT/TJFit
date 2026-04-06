import { NextResponse } from "next/server";

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
      system: "You are TJAI. Return JSON only.",
      user: `Create a Sunday meal prep schedule for these meals.
Order tasks for efficiency, include exact quantities/times/storage.
Total prep under 2 hours.
Return JSON:
{"totalTime":"~120 min","equipment":["..."],"timeline":[{"time":"0:00-0:20","task":"...","detail":"...","storage":"..."}]}
Meals:
${JSON.stringify(week)}`
    });
    const json = extractJsonBlock(text);
    if (!json) return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    return NextResponse.json(JSON.parse(json));
  } catch (error) {
    return NextResponse.json({ error: "Meal prep generation failed", details: String(error) }, { status: 500 });
  }
}


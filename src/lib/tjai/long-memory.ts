import type { SupabaseClient } from "@supabase/supabase-js";

import { callOpenAI, safeParseJSON } from "@/lib/tjai-openai";

export type LongMemoryCategory =
  | "goal"
  | "injury"
  | "preference"
  | "lift"
  | "milestone"
  | "constraint"
  | "general";

export type LongMemoryRow = {
  id: string;
  user_id: string;
  fact: string;
  category: LongMemoryCategory;
  source: string;
  created_at: string;
};

export async function loadLongMemoryFacts(
  supabase: SupabaseClient,
  userId: string,
  limit = 30
): Promise<LongMemoryRow[]> {
  const { data } = await supabase
    .from("tjai_long_memory")
    .select("id,user_id,fact,category,source,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as LongMemoryRow[];
}

export function formatMemoryBlock(rows: LongMemoryRow[]): string {
  if (rows.length === 0) return "";
  const grouped = new Map<string, string[]>();
  for (const row of rows) {
    const list = grouped.get(row.category) ?? [];
    list.push(row.fact);
    grouped.set(row.category, list);
  }
  const order: LongMemoryCategory[] = ["goal", "injury", "constraint", "lift", "milestone", "preference", "general"];
  const lines: string[] = [];
  for (const cat of order) {
    const items = grouped.get(cat);
    if (!items || items.length === 0) continue;
    lines.push(`- ${cat}: ${items.slice(0, 8).join("; ")}`);
  }
  if (lines.length === 0) return "";
  return `\n\nWHAT YOU REMEMBER ABOUT THIS USER:\n${lines.join("\n")}\nUse this naturally — don't recite it. If anything looks wrong, ask the user to correct it.`;
}

type ExtractedFact = { fact: string; category: LongMemoryCategory };

const EXTRACTION_SYSTEM = `You extract atomic, durable facts about a fitness user from a single chat message.
Return strict JSON: {"facts":[{"fact":"...","category":"goal|injury|preference|lift|milestone|constraint|general"}]}
Rules:
- Only return facts that will still be useful 3 months from now. Skip ephemera.
- Each fact is one short sentence in third person ("user has a torn meniscus", "user prefers home workouts", "user benches 100kg for 5").
- No medical advice, no opinions, no fabrication.
- If nothing durable, return {"facts":[]}.
- Max 5 facts per message.`;

export async function extractFactsFromMessage(message: string, userId: string): Promise<ExtractedFact[]> {
  const wordCount = message.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 6) return [];
  try {
    const text = await callOpenAI({
      system: EXTRACTION_SYSTEM,
      user: message,
      maxTokens: 400,
      jsonMode: true,
      task: "extract",
      route: "tjai/long-memory-extract",
      userId
    });
    const parsed = safeParseJSON<{ facts?: ExtractedFact[] }>(text);
    const facts = Array.isArray(parsed.facts) ? parsed.facts : [];
    return facts
      .filter((f): f is ExtractedFact => Boolean(f && typeof f.fact === "string" && typeof f.category === "string"))
      .map((f) => ({
        fact: f.fact.trim().slice(0, 280),
        category: ([
          "goal",
          "injury",
          "preference",
          "lift",
          "milestone",
          "constraint",
          "general"
        ] as LongMemoryCategory[]).includes(f.category)
          ? f.category
          : "general"
      }))
      .filter((f) => f.fact.length > 0)
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function persistFacts(
  supabase: SupabaseClient,
  userId: string,
  facts: ExtractedFact[]
): Promise<void> {
  if (facts.length === 0) return;
  await supabase.from("tjai_long_memory").insert(
    facts.map((f) => ({
      user_id: userId,
      fact: f.fact,
      category: f.category,
      source: "chat"
    }))
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";

// Extraction routes through the unified LLM router (open-source gateway
// when configured, else the task's legacy provider per provider-policy).
import { extractJsonBlock } from "@/lib/tjai-anthropic";
import { llmCall } from "@/lib/tjai/llm";

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
    const text = await llmCall({
      task: "long_memory_extract",
      system: EXTRACTION_SYSTEM,
      user: message,
      maxTokens: 400,
      route: "tjai/long-memory-extract",
      userId
    });
    const json = extractJsonBlock(text);
    if (!json) return [];
    const parsed = JSON.parse(json) as { facts?: ExtractedFact[] };
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

// Write-time dedupe: never store a fact that is (near-)identical to one the
// user already has, and never let a user exceed the stored-fact cap. Existing
// rows are never deleted or modified — inserts are skipped instead.
const LONG_MEMORY_FACT_CAP = 80;

function normalizeFactText(fact: string): string {
  return fact
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:'"()\[\]{}\-–—_/\\+*&%$#@^~`|<>«»“”‘’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(normalized: string): Set<string> {
  return new Set(normalized.split(" ").filter(Boolean));
}

function jaccardOverlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  return intersection / (a.size + b.size - intersection);
}

export async function persistFacts(
  supabase: SupabaseClient,
  userId: string,
  facts: ExtractedFact[]
): Promise<void> {
  if (facts.length === 0) return;

  const { data: existingRows } = await supabase
    .from("tjai_long_memory")
    .select("id,fact")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(LONG_MEMORY_FACT_CAP + 40);
  const rows = ((existingRows ?? []) as Array<{ id: string; fact: string | null }>).filter(
    (row) => normalizeFactText(String(row.fact ?? "")).length > 0
  );
  const known = rows.map((row) => normalizeFactText(String(row.fact ?? "")));

  const knownSets = known.map(tokenSet);
  const accepted: ExtractedFact[] = [];
  for (const candidate of facts) {
    const normalized = normalizeFactText(candidate.fact);
    if (!normalized) continue;
    const candidateSet = tokenSet(normalized);
    // A candidate that merely EXTENDS a stored fact (strict superset) is new
    // information and must be stored; only skip when it adds nothing.
    const isDuplicate = known.some(
      (existing, i) =>
        existing === normalized ||
        existing.includes(normalized) ||
        jaccardOverlap(candidateSet, knownSets[i]) > 0.8
    );
    if (isDuplicate) continue;
    accepted.push(candidate);
    known.push(normalized);
    knownSets.push(candidateSet);
  }
  if (accepted.length === 0) return;

  // Keep memory bounded by evicting the OLDEST facts, never by rejecting new
  // ones — otherwise a full store would freeze the coach's memory forever.
  const overflow = rows.length + accepted.length - LONG_MEMORY_FACT_CAP;
  if (overflow > 0) {
    const oldestIds = rows.slice(0, overflow).map((row) => row.id);
    await supabase.from("tjai_long_memory").delete().eq("user_id", userId).in("id", oldestIds);
  }

  await supabase.from("tjai_long_memory").insert(
    accepted.map((f) => ({
      user_id: userId,
      fact: f.fact,
      category: f.category,
      source: "chat"
    }))
  );
}

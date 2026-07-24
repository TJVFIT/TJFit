/**
 * TJAI evaluation runner — Phase 11a.
 *
 * Loads `tests/tjai-eval/cases.json`, runs each case through the eval
 * scorer (which bypasses /api/tjai/chat and calls the model directly with
 * the same chat system prompt), and scores the assistant response:
 *
 *   - safety_required  → response mentions doctor/clinician/stop
 *   - must_include     → all substrings present (case-insensitive)
 *   - must_not_include → none present (case-insensitive)
 *   - locale_check     → script-level language detection (Turkish diacritics,
 *                         Arabic Unicode range, Spanish ¡¿ñ, French accents)
 *   - next_action_required → ends with ? or final phrase has imperative verb
 *
 * Modes:
 *   - default      → calls the live model for every case (needs OPENAI_API_KEY)
 *   - --dry-run    → no model calls; prints token estimates only
 *
 * Run with:
 *   npx tsx scripts/tjai-eval.ts            # full
 *   npx tsx scripts/tjai-eval.ts --dry-run  # offline
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  runEvalCase,
  looksLikeLocale,
  looksLikeSafetyResponse,
  looksLikeNextAction,
  type EvalProfile
} from "../src/lib/tjai/eval-scorer";

type ExpectedShape = {
  safety_required: boolean;
  must_include?: string[];
  must_not_include?: string[];
  locale_check: string;
  diacritics_required?: string[];
  rtl_required?: boolean;
  next_action_required?: boolean;
};

type EvalCase = {
  id: string;
  locale: string;
  persona: string;
  profile: EvalProfile;
  prompt: string;
  expected: ExpectedShape;
};

type CaseFile = {
  version: number;
  description?: string;
  cases: EvalCase[];
};

function loadCases(): CaseFile {
  // ESM-safe __dirname replacement so this also runs under `tsx`.
  const here = dirname(fileURLToPath(import.meta.url));
  const path = resolve(here, "..", "tests", "tjai-eval", "cases.json");
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as CaseFile;
}

type Score = {
  id: string;
  passed: boolean;
  checks: Record<string, boolean>;
  notes: string[];
};

function scoreCase(c: EvalCase, response: string): Score {
  const lower = response.toLowerCase();
  const checks: Record<string, boolean> = {};
  const notes: string[] = [];

  if (c.expected.safety_required) {
    checks.safety = looksLikeSafetyResponse(response);
    if (!checks.safety) notes.push("missing safety / clinician referral language");
  }

  if (c.expected.must_include?.length) {
    const missing = c.expected.must_include.filter((s) => !lower.includes(s.toLowerCase()));
    checks.must_include = missing.length === 0;
    if (missing.length) notes.push(`missing required: ${missing.join(", ")}`);
  }

  if (c.expected.must_not_include?.length) {
    const leaked = c.expected.must_not_include.filter((s) => lower.includes(s.toLowerCase()));
    checks.must_not_include = leaked.length === 0;
    if (leaked.length) notes.push(`forbidden present: ${leaked.join(", ")}`);
  }

  checks.locale = looksLikeLocale(response, c.expected.locale_check);
  if (!checks.locale) notes.push(`locale ${c.expected.locale_check} signal not detected`);

  if (c.expected.next_action_required) {
    checks.next_action = looksLikeNextAction(response);
    if (!checks.next_action) notes.push("no clear next action / question at end");
  }

  const passed = Object.values(checks).every(Boolean);
  return { id: c.id, passed, checks, notes };
}

function estimateTokens(text: string): number {
  // crude — OpenAI ~4 chars/token for English
  return Math.ceil(text.length / 4);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || !process.env.OPENAI_API_KEY;

  const file = loadCases();
  console.log(`Loaded ${file.cases.length} cases.`);

  if (dryRun) {
    let totalTokens = 0;
    for (const c of file.cases) {
      const t = estimateTokens(c.prompt);
      totalTokens += t;
      console.log(`  [dry] ${c.id.padEnd(28)} ~${t} input tokens`);
    }
    console.log(
      `\nDry run. Would call model ${file.cases.length}x with ~${totalTokens} input tokens total.`
    );
    if (!process.env.OPENAI_API_KEY) {
      console.log("Set OPENAI_API_KEY and re-run without --dry-run for live scoring.");
    }
    return;
  }

  const results: Score[] = [];
  for (const c of file.cases) {
    try {
      const response = await runEvalCase({
        locale: c.locale,
        persona: c.persona,
        profile: c.profile,
        prompt: c.prompt
      });
      const score = scoreCase(c, response);
      results.push(score);
      const mark = score.passed ? "PASS" : "FAIL";
      console.log(`  ${mark}  ${c.id.padEnd(28)} ${score.notes.join(" · ")}`);
    } catch (err) {
      console.log(`  ERR   ${c.id.padEnd(28)} ${(err as Error).message}`);
      results.push({ id: c.id, passed: false, checks: {}, notes: [(err as Error).message] });
    }
  }

  const passed = results.filter((r) => r.passed).length;
  console.log(`\nTotals: ${passed}/${results.length} passed.`);
  process.exitCode = passed === results.length ? 0 : 1;
}

void main();

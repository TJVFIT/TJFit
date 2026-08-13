// WP-INFRA-01 (i18n half) — hardcoded-UI-string scan, baselined against
// known pre-existing false positives (SVG/input attrs, unsubscribe HTML,
// etc: ~95 hits on the current tree). Follows the same accepted-baseline
// pattern as scripts/db/check-migration-drift.ts:
//   - raw scan (no flags): reports every hit, exits 1 if any (local, ad-hoc)
//   - --baseline <path>: NEW findings (not in the baseline) fail CI; findings
//     already in the baseline pass silently; stale baseline entries (fixed
//     findings) print an info line but do not fail
//   - --write-baseline: regenerates the baseline from the CURRENT findings.
//     An explicit accept-everything action — NEVER run by CI, only after an
//     owner has reviewed the report.
//
// Usage:
//   npm run i18n:scan                                                  (raw)
//   npm run i18n:scan -- --baseline docs/claude/i18n-scan-baseline.json (gated)
//   npm run i18n:scan -- --baseline docs/claude/i18n-scan-baseline.json --write-baseline

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(process.cwd(), "src");
const TARGET_DIRS = [path.join(ROOT, "app"), path.join(ROOT, "components")];
const FILE_EXTENSIONS = new Set([".tsx", ".ts"]);

const allowPatterns: RegExp[] = [
  /^use client$/,
  /^use server$/,
  /^https?:\/\//,
  /^\/[a-z\-\/\[\]]*$/i,
  /^[A-Z0-9_:-]+$/,
  /^[a-z0-9_\-:/.]+$/,
  /^#[0-9a-f]{3,8}$/i,
  /^([A-Z][a-z]+){1,}$/,
  /^@[^"\n]+$/,
  /^className=$/,
  /^label=$/,
  /^source=$/,
  /^afterInteractive$/,
  /^navFull$/,
  /^[@{}()[\].,;:+\-*/\\|&!?<>=~`'"]+$/,
  /^$/
];

const literalRegex = /"([^"\n]{3,})"|'([^'\n]{3,})'/g;
const suspiciousAlphaRegex = /[A-Za-z]{3,}/;
const tailwindLikeRegex = /^[a-z0-9_:[\]()%./-]+(?:\s+[a-z0-9_:[\]()%./-]+)*$/i;

export type Violation = { file: string; line: number; text: string };

export type Baseline = {
  generated: string;
  note: string;
  accepted: Array<{ id: string; note?: string }>;
};

/** Windows editors and PowerShell redirects love writing a UTF-8 BOM; JSON.parse does not. */
function readJsonFile<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")) as T;
}

/**
 * Baseline matching id: (file, matched-text) — deliberately NOT including
 * the line number, so a violation that merely shifts lines (an unrelated
 * edit earlier in the file) doesn't fall out of the baseline and false-fail
 * CI. Every free-form component is percent-encoded so a literal ":" inside
 * either the path or the matched text can't collide two different findings
 * into one id.
 */
const enc = encodeURIComponent;

export function violationId(v: { file: string; text: string }): string {
  return `${enc(v.file)}:${enc(v.text)}`;
}

export function splitAgainstBaseline(violations: Violation[], baseline: Baseline | null) {
  const accepted = new Set((baseline?.accepted ?? []).map((a) => a.id));
  const known: Violation[] = [];
  const fresh: Violation[] = [];
  for (const v of violations) (accepted.has(violationId(v)) ? known : fresh).push(v);
  const currentIds = new Set(violations.map(violationId));
  const stale = [...accepted].filter((id) => !currentIds.has(id));
  return { known, fresh, stale };
}

function shouldIgnoreLiteral(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("@/")) return true;
  if (trimmed.includes("{copy.") || trimmed.includes("sub={")) return true;
  if (trimmed === "fill sizes=") return true;
  if (tailwindLikeRegex.test(trimmed)) return true;
  if (!suspiciousAlphaRegex.test(trimmed)) return true;
  return allowPatterns.some((re) => re.test(trimmed));
}

function isLikelyUIContext(line: string) {
  return (
    line.includes("<") ||
    line.includes("placeholder=") ||
    line.includes("title=") ||
    line.includes("aria-label=") ||
    line.includes("setError(") ||
    line.includes("toast") ||
    line.includes("label") ||
    line.includes("children:")
  );
}

function walk(dir: string, out: string[]) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const filePath = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(filePath, out);
      continue;
    }
    if (FILE_EXTENSIONS.has(path.extname(item.name))) {
      out.push(filePath);
    }
  }
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const hits: Array<{ line: number; text: string }> = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!isLikelyUIContext(line)) continue;

    for (const match of line.matchAll(literalRegex)) {
      const raw = (match[1] ?? match[2] ?? "").trim();
      const start = match.index ?? 0;
      const prefix = line.slice(Math.max(0, start - 24), start);
      if (
        prefix.includes("className=") ||
        prefix.includes("children:") ||
        prefix.includes("label:") ||
        prefix.includes("href=") ||
        prefix.includes("src=") ||
        prefix.includes("import ") ||
        prefix.includes("from ")
      ) {
        continue;
      }
      if (!raw || shouldIgnoreLiteral(raw)) continue;
      hits.push({ line: i + 1, text: raw });
    }
  }

  return hits;
}

export function scanRepo(): Violation[] {
  const files: string[] = [];
  for (const dir of TARGET_DIRS) {
    if (fs.existsSync(dir)) walk(dir, files);
  }

  const violations: Violation[] = [];
  for (const file of files) {
    const hits = scanFile(file);
    for (const hit of hits) {
      violations.push({
        file: path.relative(process.cwd(), file).split(path.sep).join("/"),
        line: hit.line,
        text: hit.text
      });
    }
  }
  return violations;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function readBaseline(baselinePath: string): Baseline | null {
  if (!fs.existsSync(baselinePath)) return null;
  return readJsonFile<Baseline>(baselinePath);
}

function writeBaseline(baselinePath: string, violations: Violation[]) {
  const existing = readBaseline(baselinePath);
  const notes = new Map((existing?.accepted ?? []).map((a) => [a.id, a.note]));
  // De-dupe: multiple hits can share a (file, text) id (the same literal
  // appearing on more than one line); the baseline only needs one entry.
  const seen = new Set<string>();
  const accepted: Array<{ id: string; note?: string }> = [];
  for (const v of violations) {
    const id = violationId(v);
    if (seen.has(id)) continue;
    seen.add(id);
    accepted.push({ id, note: notes.get(id) ?? "accepted as pre-existing on baseline regeneration" });
  }
  const baseline: Baseline = {
    generated: new Date().toISOString().slice(0, 10),
    note:
      "Accepted pre-existing i18n-scan false positives (SVG/input attrs, unsubscribe HTML, etc — see scripts/i18n/check-hardcoded-ui.ts's regex heuristics for why these read as UI strings). New hits are not added here to silence CI — they are localized (moved into a copy object) or explicitly owner-accepted with a note.",
    accepted
  };
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n");
  console.log(`baseline written: ${accepted.length} accepted finding(s) -> ${baselinePath}`);
}

function main() {
  const violations = scanRepo();

  const baselineIdx = process.argv.indexOf("--baseline");
  const baselinePath = baselineIdx !== -1 ? process.argv[baselineIdx + 1] : null;
  if (baselineIdx !== -1 && !baselinePath) throw new Error("--baseline needs a path");

  if (process.argv.includes("--write-baseline")) {
    if (!baselinePath) throw new Error("--write-baseline needs --baseline <path>");
    writeBaseline(baselinePath, violations);
    return;
  }

  if (!baselinePath) {
    // Raw mode (no baseline supplied): unchanged historical behavior.
    if (violations.length === 0) {
      console.log("i18n hardcoded UI scan passed.");
      return;
    }
    console.error("Found potential hardcoded UI strings:");
    for (const v of violations) {
      console.error(`- ${v.file}:${v.line} -> "${v.text}"`);
    }
    process.exitCode = 1;
    return;
  }

  const { known, fresh, stale } = splitAgainstBaseline(violations, readBaseline(baselinePath));
  console.log(
    `i18n hardcoded-string scan: ${violations.length} total hit(s), ${known.length} known-baseline, ${fresh.length} new, ${stale.length} stale baseline entr(ies)`
  );
  for (const v of fresh) console.log(`  NEW ${v.file}:${v.line} -> "${v.text}"`);
  for (const id of stale) console.log(`  stale baseline entry (no longer occurs, prune it): ${id}`);

  if (fresh.length > 0) {
    console.error(
      `\nFAIL: ${fresh.length} new hardcoded-string finding(s). Localize the string or owner-accept it into ${path.relative(process.cwd(), baselinePath)} with a note.`
    );
    process.exitCode = 1;
    return;
  }

  console.log("i18n hardcoded UI scan passed (baselined).");
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main();
}

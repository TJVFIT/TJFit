import { readFileSync, readdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

import { dictionaries } from "../../src/lib/i18n";

type Leaf = string | number | boolean | null;

function flatten(obj: unknown, base = "", out: Record<string, Leaf> = {}) {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      const next = base ? `${base}.${k}` : k;
      flatten(v, next, out);
    }
    return out;
  }
  out[base] = obj as Leaf;
  return out;
}

function compareToBaseline(
  label: string,
  baselineKeys: Set<string>,
  currentKeys: Set<string>
): boolean {
  const missing = [...baselineKeys].filter((k) => !currentKeys.has(k));
  const extra = [...currentKeys].filter((k) => !baselineKeys.has(k));
  if (missing.length === 0 && extra.length === 0) return false;
  console.error(`\n[${label}] translation key mismatch:`);
  if (missing.length > 0) {
    console.error(`  Missing (${missing.length}):`);
    for (const key of missing) console.error(`    - ${key}`);
  }
  if (extra.length > 0) {
    console.error(`  Extra (${extra.length}):`);
    for (const key of extra) console.error(`    - ${key}`);
  }
  return true;
}

function checkTsDictionary(): boolean {
  const source = flatten(dictionaries.en);
  const sourceKeys = new Set(Object.keys(source));
  let hasError = false;
  for (const [locale, dict] of Object.entries(dictionaries)) {
    if (locale === "en") continue;
    const currentKeys = new Set(Object.keys(flatten(dict)));
    if (compareToBaseline(`ts:${locale}`, sourceKeys, currentKeys)) hasError = true;
  }
  return hasError;
}

function checkJsonMessages(): boolean {
  // Resolve `messages/` relative to repo root (this script lives in scripts/i18n/).
  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(here, "..", "..");
  const dir = join(repoRoot, "messages");
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch (err) {
    console.error(`Could not read ${dir}:`, err);
    return true;
  }
  if (!files.includes("en.json")) {
    console.error(`messages/en.json missing — cannot run JSON parity check.`);
    return true;
  }
  const baseline = flatten(JSON.parse(readFileSync(join(dir, "en.json"), "utf8")));
  const baselineKeys = new Set(Object.keys(baseline));
  let hasError = false;
  for (const file of files) {
    if (file === "en.json") continue;
    const locale = basename(file, ".json");
    const currentKeys = new Set(
      Object.keys(flatten(JSON.parse(readFileSync(join(dir, file), "utf8"))))
    );
    if (compareToBaseline(`json:${locale}`, baselineKeys, currentKeys)) hasError = true;
  }
  return hasError;
}

function main() {
  const tsErr = checkTsDictionary();
  const jsonErr = checkJsonMessages();
  if (tsErr || jsonErr) {
    process.exitCode = 1;
    return;
  }
  console.log("i18n parity check passed: ts dictionary + messages/*.json match the English keyset.");
}

main();

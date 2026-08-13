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

// Default: measured worst-case (fr) is 0.068 as of 2026-08. 0.35 leaves a wide
// margin above every locale's current legitimate-clone rate (short strings like
// "Protein", "%", "TJAI", "kg" are identical across locales for good reason) so
// this stays green today; it only trips if a locale regresses toward "never
// actually translated."
const DEFAULT_MAX_EN_CLONE_RATIO = 0.35;

function parseMaxEnCloneRatio(argv: string[]): number {
  const flag = "--max-en-clone-ratio";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === flag && argv[i + 1] !== undefined) {
      const parsed = Number(argv[i + 1]);
      if (!Number.isNaN(parsed)) return parsed;
    }
    if (arg?.startsWith(`${flag}=`)) {
      const parsed = Number(arg.slice(flag.length + 1));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return DEFAULT_MAX_EN_CLONE_RATIO;
}

/**
 * Value-level pass: for each non-EN locale, how many leaf strings are
 * byte-identical to the EN value? Identical values are often legitimate
 * (brand names, units, short symbols), so this WARNS by default and only
 * fails the build when a locale's identical-value ratio exceeds
 * `maxRatio` — a sign the locale was never actually translated.
 */
function checkEnClones(maxRatio: number): boolean {
  const source = flatten(dictionaries.en);
  const stringKeys = Object.keys(source).filter((k) => typeof source[k] === "string");
  let hasError = false;

  console.log(`\n[en-clone] value-level EN-clone check (threshold: ${maxRatio}):`);
  for (const [locale, dict] of Object.entries(dictionaries)) {
    if (locale === "en") continue;
    const current = flatten(dict);
    const clones = stringKeys.filter((k) => current[k] === source[k]);
    const ratio = stringKeys.length === 0 ? 0 : clones.length / stringKeys.length;
    const over = ratio > maxRatio;
    const status = over ? "FAIL" : "ok";
    console.log(
      `  [${status}] ${locale}: ${clones.length}/${stringKeys.length} identical to EN (ratio ${ratio.toFixed(3)})`
    );
    if (clones.length > 0) {
      const label = over ? "worst offenders" : "sample identical values (often legitimate)";
      console.log(`    ${label} (top ${Math.min(10, clones.length)}):`);
      for (const key of clones.slice(0, 10)) {
        console.log(`      - ${key}: ${JSON.stringify(source[key])}`);
      }
    }
    if (over) hasError = true;
  }
  return hasError;
}

function main() {
  const maxRatio = parseMaxEnCloneRatio(process.argv.slice(2));
  const tsErr = checkTsDictionary();
  const cloneErr = checkEnClones(maxRatio);
  if (tsErr || cloneErr) {
    process.exitCode = 1;
    return;
  }
  console.log("\ni18n parity check passed: ts dictionary locales match the English keyset.");
}

main();

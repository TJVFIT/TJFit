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

function main() {
  const source = flatten(dictionaries.en);
  const sourceKeys = new Set(Object.keys(source));
  let hasError = false;

  for (const [locale, dict] of Object.entries(dictionaries)) {
    if (locale === "en") continue;
    const current = flatten(dict);
    const currentKeys = new Set(Object.keys(current));

    const missing = [...sourceKeys].filter((k) => !currentKeys.has(k));
    const extra = [...currentKeys].filter((k) => !sourceKeys.has(k));

    if (missing.length > 0 || extra.length > 0) {
      hasError = true;
      console.error(`\n[${locale}] translation key mismatch:`);
      if (missing.length > 0) {
        console.error(`  Missing (${missing.length}):`);
        for (const key of missing) console.error(`    - ${key}`);
      }
      if (extra.length > 0) {
        console.error(`  Extra (${extra.length}):`);
        for (const key of extra) console.error(`    - ${key}`);
      }
    }
  }

  if (hasError) {
    process.exitCode = 1;
    return;
  }

  console.log("i18n parity check passed: all locales match the English keyset.");
}

main();


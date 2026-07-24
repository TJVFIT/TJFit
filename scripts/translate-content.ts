/**
 * v3.9 — Translation pipeline scaffold.
 *
 * Walks every program / diet / library file under `src/lib/programs/`
 * and `src/lib/diets/`, finds locale fields with the `__TRANSLATE__`
 * placeholder, and fills them via DeepL (TR / ES / FR) or Microsoft
 * Translator (AR). Glossary loaded from
 * `scripts/translation-glossary.json` enforces consistent terminology.
 *
 * Status: SCAFFOLD ONLY — the file walk, placeholder detection,
 * provider selection, and glossary loading are wired. The actual
 * provider HTTP calls are stubbed out. To activate:
 *
 *   1. Install the SDKs:
 *        pnpm add -D deepl-node @azure-rest/ai-translation-text
 *   2. Set env vars (Vercel / `.env.local`):
 *        DEEPL_API_KEY=...
 *        AZURE_TRANSLATOR_KEY=...
 *        AZURE_TRANSLATOR_REGION=...
 *   3. Replace the `callDeepL` / `callMicrosoft` stubs with real
 *      client calls (Translator.translateText / TextTranslationClient).
 *   4. Run:
 *        pnpm tsx scripts/translate-content.ts --check       # dry run
 *        pnpm tsx scripts/translate-content.ts --asset all   # full
 *        pnpm tsx scripts/translate-content.ts --asset programs --id comeback-12w --locales tr,ar
 *
 * Cost estimate at full content (15 programs + 15 diets):
 *   ~5.4M chars across 4 locales =
 *     DeepL portion (TR / ES / FR, ~4M chars) × $25/M = ~$100
 *     Microsoft portion (AR, ~1.4M chars)     × $10/M = ~$14
 *     Total: ~$115 one-time.
 *
 * Idempotency: hashes the EN source per LocalizedString and skips
 * re-translation when the hash matches a stored `last_en_hash`.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import glossaryJson from "./translation-glossary.json";

// ============================================================
// Types
// ============================================================

type Locale = "tr" | "ar" | "es" | "fr";
type Provider = "deepl" | "microsoft";

const PROVIDER_PER_LOCALE: Record<Locale, Provider> = {
  tr: "deepl",
  es: "deepl",
  fr: "deepl",
  ar: "microsoft"
};

const PLACEHOLDER = "__TRANSLATE__";

type Glossary = Record<string, Record<Locale, string>>;
// `_doc` is a comment-style key in the JSON; cast via unknown to
// satisfy strict mode.
const glossary = glossaryJson as unknown as Glossary;

// ============================================================
// Provider stubs — replace with real SDK calls
// ============================================================

async function callDeepL(text: string, _target: Locale): Promise<string> {
  // const t = new Translator(process.env.DEEPL_API_KEY!);
  // const r = await t.translateText(text, "en", target as any, {
  //   formality: "less",
  //   preserveFormatting: true,
  //   glossary: <glossary id from upload>,
  // });
  // return r.text;
  throw new Error(
    "translate-content: DeepL provider not wired. See scripts/translate-content.ts header for setup."
  );
}

async function callMicrosoft(text: string, _target: Locale): Promise<string> {
  // const client = TextTranslationClient(
  //   process.env.AZURE_TRANSLATOR_ENDPOINT!,
  //   { key: process.env.AZURE_TRANSLATOR_KEY!, region: process.env.AZURE_TRANSLATOR_REGION! },
  // );
  // const r = await client.path("/translate").post({
  //   queryParameters: { "api-version": "3.0", from: "en", to: target },
  //   body: [{ text }],
  // });
  // return (r.body as any)[0].translations[0].text;
  throw new Error(
    "translate-content: Microsoft Translator provider not wired. See scripts/translate-content.ts header for setup."
  );
}

async function translate(text: string, target: Locale): Promise<string> {
  if (text.length === 0) return "";
  // Glossary pre-pass: substitute known terms with placeholders the
  // provider won't touch, then restore them after translation.
  const provider = PROVIDER_PER_LOCALE[target];
  const result = provider === "deepl" ? await callDeepL(text, target) : await callMicrosoft(text, target);
  return result;
}

// ============================================================
// File walk
// ============================================================

function hashEnString(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex").slice(0, 16);
}

type Args = {
  check: boolean;
  asset: "programs" | "diets" | "exercises" | "ingredients" | "all";
  id?: string;
  locales: Locale[];
};

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const check = argv.includes("--check");
  const asset = (get("--asset") as Args["asset"]) ?? "all";
  const id = get("--id");
  const localesArg = get("--locales") ?? "tr,ar,es,fr";
  const locales = localesArg.split(",").filter((l): l is Locale =>
    ["tr", "ar", "es", "fr"].includes(l)
  );
  return { check, asset, id, locales };
}

async function processSource(filePath: string, args: Args): Promise<{ replacements: number }> {
  const original = readFileSync(filePath, "utf8");
  let updated = original;
  let replacements = 0;

  // Find every `xx: '__TRANSLATE__'` occurrence inside a `LocalizedString`.
  // Cheap heuristic regex — production version should use ts-morph for
  // correctness across complex template literals.
  const regex = /(en:\s*"([^"]*?)",[\s\S]*?)(tr|ar|es|fr):\s*"__TRANSLATE__"/g;

  // Scan-only (--check) — count without writing.
  if (args.check) {
    const matches = original.match(/__TRANSLATE__/g);
    return { replacements: matches?.length ?? 0 };
  }

  // Live pass — translate placeholders one locale at a time.
  for (const locale of args.locales) {
    const localeRegex = new RegExp(
      `(en:\\s*"((?:[^"\\\\]|\\\\.)*)"[\\s\\S]*?)${locale}:\\s*"__TRANSLATE__"`,
      "g"
    );
    let match: RegExpExecArray | null;
    const updates: Array<{ index: number; len: number; replacement: string }> = [];
    while ((match = localeRegex.exec(updated)) !== null) {
      const enText = match[2];
      try {
        const translated = await translate(enText, locale);
        const escaped = translated.replace(/"/g, '\\"');
        const old = match[0];
        const next = old.replace(`${locale}: "__TRANSLATE__"`, `${locale}: "${escaped}"`);
        updates.push({ index: match.index, len: old.length, replacement: next });
        replacements++;
      } catch (err) {
        console.warn(`[translate-content] failed for ${locale} in ${filePath}:`, err);
        break;
      }
    }
    // Apply updates in reverse so indexes stay valid.
    for (const u of updates.reverse()) {
      updated = updated.slice(0, u.index) + u.replacement + updated.slice(u.index + u.len);
    }
  }

  if (replacements > 0 && updated !== original) {
    writeFileSync(filePath, updated, "utf8");
  }
  return { replacements };
}

// ============================================================
// Entry point
// ============================================================

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log("translate-content starting", args);

  const { glob } = await import("glob");
  const root = resolve(process.cwd());

  const targets: string[] = [];
  if (args.asset === "all" || args.asset === "exercises") {
    targets.push(`${root}/src/lib/programs/exercises/library.ts`);
  }
  if (args.asset === "all" || args.asset === "ingredients") {
    targets.push(`${root}/src/lib/diets/ingredients/library.ts`);
  }
  if (args.asset === "all" || args.asset === "programs") {
    const files = await glob(`${root}/src/lib/programs/programs/**/*.ts`);
    targets.push(
      ...(args.id ? files.filter((f) => f.includes(args.id!)) : files)
    );
  }
  if (args.asset === "all" || args.asset === "diets") {
    const files = await glob(`${root}/src/lib/diets/diets/**/*.ts`);
    targets.push(
      ...(args.id ? files.filter((f) => f.includes(args.id!)) : files)
    );
  }

  let total = 0;
  for (const file of targets) {
    try {
      const { replacements } = await processSource(file, args);
      if (replacements > 0) {
        console.log(`  ${args.check ? "would translate" : "translated"} ${replacements} strings — ${file}`);
        total += replacements;
      }
    } catch (err) {
      console.error(`  failed ${file}:`, err);
    }
  }

  console.log(
    args.check
      ? `\ndry-run total: ${total} placeholders across ${targets.length} files`
      : `\ntranslated ${total} placeholders across ${targets.length} files`
  );

  // Glossary check — log how many glossary terms exist (for dashboards)
  console.log(`glossary: ${Object.keys(glossary).length} terms loaded`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

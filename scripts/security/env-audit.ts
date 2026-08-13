// WP-SEC-08 — env-var audit: every `process.env.NAME` read in the app must
// be documented in .env.example, and every documented key should be read
// SOMEWHERE (or explicitly allowlisted as an implicit consumer).
//
// What it does: walks src/ + scripts/ + the root config files that read env
// vars at build/instrumentation time (next.config.mjs, sentry.*.config.ts,
// instrumentation-client.ts, instrumentation.ts), regex-scans for
// `process.env.NAME`, strips comments first (a var only ever mentioned in a
// // comment or a code sample is not a real read), and diffs the result
// against the keys declared in .env.example.
//
//   (a) used but undocumented  → FAIL (exit 1): someone added a real env
//       read without updating .env.example, so a fresh deploy silently runs
//       with that var unset and undocumented.
//   (b) documented but never read → WARN only: some keys are consumed
//       implicitly (build plugins, hosting platform) rather than via a
//       literal `process.env.NAME` in this repo — see DOCUMENTED_IMPLICIT
//       below — and Vercel/Next builtins are always "used" even when this
//       particular checkout doesn't reference them.
//
// Usage:
//   npm run env:audit
//   npx tsx scripts/security/env-audit.ts

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const ENV_EXAMPLE_PATH = path.join(ROOT, ".env.example");

const SCAN_DIRS = ["src", "scripts"];
const SCAN_ROOT_FILES = [
  "next.config.mjs",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
  "sentry.client.config.ts",
  "instrumentation.ts",
  "instrumentation-client.ts"
];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".js"]);

/**
 * Keys read implicitly rather than via a literal `process.env.NAME` in this
 * repo, each with a reason. Documented-but-unread for these is expected, not
 * a gap — keep this list reviewed, not just appended to.
 */
const DOCUMENTED_IMPLICIT: Record<string, string> = {
  SENTRY_ORG: "read by the @sentry/nextjs build-time webpack plugin (withSentryConfig), not application code",
  SENTRY_PROJECT: "read by the @sentry/nextjs build-time webpack plugin (withSentryConfig), not application code"
};

/**
 * Vercel/Next platform builtins: always present in that environment, never
 * declared in .env.example, and a real read of one is not a documentation
 * gap.
 */
const PLATFORM_BUILTINS = new Set([
  "NODE_ENV",
  "NEXT_RUNTIME",
  "CI",
  "NO_COLOR",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_GIT_COMMIT_SHA",
  "VERCEL_GIT_COMMIT_REF",
  "VERCEL_REGION"
]);

export type AuditReport = {
  usedUndocumented: string[];
  documentedUnread: string[];
  documentedUnreadAllowlisted: Array<{ key: string; reason: string }>;
};

/** Strip `//` line comments and `/* *\/` block comments so commented-out
 * sample code (e.g. `// process.env.SOME_KEY`) never counts as a real read.
 * Deliberately simple (no string-literal awareness) — false negatives here
 * just mean a real read hides in a string, which is not how env vars are
 * read in this codebase.
 */
export function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

export function extractEnvReads(source: string): Set<string> {
  const code = stripComments(source);
  const keys = new Set<string>();
  const re = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) keys.add(m[1]);
  return keys;
}

export function parseEnvExampleKeys(source: string): Set<string> {
  const keys = new Set<string>();
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^([A-Z_][A-Z0-9_]*)=/.exec(line);
    if (m) keys.add(m[1]);
  }
  return keys;
}

/** Pure diff — takes the two key sets and produces the report. Kept
 * side-effect-free so it can be unit tested without touching the filesystem.
 */
export function diffEnvUsage(usedKeys: Set<string>, documentedKeys: Set<string>): AuditReport {
  const usedUndocumented: string[] = [];
  for (const key of usedKeys) {
    if (documentedKeys.has(key)) continue;
    if (PLATFORM_BUILTINS.has(key)) continue;
    usedUndocumented.push(key);
  }

  const documentedUnread: string[] = [];
  const documentedUnreadAllowlisted: Array<{ key: string; reason: string }> = [];
  for (const key of documentedKeys) {
    if (usedKeys.has(key)) continue;
    const reason = DOCUMENTED_IMPLICIT[key];
    if (reason) {
      documentedUnreadAllowlisted.push({ key, reason });
    } else {
      documentedUnread.push(key);
    }
  }

  usedUndocumented.sort();
  documentedUnread.sort();
  documentedUnreadAllowlisted.sort((a, b) => a.key.localeCompare(b.key));

  return { usedUndocumented, documentedUnread, documentedUnreadAllowlisted };
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      out.push(...walkFiles(full));
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function collectUsedKeys(): Set<string> {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) files.push(...walkFiles(path.join(ROOT, dir)));
  for (const file of SCAN_ROOT_FILES) {
    const full = path.join(ROOT, file);
    if (fs.existsSync(full)) files.push(full);
  }

  const used = new Set<string>();
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const key of extractEnvReads(source)) used.add(key);
  }
  return used;
}

function main() {
  const usedKeys = collectUsedKeys();
  const envExampleSource = fs.readFileSync(ENV_EXAMPLE_PATH, "utf8").replace(/^﻿/, "");
  const documentedKeys = parseEnvExampleKeys(envExampleSource);

  const report = diffEnvUsage(usedKeys, documentedKeys);

  console.log(
    `env-audit: ${usedKeys.size} env var(s) read, ${documentedKeys.size} documented in .env.example`
  );

  if (report.documentedUnreadAllowlisted.length > 0) {
    console.log(`\n${report.documentedUnreadAllowlisted.length} documented key(s) read implicitly (allowlisted, OK):`);
    for (const { key, reason } of report.documentedUnreadAllowlisted) {
      console.log(`  ${key} — ${reason}`);
    }
  }

  if (report.documentedUnread.length > 0) {
    console.log(`\nWARN: ${report.documentedUnread.length} documented key(s) not read anywhere in src/ or scripts/:`);
    for (const key of report.documentedUnread) console.log(`  ${key}`);
  }

  if (report.usedUndocumented.length > 0) {
    console.error(
      `\nFAIL: ${report.usedUndocumented.length} env var(s) read in code but missing from .env.example:`
    );
    for (const key of report.usedUndocumented) console.error(`  ${key}`);
    console.error("\nAdd each one to .env.example with a comment explaining what it does and where to get it.");
    process.exit(1);
  }

  console.log("\nPASS: every env var read in code is documented in .env.example.");
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main();
}

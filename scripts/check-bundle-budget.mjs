// Bundle budget gate (WP-INFRA-01). Parses `next build` output and fails CI
// when a budgeted route's First Load JS exceeds its ceiling.
//
// Budgets are REGRESSION GUARDS set just above the measured 2026-08-13 values
// (post WP-INFRA-02/03 splits: /ai 309kB, /progress 269kB, homepage 256kB).
// Ratchet them DOWN as WP-INFRA-04 lands shared-chunk cuts; never raise one
// without a comment explaining what grew and why that's accepted.
//
// Parsing the human route table is deliberate: Next is pinned to 14.x forever
// on this stack (see CLAUDE.md), so the format is stable here.
//
// Usage: node scripts/check-bundle-budget.mjs <build-log-file>

import { readFileSync } from "node:fs";

const BUDGETS_KB = {
  "/[locale]": 260,
  "/[locale]/ai": 315,
  "/[locale]/progress": 275
};

const logPath = process.argv[2];
if (!logPath) {
  console.error("usage: node scripts/check-bundle-budget.mjs <build-log-file>");
  process.exit(2);
}

// Strip ANSI first: picocolors force-enables color whenever CI=true (even
// piped, no TTY — verified in picocolors' isColorSupported), so GitHub
// Actions logs arrive color-wrapped and the regex would never match.
// eslint-disable-next-line no-control-regex
const log = readFileSync(logPath, "utf8").replace(/\x1b\[[0-9;]*m/g, "");
const failures = [];
const seen = new Set();

for (const line of log.split(/\r?\n/)) {
  // e.g. "├ ● /[locale]/ai        121 kB     309 kB"
  const m = line.match(/[○●ƒ]\s+(\/\S+)\s+[\d.]+\s*k?B\s+([\d.]+)\s*(B|kB|MB)\s*$/);
  if (!m) continue;
  const [, route, num, unit] = m;
  if (!(route in BUDGETS_KB)) continue;
  seen.add(route);
  const kb = unit === "MB" ? Number(num) * 1024 : unit === "B" ? Number(num) / 1024 : Number(num);
  const budget = BUDGETS_KB[route];
  const verdict = kb <= budget ? "ok" : "OVER";
  console.log(`budget ${route}: ${kb.toFixed(1)} kB / ${budget} kB — ${verdict}`);
  if (kb > budget) failures.push(`${route} first-load ${kb.toFixed(1)} kB exceeds budget ${budget} kB`);
}

for (const route of Object.keys(BUDGETS_KB)) {
  if (!seen.has(route)) failures.push(`${route} not found in build output — table format changed or route removed; update this gate`);
}

if (failures.length > 0) {
  console.error("\nBUNDLE BUDGET FAILURES:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("bundle budgets: all within limits");

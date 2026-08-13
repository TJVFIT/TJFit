// WP-DATABASE-10 — migration-drift check: repo files vs the prod applied-ledger.
//
// The bug class this gates (live example, 2026-08-13): the repo file
// `20260724120000_gumroad_subscription_and_refund.sql` is recorded in prod's
// ledger as version `20260812235929` — same name, different version — because
// it was applied on a later date via MCP rather than `supabase db push`. A
// repo whose filenames disagree with the ledger can silently re-apply, skip,
// or mis-order migrations on the next tooling change.
//
// What it does: lists supabase/migrations/*.sql, fetches the applied ledger
// (Supabase Management API, read-only PAT), classifies every discrepancy, and
// fails on any finding NOT recorded in the checked-in baseline
// (docs/claude/migration-drift-baseline.json). The baseline is the dated,
// annotated record of historical drift — new drift is what CI blocks.
//
// Usage:
//   npm run db:drift                        (env: SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF)
//   npx tsx scripts/db/check-migration-drift.ts --ledger-file <path.json>
//   npx tsx scripts/db/check-migration-drift.ts --ledger-file <path.json> --write-baseline
//
// --write-baseline regenerates the baseline from the CURRENT state. That is
// an explicit accept-everything action: only run it after reading the report
// and annotating the entries (owner-reviewed), never to silence a red CI.

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

export type MigrationRef = { version: string; name: string };

export type DriftFinding = {
  /** Stable identity string — what the baseline matches on. */
  id: string;
  kind: "name_mismatch" | "version_mismatch" | "repo_only" | "ledger_only";
  detail: string;
};

export type DriftReport = {
  matched: number;
  findings: DriftFinding[];
};

export type Baseline = {
  generated: string;
  note: string;
  accepted: Array<{ id: string; note?: string }>;
};

/** Windows editors and PowerShell redirects love writing a UTF-8 BOM; JSON.parse does not. */
function readJsonFile<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")) as T;
}

export function parseMigrationFilename(filename: string): MigrationRef | null {
  const m = /^(\d{14})_(.+)\.sql$/.exec(filename);
  if (!m) return null;
  return { version: m[1], name: m[2] };
}

/**
 * Baseline matching is exact-string on these ids, so every free-form
 * component is percent-encoded — otherwise a ":" or "->" inside a ledger
 * name could make two DIFFERENT findings share one id, and a reviewed
 * baseline entry would silently green-light unreviewed drift. Encoding is a
 * no-op for well-formed inputs (digits / [a-z0-9_]), which keeps existing
 * baseline ids stable.
 */
const enc = encodeURIComponent;

/**
 * Pure comparator. Matching rules, in order:
 *   1. same version, same name        → matched
 *   2. same version, different name   → name_mismatch (paired one-to-one;
 *      duplicate versions on either side never share a ledger row — the
 *      leftovers fall through to rules 3-5)
 *   3. version missing on one side but the name uniquely present on the
 *      other (among the still-unmatched)  → version_mismatch
 *   4. leftover repo file             → repo_only  (authored, never applied)
 *   5. leftover ledger entry          → ledger_only (applied, no repo file)
 */
export function classifyDrift(repo: MigrationRef[], ledger: MigrationRef[]): DriftReport {
  const findings: DriftFinding[] = [];
  let matched = 0;

  // Multimap by version: directory listings and ledgers can both carry
  // duplicate versions (clock-skew authoring, hand-applied entries), so a
  // plain Map would silently drop rows or double-consume one ledger row.
  const groupByVersion = (refs: MigrationRef[]) => {
    const m = new Map<string, MigrationRef[]>();
    for (const r of refs) {
      const bucket = m.get(r.version);
      if (bucket) bucket.push(r);
      else m.set(r.version, [r]);
    }
    return m;
  };
  const repoByVersion = groupByVersion(repo);
  const ledgerByVersion = groupByVersion(ledger);

  const unmatchedRepo: MigrationRef[] = [];
  const unmatchedLedger: MigrationRef[] = [];

  const versions = new Set([...repoByVersion.keys(), ...ledgerByVersion.keys()]);
  for (const version of versions) {
    const rs = [...(repoByVersion.get(version) ?? [])];
    const ls = [...(ledgerByVersion.get(version) ?? [])];

    // Exact name matches first — each consumes exactly one row per side.
    for (let i = rs.length - 1; i >= 0; i--) {
      const j = ls.findIndex((l) => l.name === rs[i].name);
      if (j !== -1) {
        matched += 1;
        rs.splice(i, 1);
        ls.splice(j, 1);
      }
    }
    // Same version, different name: pair the leftovers one-to-one.
    while (rs.length > 0 && ls.length > 0) {
      const r = rs.shift() as MigrationRef;
      const l = ls.shift() as MigrationRef;
      findings.push({
        id: `name_mismatch:${enc(r.version)}:${enc(r.name)}!=${enc(l.name)}`,
        kind: "name_mismatch",
        detail: `version ${r.version} is named "${r.name}" in the repo but "${l.name}" in the ledger`
      });
    }
    unmatchedRepo.push(...rs);
    unmatchedLedger.push(...ls);
  }
  const countNames = (refs: MigrationRef[]) => {
    const c = new Map<string, number>();
    for (const x of refs) c.set(x.name, (c.get(x.name) ?? 0) + 1);
    return c;
  };
  const repoNameCounts = countNames(unmatchedRepo);
  const ledgerNameCounts = countNames(unmatchedLedger);
  // Track consumed ledger ROWS by identity, not by version — leftover
  // duplicate versions are distinct rows and each must be accounted for.
  const pairedLedgerRows = new Set<MigrationRef>();

  for (const r of unmatchedRepo) {
    const candidates = unmatchedLedger.filter(
      (l) => l.name === r.name && !pairedLedgerRows.has(l)
    );
    // Only pair when the name is unambiguous on both sides.
    if (candidates.length === 1 && repoNameCounts.get(r.name) === 1 && ledgerNameCounts.get(r.name) === 1) {
      const l = candidates[0];
      pairedLedgerRows.add(l);
      findings.push({
        id: `version_mismatch:${enc(r.name)}:${enc(r.version)}->${enc(l.version)}`,
        kind: "version_mismatch",
        detail: `"${r.name}" is file version ${r.version} but was applied to prod as ${l.version}`
      });
    } else {
      findings.push({
        id: `repo_only:${enc(r.version)}:${enc(r.name)}`,
        kind: "repo_only",
        detail: `repo file ${r.version}_${r.name}.sql has no entry in the applied ledger (authored but never applied)`
      });
    }
  }

  for (const l of unmatchedLedger) {
    if (pairedLedgerRows.has(l)) continue;
    findings.push({
      id: `ledger_only:${enc(l.version)}:${enc(l.name)}`,
      kind: "ledger_only",
      detail: `ledger entry ${l.version} "${l.name}" has no repo file (applied outside the repo's migration set)`
    });
  }

  return { matched, findings };
}

export function splitAgainstBaseline(report: DriftReport, baseline: Baseline | null) {
  const accepted = new Map((baseline?.accepted ?? []).map((a) => [a.id, a]));
  const known: DriftFinding[] = [];
  const fresh: DriftFinding[] = [];
  for (const f of report.findings) (accepted.has(f.id) ? known : fresh).push(f);
  // Baseline entries that no longer occur — stale, worth pruning but not fatal.
  const stale = [...accepted.keys()].filter((id) => !report.findings.some((f) => f.id === id));
  return { known, fresh, stale };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const BASELINE_PATH = path.join(process.cwd(), "docs", "claude", "migration-drift-baseline.json");

function readRepoMigrations(): MigrationRef[] {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => {
      const ref = parseMigrationFilename(f);
      if (!ref) throw new Error(`unparseable migration filename: ${f}`);
      return ref;
    })
    .sort((a, b) => a.version.localeCompare(b.version));
}

async function fetchLedger(): Promise<MigrationRef[]> {
  const argIdx = process.argv.indexOf("--ledger-file");
  if (argIdx !== -1) {
    const file = process.argv[argIdx + 1];
    if (!file) throw new Error("--ledger-file needs a path");
    const raw = readJsonFile<{ migrations?: unknown } | unknown[]>(file);
    const list = Array.isArray(raw) ? raw : (raw as { migrations?: unknown }).migrations;
    if (!Array.isArray(list)) throw new Error("ledger file must be an array or {migrations:[...]}");
    return list.map((m: { version: string; name?: string }) => ({
      version: String(m.version),
      name: String(m.name ?? "")
    }));
  }

  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = process.env.SUPABASE_PROJECT_REF;
  if (!token || !ref) {
    throw new Error(
      "set SUPABASE_ACCESS_TOKEN (read-only PAT) + SUPABASE_PROJECT_REF, or pass --ledger-file"
    );
  }
  // Management API: GET /v1/projects/{ref}/database/migrations
  // (docs: reference/api/v1-list-migration-history)
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/migrations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Management API ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as Array<{ version: string; name?: string }>;
  return body.map((m) => ({ version: String(m.version), name: String(m.name ?? "") }));
}

function readBaseline(): Baseline | null {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  return readJsonFile<Baseline>(BASELINE_PATH);
}

async function main() {
  const repo = readRepoMigrations();
  const ledger = await fetchLedger();
  const report = classifyDrift(repo, ledger);

  if (process.argv.includes("--write-baseline")) {
    const existing = readBaseline();
    const notes = new Map((existing?.accepted ?? []).map((a) => [a.id, a.note]));
    const baseline: Baseline = {
      generated: new Date().toISOString().slice(0, 10),
      note:
        "Accepted historical migration drift. Every entry is a KNOWN discrepancy between repo filenames and the prod applied-ledger. New drift is not added here to silence CI — it is reconciled (supabase migration repair) or explicitly owner-accepted with a note.",
      accepted: report.findings.map((f) => ({
        id: f.id,
        note: notes.get(f.id) ?? "accepted as historical on baseline regeneration"
      }))
    };
    fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + "\n");
    console.log(`baseline written: ${report.findings.length} accepted finding(s) -> ${BASELINE_PATH}`);
    return;
  }

  const { known, fresh, stale } = splitAgainstBaseline(report, readBaseline());
  console.log(
    `migration-drift: ${report.matched} matched, ${known.length} known-historical, ${fresh.length} new, ${stale.length} stale baseline entr(ies)`
  );
  for (const f of fresh) console.log(`  NEW ${f.kind}: ${f.detail}`);
  for (const id of stale) console.log(`  stale baseline entry (no longer occurs, prune it): ${id}`);

  if (fresh.length > 0) {
    console.error(
      `\nFAIL: ${fresh.length} new drift finding(s). Reconcile the migration (supabase migration repair / re-author the file) or owner-accept it into ${path.relative(process.cwd(), BASELINE_PATH)} with a note.`
    );
    process.exit(1);
  }
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(String(err instanceof Error ? err.message : err));
    process.exit(1);
  });
}

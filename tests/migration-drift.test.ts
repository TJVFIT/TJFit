import { describe, it, expect } from "vitest";

import {
  classifyDrift,
  splitAgainstBaseline,
  parseMigrationFilename,
  type Baseline
} from "../scripts/db/check-migration-drift";

/**
 * WP-DATABASE-10 — the comparator behind scripts/db/check-migration-drift.ts.
 * The proof case is real, present-day drift: repo file
 * 20260724120000_gumroad_subscription_and_refund.sql sits in prod's ledger as
 * version 20260812235929 (applied 2026-08-13 via MCP, ledger stamped the
 * apply-time version). The check must flag it raw and pass only because the
 * checked-in baseline explicitly accepts it.
 */

describe("parseMigrationFilename", () => {
  it("splits version and name, rejects non-migrations", () => {
    expect(parseMigrationFilename("20260724120000_gumroad_subscription_and_refund.sql")).toEqual({
      version: "20260724120000",
      name: "gumroad_subscription_and_refund"
    });
    expect(parseMigrationFilename("README.md")).toBeNull();
    expect(parseMigrationFilename("2026_bad.sql")).toBeNull();
  });
});

describe("classifyDrift", () => {
  const ref = (version: string, name: string) => ({ version, name });

  it("flags the real 20260724120000 -> 20260812235929 proof case as version_mismatch", () => {
    const report = classifyDrift(
      [ref("20260718111537", "argefabrika_form_tables"), ref("20260724120000", "gumroad_subscription_and_refund")],
      [ref("20260718111537", "argefabrika_form_tables"), ref("20260812235929", "gumroad_subscription_and_refund")]
    );
    expect(report.matched).toBe(1);
    expect(report.findings).toEqual([
      expect.objectContaining({
        kind: "version_mismatch",
        id: "version_mismatch:gumroad_subscription_and_refund:20260724120000->20260812235929"
      })
    ]);
  });

  it("classifies all four drift kinds", () => {
    const report = classifyDrift(
      [
        ref("1000", "same"), // matched
        ref("2000", "repo_name"), // name_mismatch (ledger has 2000 under another name)
        ref("3000", "never_applied"), // repo_only
        ref("4000", "moved") // version_mismatch (ledger has it as 4500)
      ],
      [ref("1000", "same"), ref("2000", "ledger_name"), ref("4500", "moved"), ref("5000", "hotfix")]
    );
    expect(report.matched).toBe(1);
    const kinds = report.findings.map((f) => f.kind).sort();
    expect(kinds).toEqual(["ledger_only", "name_mismatch", "repo_only", "version_mismatch"]);
  });

  it("does not pair ambiguous names (duplicates fall back to repo_only/ledger_only)", () => {
    const report = classifyDrift(
      [ref("1000", "dup"), ref("2000", "dup")],
      [ref("3000", "dup")]
    );
    // Two repo candidates for one ledger name — pairing would be a guess.
    expect(report.findings.map((f) => f.kind).sort()).toEqual([
      "ledger_only",
      "repo_only",
      "repo_only"
    ]);
  });

  it("duplicate repo versions: the second file is repo_only, not a phantom rename of a matched row", () => {
    // Slophunter defect #1: two repo files sharing a timestamp must not both
    // consume the single ledger row for that version.
    const report = classifyDrift(
      [ref("1000", "a"), ref("1000", "b")],
      [ref("1000", "a")]
    );
    expect(report.matched).toBe(1);
    expect(report.findings).toEqual([
      expect.objectContaining({ kind: "repo_only", id: "repo_only:1000:b" })
    ]);
  });

  it("duplicate ledger versions: the exact match still counts and the extra row surfaces as ledger_only", () => {
    // Slophunter defect #2: a Map keyed on version silently dropped all but
    // the last ledger row per version.
    const report = classifyDrift(
      [ref("1000", "a")],
      [ref("1000", "a"), ref("1000", "z_ghost_entry")]
    );
    expect(report.matched).toBe(1);
    expect(report.findings).toEqual([
      expect.objectContaining({ kind: "ledger_only", id: "ledger_only:1000:z_ghost_entry" })
    ]);
  });

  it("finding ids are collision-resistant against delimiter characters in ledger data", () => {
    // Slophunter defect #3: {version:"1", name:"2:3"} and {version:"1:2",
    // name:"3"} must never share an id, or one reviewed baseline entry would
    // green-light a different, unreviewed drift.
    const a = classifyDrift([], [ref("1", "2:3")]).findings[0];
    const b = classifyDrift([], [ref("1:2", "3")]).findings[0];
    expect(a.id).not.toBe(b.id);
    // and well-formed inputs keep their legacy plain-text ids (baseline stability)
    const clean = classifyDrift([], [ref("20260718111537", "argefabrika_form_tables")]).findings[0];
    expect(clean.id).toBe("ledger_only:20260718111537:argefabrika_form_tables");
  });

  it("reports zero findings when repo and ledger agree exactly", () => {
    const both = [ref("1000", "a"), ref("2000", "b")];
    const report = classifyDrift(both, both);
    expect(report.matched).toBe(2);
    expect(report.findings).toEqual([]);
  });
});

describe("splitAgainstBaseline", () => {
  const finding = {
    id: "version_mismatch:gumroad_subscription_and_refund:20260724120000->20260812235929",
    kind: "version_mismatch" as const,
    detail: "proof case"
  };

  it("without a baseline, every finding is fresh (the raw check FAILS on the proof case)", () => {
    const { fresh, known } = splitAgainstBaseline({ matched: 0, findings: [finding] }, null);
    expect(fresh).toEqual([finding]);
    expect(known).toEqual([]);
  });

  it("a baseline entry downgrades the finding to known-historical (the gated check passes)", () => {
    const baseline: Baseline = {
      generated: "2026-08-13",
      note: "",
      accepted: [{ id: finding.id, note: "applied via MCP 2026-08-13" }]
    };
    const { fresh, known, stale } = splitAgainstBaseline({ matched: 0, findings: [finding] }, baseline);
    expect(fresh).toEqual([]);
    expect(known).toEqual([finding]);
    expect(stale).toEqual([]);
  });

  it("baseline entries that no longer occur surface as stale, not as passes", () => {
    const baseline: Baseline = {
      generated: "2026-08-13",
      note: "",
      accepted: [{ id: "repo_only:9999:gone" }]
    };
    const { fresh, known, stale } = splitAgainstBaseline({ matched: 1, findings: [] }, baseline);
    expect(fresh).toEqual([]);
    expect(known).toEqual([]);
    expect(stale).toEqual(["repo_only:9999:gone"]);
  });
});

import { describe, it, expect } from "vitest";

import { splitAgainstBaseline, violationId, type Baseline, type Violation } from "../scripts/i18n/check-hardcoded-ui";

/**
 * WP-INFRA-01 — the baseline comparator behind scripts/i18n/check-hardcoded-ui.ts
 * --baseline mode. Mirrors scripts/db/check-migration-drift.ts's accepted-
 * baseline pattern (see tests/migration-drift.test.ts): match on a stable id,
 * NEW findings fail, baselined findings pass silently, and entries the
 * baseline still lists but the scan no longer finds surface as stale.
 */

describe("violationId", () => {
  it("is stable across line-number shifts (file + matched text only)", () => {
    const a: Violation = { file: "src/components/x.tsx", line: 10, text: "Save changes" };
    const b: Violation = { file: "src/components/x.tsx", line: 47, text: "Save changes" };
    expect(violationId(a)).toBe(violationId(b));
  });

  it("percent-encodes so a colon in the text can't collide two different findings", () => {
    const a = violationId({ file: "src/x.tsx", text: "a:b" });
    const b = violationId({ file: "src/x.tsx:b", text: "a" });
    expect(a).not.toBe(b);
  });
});

describe("splitAgainstBaseline", () => {
  const finding: Violation = {
    file: "src/components/marketing/home-lead-nudge.tsx",
    line: 12,
    text: "Get 10% off your first order"
  };

  it("without a baseline, every finding is fresh (the raw scan FAILS)", () => {
    const { fresh, known, stale } = splitAgainstBaseline([finding], null);
    expect(fresh).toEqual([finding]);
    expect(known).toEqual([]);
    expect(stale).toEqual([]);
  });

  it("a baseline entry downgrades the finding to known (the gated scan passes)", () => {
    const baseline: Baseline = {
      generated: "2026-08-13",
      note: "",
      accepted: [{ id: violationId(finding), note: "pre-existing" }]
    };
    const { fresh, known, stale } = splitAgainstBaseline([finding], baseline);
    expect(fresh).toEqual([]);
    expect(known).toEqual([finding]);
    expect(stale).toEqual([]);
  });

  it("a finding at a different line still matches its baseline entry", () => {
    const baseline: Baseline = {
      generated: "2026-08-13",
      note: "",
      accepted: [{ id: violationId(finding) }]
    };
    const movedFinding = { ...finding, line: finding.line + 500 };
    const { fresh, known } = splitAgainstBaseline([movedFinding], baseline);
    expect(fresh).toEqual([]);
    expect(known).toEqual([movedFinding]);
  });

  it("a genuinely new hardcoded string (not in the baseline) fails as fresh", () => {
    const baseline: Baseline = {
      generated: "2026-08-13",
      note: "",
      accepted: [{ id: violationId(finding) }]
    };
    const newFinding: Violation = {
      file: "src/components/checkout/summary.tsx",
      line: 5,
      text: "Please confirm your subscription!"
    };
    const { fresh, known } = splitAgainstBaseline([finding, newFinding], baseline);
    expect(fresh).toEqual([newFinding]);
    expect(known).toEqual([finding]);
  });

  it("baseline entries that no longer occur surface as stale, not as passes", () => {
    const baseline: Baseline = {
      generated: "2026-08-13",
      note: "",
      accepted: [{ id: "src%2Fgone.tsx:fixed%20string" }]
    };
    const { fresh, known, stale } = splitAgainstBaseline([], baseline);
    expect(fresh).toEqual([]);
    expect(known).toEqual([]);
    expect(stale).toEqual(["src%2Fgone.tsx:fixed%20string"]);
  });

  it("duplicate (file, text) hits on different lines both pass once baselined", () => {
    const baseline: Baseline = {
      generated: "2026-08-13",
      note: "",
      accepted: [{ id: violationId(finding) }]
    };
    const dup = { ...finding, line: finding.line + 1 };
    const { fresh, known } = splitAgainstBaseline([finding, dup], baseline);
    expect(fresh).toEqual([]);
    expect(known).toEqual([finding, dup]);
  });
});

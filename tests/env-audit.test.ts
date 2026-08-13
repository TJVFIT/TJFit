/**
 * scripts/security/env-audit.ts — pure diff logic (WP-SEC-08).
 * Pins the two acceptance criteria: a real env read missing from
 * .env.example is a FAIL-worthy finding, and a documented-but-unread key is
 * reported but never fails the audit. Also pins that comments never count
 * as a read, and that .env.example's own comment lines are never parsed as
 * keys.
 */

import { describe, it, expect } from "vitest";
import { diffEnvUsage, extractEnvReads, parseEnvExampleKeys, stripComments } from "../scripts/security/env-audit";

describe("stripComments", () => {
  it("removes // line comments", () => {
    expect(stripComments('const x = 1; // process.env.SECRET\nreal(process.env.REAL_KEY);')).not.toContain(
      "SECRET"
    );
  });

  it("removes block comments", () => {
    expect(stripComments("/* process.env.BLOCKED */\nprocess.env.KEPT")).toBe("\nprocess.env.KEPT");
  });

  it("keeps real code outside comments", () => {
    expect(stripComments("const a = process.env.KEEP_ME;")).toContain("process.env.KEEP_ME");
  });
});

describe("extractEnvReads", () => {
  it("finds every distinct process.env.NAME read", () => {
    const keys = extractEnvReads("const a = process.env.FOO; const b = process.env.BAR ?? process.env.FOO;");
    expect([...keys].sort()).toEqual(["BAR", "FOO"]);
  });

  it("ignores reads that only appear inside comments", () => {
    const keys = extractEnvReads("// const t = new Translator(process.env.DEEPL_API_KEY!);\nconst real = process.env.REAL;");
    expect([...keys]).toEqual(["REAL"]);
  });

  it("returns an empty set when there are no reads", () => {
    expect(extractEnvReads("const a = 1;").size).toBe(0);
  });
});

describe("parseEnvExampleKeys", () => {
  it("parses KEY= lines and ignores comments and blanks", () => {
    const keys = parseEnvExampleKeys(
      ["# a comment", "", "FOO=", "BAR=some default", "# BAZ=commented out"].join("\n")
    );
    expect([...keys].sort()).toEqual(["BAR", "FOO"]);
  });
});

describe("diffEnvUsage", () => {
  it("flags a used-but-undocumented key as a finding", () => {
    const report = diffEnvUsage(new Set(["USED_ONLY"]), new Set([]));
    expect(report.usedUndocumented).toEqual(["USED_ONLY"]);
  });

  it("does not flag a key that is both used and documented", () => {
    const report = diffEnvUsage(new Set(["BOTH"]), new Set(["BOTH"]));
    expect(report.usedUndocumented).toEqual([]);
    expect(report.documentedUnread).toEqual([]);
  });

  it("reports a documented-but-unread key without treating it as a failure-worthy finding", () => {
    const report = diffEnvUsage(new Set([]), new Set(["UNREAD_ONLY"]));
    expect(report.usedUndocumented).toEqual([]);
    expect(report.documentedUnread).toEqual(["UNREAD_ONLY"]);
  });

  it("routes SENTRY_ORG / SENTRY_PROJECT to the implicit allowlist, not the WARN list", () => {
    const report = diffEnvUsage(new Set([]), new Set(["SENTRY_ORG", "SENTRY_PROJECT"]));
    expect(report.documentedUnread).toEqual([]);
    expect(report.documentedUnreadAllowlisted.map((f) => f.key).sort()).toEqual(["SENTRY_ORG", "SENTRY_PROJECT"]);
  });

  it("never fails a used key that is a Vercel/Next platform builtin", () => {
    const report = diffEnvUsage(new Set(["NODE_ENV", "VERCEL_ENV", "NEXT_RUNTIME", "CI"]), new Set([]));
    expect(report.usedUndocumented).toEqual([]);
  });
});

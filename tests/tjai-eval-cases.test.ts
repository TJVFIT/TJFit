/**
 * TJAI eval case-file integrity (TJFITV.10X PR6).
 * Offline guard (no API key): the eval corpus stays large, well-formed, and
 * covers the safety + restriction + locale categories the upgrade depends on.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

type EvalCase = {
  id: string;
  locale: string;
  persona: string;
  profile: Record<string, unknown>;
  prompt: string;
  expected: {
    safety_required: boolean;
    must_include?: string[];
    must_not_include?: string[];
    locale_check: string;
    next_action_required?: boolean;
    rtl_required?: boolean;
  };
};

const file = JSON.parse(
  readFileSync(resolve(process.cwd(), "tests", "tjai-eval", "cases.json"), "utf8")
) as { version: number; cases: EvalCase[] };

describe("tjai eval case file", () => {
  it("has at least 40 cases", () => {
    expect(file.cases.length).toBeGreaterThanOrEqual(40);
  });

  it("has unique case ids", () => {
    const ids = file.cases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every case is well-formed", () => {
    for (const c of file.cases) {
      expect(typeof c.id, c.id).toBe("string");
      expect(c.prompt.length, c.id).toBeGreaterThan(0);
      expect(typeof c.expected.safety_required, c.id).toBe("boolean");
      expect(typeof c.expected.locale_check, c.id).toBe("string");
    }
  });

  it("covers all five supported locales", () => {
    const locales = new Set(file.cases.map((c) => c.locale));
    for (const loc of ["en", "tr", "ar", "es", "fr"]) {
      expect(locales.has(loc), `missing locale ${loc}`).toBe(true);
    }
  });

  it("includes safety-refusal cases", () => {
    expect(file.cases.filter((c) => c.expected.safety_required).length).toBeGreaterThanOrEqual(6);
  });
});

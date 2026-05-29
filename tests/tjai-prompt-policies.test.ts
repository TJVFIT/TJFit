/**
 * TJAI modular coaching policies (TJFITV.10X PR2).
 * Dry-run (no API): asserts the composed system prompt carries every named policy
 * section and still anchors the strict-JSON output contract, so modularization
 * did not silently drop a policy or the output rule.
 */

import { describe, it, expect } from "vitest";

import { buildTJAISystemPrompt } from "@/lib/tjai-prompts";
import { POLICY_SECTION_HEADERS, composeCoachingPolicies } from "@/lib/tjai/prompts/policies";

describe("modular coaching policies", () => {
  it("composeCoachingPolicies includes every named section header", () => {
    const composed = composeCoachingPolicies();
    for (const header of POLICY_SECTION_HEADERS) {
      expect(composed).toContain(header);
    }
  });

  it("system prompt embeds all policy sections", () => {
    const system = buildTJAISystemPrompt();
    for (const header of POLICY_SECTION_HEADERS) {
      expect(system).toContain(header);
    }
  });

  it("system prompt still enforces the strict-JSON output contract", () => {
    const system = buildTJAISystemPrompt();
    expect(system).toContain("single valid JSON object");
    expect(system).toContain("No markdown");
  });

  it("keeps named evidence anchors in the policy layer", () => {
    const composed = composeCoachingPolicies();
    expect(composed).toContain("ACSM_2026_RESISTANCE_TRAINING");
    expect(composed).toContain("ISSN_PROTEIN_POLICY");
    expect(composed).toContain("TJFIT_SAFETY_SCOPE");
  });
});

/**
 * TJAI provider strategy (TJFITV.10X PR7).
 * The routing map is complete and consistent, availability tracks env keys,
 * and the unavailable response is shaped with a stable code.
 */

import { describe, it, expect, afterEach } from "vitest";

import {
  PROVIDER_POLICY,
  TJAI_AI_TASKS,
  TJAI_PROVIDER_UNAVAILABLE,
  isAnthropicConfigured,
  isOpenAIConfigured,
  isProviderConfigured,
  isTaskAvailable,
  providerUnavailableBody,
  type TjaiAiTask
} from "@/lib/tjai/provider-policy";

const ORIGINAL_OPENAI = process.env.OPENAI_API_KEY;
const ORIGINAL_ANTHROPIC = process.env.ANTHROPIC_API_KEY;

afterEach(() => {
  process.env.OPENAI_API_KEY = ORIGINAL_OPENAI;
  process.env.ANTHROPIC_API_KEY = ORIGINAL_ANTHROPIC;
});

describe("provider policy map", () => {
  it("has a decision for every task constant", () => {
    for (const task of Object.values(TJAI_AI_TASKS) as TjaiAiTask[]) {
      expect(PROVIDER_POLICY[task], task).toBeDefined();
      expect(PROVIDER_POLICY[task].task).toBe(task);
      expect(["openai", "anthropic", "guard", "none"]).toContain(PROVIDER_POLICY[task].provider);
    }
  });

  it("keeps the safety-critical paths on OpenAI", () => {
    expect(PROVIDER_POLICY.plan_generate.provider).toBe("openai");
    expect(PROVIDER_POLICY.chat_stream.provider).toBe("openai");
  });

  it("fails closed (not 503) for core-path helpers so chat never breaks", () => {
    expect(PROVIDER_POLICY.long_memory_extract.fallback).toBe("fail_closed");
    expect(PROVIDER_POLICY.adaptive_suggestion.fallback).toBe("fail_closed");
    expect(PROVIDER_POLICY.chat_preference_extract.fallback).toBe("fail_closed");
  });
});

describe("availability tracks env keys", () => {
  it("reflects OpenAI key presence", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    expect(isOpenAIConfigured()).toBe(true);
    delete process.env.OPENAI_API_KEY;
    expect(isOpenAIConfigured()).toBe(false);
  });

  it("reflects Anthropic key presence and gates anthropic tasks", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    expect(isAnthropicConfigured()).toBe(true);
    expect(isTaskAvailable("grocery_list")).toBe(true);
    delete process.env.ANTHROPIC_API_KEY;
    expect(isAnthropicConfigured()).toBe(false);
    expect(isTaskAvailable("grocery_list")).toBe(false);
  });

  it("treats guard/none providers as always configured", () => {
    expect(isProviderConfigured("guard")).toBe(true);
    expect(isProviderConfigured("none")).toBe(true);
  });
});

describe("providerUnavailableBody", () => {
  it("returns a shaped body with the stable code", () => {
    const body = providerUnavailableBody();
    expect(body.code).toBe(TJAI_PROVIDER_UNAVAILABLE);
    expect(typeof body.error).toBe("string");
  });
});

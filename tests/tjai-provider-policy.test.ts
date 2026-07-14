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
  resolveTaskProvider,
  type TjaiAiTask
} from "@/lib/tjai/provider-policy";

const ORIGINAL_OPENAI = process.env.OPENAI_API_KEY;
const ORIGINAL_ANTHROPIC = process.env.ANTHROPIC_API_KEY;
const ORIGINAL_LLM_PRESET = process.env.TJAI_LLM_PRESET;
const ORIGINAL_LLM_BASE_URL = process.env.TJAI_LLM_BASE_URL;
const ORIGINAL_LLM_MODEL = process.env.TJAI_LLM_MODEL;

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

afterEach(() => {
  restoreEnv("OPENAI_API_KEY", ORIGINAL_OPENAI);
  restoreEnv("ANTHROPIC_API_KEY", ORIGINAL_ANTHROPIC);
  restoreEnv("TJAI_LLM_PRESET", ORIGINAL_LLM_PRESET);
  restoreEnv("TJAI_LLM_BASE_URL", ORIGINAL_LLM_BASE_URL);
  restoreEnv("TJAI_LLM_MODEL", ORIGINAL_LLM_MODEL);
});

/** Tests below reason about legacy keys only — silence any open-gateway env. */
function clearOpenGateway() {
  delete process.env.TJAI_LLM_PRESET;
  delete process.env.TJAI_LLM_BASE_URL;
  delete process.env.TJAI_LLM_MODEL;
}

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
    clearOpenGateway();
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    expect(isAnthropicConfigured()).toBe(true);
    expect(isTaskAvailable("grocery_list")).toBe(true);
    // With no key anywhere the task is truly unavailable...
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    expect(isAnthropicConfigured()).toBe(false);
    expect(isTaskAvailable("grocery_list")).toBe(false);
    // ...but any configured LLM beats a 503: OpenAI rescues an anthropic task.
    process.env.OPENAI_API_KEY = "sk-test";
    expect(isTaskAvailable("grocery_list")).toBe(true);
    expect(resolveTaskProvider("grocery_list")).toBe("openai");
  });

  it("routes everything to the open gateway when configured", () => {
    clearOpenGateway();
    process.env.TJAI_LLM_PRESET = "groq";
    process.env.TJAI_LLM_API_KEY = "gsk-test";
    expect(resolveTaskProvider("plan_generate")).toBe("open");
    expect(resolveTaskProvider("grocery_list")).toBe("open");
    expect(resolveTaskProvider("chat_stream")).toBe("open");
    expect(isTaskAvailable("chat_stream")).toBe(true);
    delete process.env.TJAI_LLM_API_KEY;
  });

  it("never rescues streaming tasks with Anthropic (no streaming support)", () => {
    clearOpenGateway();
    delete process.env.OPENAI_API_KEY;
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    expect(resolveTaskProvider("chat_stream")).toBe("none");
    expect(isTaskAvailable("chat_stream")).toBe(false);
    expect(resolveTaskProvider("eval_chat")).toBe("none");
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

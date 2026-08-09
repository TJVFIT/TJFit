/**
 * Open-LLM gateway config resolution.
 *
 * `resolveOpenLLMConfig()` decides whether TJAI talks to an open-weight server
 * at all, and which model each task kind gets. It had no direct test despite
 * three-level model fallback (per-kind env -> default env -> preset), a
 * trailing-slash normaliser, and a guard that must stop a half-configured
 * hosted preset from hijacking routing. Every branch below is a way TJAI could
 * silently talk to the wrong model, or to nothing at all.
 */

import { describe, it, expect, afterEach } from "vitest";

import { resolveOpenLLMConfig } from "@/lib/tjai/llm-gateway";

const KEYS = [
  "TJAI_LLM_PRESET",
  "TJAI_LLM_BASE_URL",
  "TJAI_LLM_API_KEY",
  "TJAI_LLM_MODEL",
  "TJAI_LLM_MODEL_CHAT",
  "TJAI_LLM_MODEL_JSON",
  "TJAI_LLM_MODEL_MINI",
  "TJAI_LLM_MODEL_LONGFORM"
] as const;

const ORIGINAL = Object.fromEntries(KEYS.map((k) => [k, process.env[k]])) as Record<string, string | undefined>;

function clearAll() {
  for (const k of KEYS) delete process.env[k];
}

afterEach(() => {
  for (const k of KEYS) {
    const v = ORIGINAL[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("resolveOpenLLMConfig — when the gateway is OFF", () => {
  it("returns null with no env at all, so TJAI falls back to the legacy providers", () => {
    clearAll();
    expect(resolveOpenLLMConfig()).toBeNull();
  });

  it("returns null for an unknown preset with no explicit base URL", () => {
    clearAll();
    process.env.TJAI_LLM_PRESET = "not-a-real-preset";
    expect(resolveOpenLLMConfig()).toBeNull();
  });

  it("returns null when a base URL is set but no model can be resolved", () => {
    // A bare vllm preset has no default models — without TJAI_LLM_MODEL there
    // is nothing to send, and half-configured must mean off, not broken.
    clearAll();
    process.env.TJAI_LLM_PRESET = "vllm";
    process.env.TJAI_LLM_BASE_URL = "http://gpu-box:8000/v1";
    expect(resolveOpenLLMConfig()).toBeNull();
  });

  it("refuses a hosted preset that has no API key — a half-set env must not hijack routing", () => {
    // groq/openrouter/together 401 without a key. Silently routing every TJAI
    // task into a guaranteed 401 is worse than staying on the legacy provider.
    clearAll();
    process.env.TJAI_LLM_PRESET = "groq";
    expect(resolveOpenLLMConfig()).toBeNull();
  });
});

describe("resolveOpenLLMConfig — when the gateway is ON", () => {
  it("resolves the ollama preset entirely from defaults (the zero-config local path)", () => {
    clearAll();
    process.env.TJAI_LLM_PRESET = "ollama";

    const cfg = resolveOpenLLMConfig();
    expect(cfg).not.toBeNull();
    expect(cfg!.baseUrl).toBe("http://127.0.0.1:11434/v1");
    expect(cfg!.apiKey).toBeNull();
    expect(cfg!.presetName).toBe("ollama");
    // Qwen3: multilingual (tr/ar matter here) and Apache-2.0.
    expect(cfg!.models.chat).toBe("qwen3:8b");
    expect(cfg!.models.json).toBe("qwen3:8b");
    expect(cfg!.models.longform).toBe("qwen3:8b");
    // `mini` stays small so a cheap extraction cannot evict the main model.
    expect(cfg!.models.mini).toBe("qwen3:1.7b");
  });

  it("accepts a hosted preset once its API key is present", () => {
    clearAll();
    process.env.TJAI_LLM_PRESET = "groq";
    process.env.TJAI_LLM_API_KEY = "gsk_test";

    const cfg = resolveOpenLLMConfig();
    expect(cfg).not.toBeNull();
    expect(cfg!.apiKey).toBe("gsk_test");
    expect(cfg!.baseUrl).toBe("https://api.groq.com/openai/v1");
  });

  it("lets an explicit base URL stand in for the missing key on a hosted preset", () => {
    // Pointing groq at a local proxy is a legitimate setup; the key guard must
    // not block it.
    clearAll();
    process.env.TJAI_LLM_PRESET = "groq";
    process.env.TJAI_LLM_BASE_URL = "http://localhost:9000/v1";

    const cfg = resolveOpenLLMConfig();
    expect(cfg).not.toBeNull();
    expect(cfg!.baseUrl).toBe("http://localhost:9000/v1");
  });

  it("strips trailing slashes so the request path never doubles up", () => {
    clearAll();
    process.env.TJAI_LLM_PRESET = "ollama";
    process.env.TJAI_LLM_BASE_URL = "http://127.0.0.1:11434/v1///";

    expect(resolveOpenLLMConfig()!.baseUrl).toBe("http://127.0.0.1:11434/v1");
  });

  it("works with no preset at all when base URL and model are given directly", () => {
    clearAll();
    process.env.TJAI_LLM_BASE_URL = "http://gpu-box:8000/v1";
    process.env.TJAI_LLM_MODEL = "Qwen/Qwen3-14B";

    const cfg = resolveOpenLLMConfig();
    expect(cfg).not.toBeNull();
    expect(cfg!.presetName).toBe("custom");
    // One model answers for every kind when only the default is set.
    expect(new Set(Object.values(cfg!.models))).toEqual(new Set(["Qwen/Qwen3-14B"]));
  });
});

describe("resolveOpenLLMConfig — model fallback order", () => {
  it("prefers a per-kind override over the default, and the default over the preset", () => {
    clearAll();
    process.env.TJAI_LLM_PRESET = "ollama";
    process.env.TJAI_LLM_MODEL = "default-model";
    process.env.TJAI_LLM_MODEL_JSON = "json-specialist";

    const cfg = resolveOpenLLMConfig()!;
    expect(cfg.models.json).toBe("json-specialist"); // per-kind wins
    expect(cfg.models.chat).toBe("default-model"); // default beats the preset
    expect(cfg.models.mini).toBe("default-model");
  });

  it("routes one locale-specialist model at a single kind without disturbing the rest", () => {
    // The realistic tr setup: a Turkish fine-tune on chat, base Qwen3 elsewhere.
    clearAll();
    process.env.TJAI_LLM_PRESET = "ollama";
    process.env.TJAI_LLM_MODEL_CHAT = "trendyol-llm-8b-t1";

    const cfg = resolveOpenLLMConfig()!;
    expect(cfg.models.chat).toBe("trendyol-llm-8b-t1");
    expect(cfg.models.json).toBe("qwen3:8b");
    expect(cfg.models.mini).toBe("qwen3:1.7b");
  });

  it("treats a whitespace-only override as unset rather than sending an empty model", () => {
    clearAll();
    process.env.TJAI_LLM_PRESET = "ollama";
    process.env.TJAI_LLM_MODEL_CHAT = "   ";

    expect(resolveOpenLLMConfig()!.models.chat).toBe("qwen3:8b");
  });
});

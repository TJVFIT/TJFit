import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

const args = { key: "waitlist:test", limit: 5, windowMs: 60_000, failClosed: true };
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.test");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-only");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("required shared rate limiter", () => {
  it("rejects missing production configuration", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    expect(await rateLimit(args)).toMatchObject({ success: false, unavailable: true });
  });
  it("rejects a Redis outage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
    expect(await rateLimit(args)).toMatchObject({ success: false, unavailable: true });
  });
  it.each([
    { result: [{ error: "denied" }] },
    { result: [{ result: 0 }, { result: 1 }] },
    { result: [{ result: 1 }, { result: 0 }] }
  ])("rejects malformed or failed counter/expiry commands", async ({ result }) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(result)));
    expect(await rateLimit(args)).toMatchObject({ success: false, unavailable: true });
  });
  it("distinguishes a valid exhausted quota from backend failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([{ result: 6 }, { result: 1 }])));
    expect(await rateLimit(args)).toEqual({ success: false, remaining: 0 });
  });
  it("allows a valid counter only after expiry was set", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([{ result: 1 }, { result: 1 }])));
    expect(await rateLimit(args)).toEqual({ success: true, remaining: 4 });
  });
});

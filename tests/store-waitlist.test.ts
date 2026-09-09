import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  upsert: vi.fn(),
  from: vi.fn(),
  getClient: vi.fn(),
  rateLimit: vi.fn()
}));
vi.mock("@/lib/supabase-server", () => ({ getSupabaseServerClient: mocks.getClient }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
import { POST } from "@/app/api/store/waitlist/route";

const request = (body: unknown) => new NextRequest("https://tjfit.org/api/store/waitlist", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 4 });
  mocks.upsert.mockResolvedValue({ error: null });
  mocks.from.mockReturnValue({ upsert: mocks.upsert });
  mocks.getClient.mockReturnValue({ from: mocks.from });
});

describe("equipment waitlist persistence boundary", () => {
  it("reports success only after saving a normalized email", async () => {
    const response = await POST(request({ email: " Person@Example.com " }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mocks.upsert).toHaveBeenCalledWith({ email: "person@example.com" }, { onConflict: "email" });
  });

  it.each([null, [], "person@example.com", { email: [] }, { email: "x" }, { email: "a".repeat(250) + "@example.com" }])("rejects invalid input before database access", async body => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("limits an oversized streamed body even without Content-Length", async () => {
    expect((await POST(request({ email: "a".repeat(3000) }))).status).toBe(413);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("does not claim a signup when database configuration is absent", async () => {
    mocks.getClient.mockReturnValue(null);
    expect((await POST(request({ email: "person@example.com" }))).status).toBe(503);
  });

  it("does not expose database failures or claim persistence", async () => {
    mocks.upsert.mockResolvedValue({ error: { message: "private db error" } });
    const response = await POST(request({ email: "person@example.com" }));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("private db error");
  });

  it("honors the rate limit before reading or writing customer details", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });
    expect((await POST(request({ email: "person@example.com" }))).status).toBe(429);
    expect(mocks.getClient).not.toHaveBeenCalled();
  });

  it("does not accept submissions if the required rate limiter is unavailable", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0, unavailable: true });
    expect((await POST(request({ email: "person@example.com" }))).status).toBe(503);
    expect(mocks.getClient).not.toHaveBeenCalled();
  });
});

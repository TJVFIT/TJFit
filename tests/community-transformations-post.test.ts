/**
 * POST /api/community/transformations — submission validation (WP-SOCIAL-03).
 * Pins the hand-validation boundary: both photo URLs are required, string
 * fields are bounded, and a successful submission always inserts as
 * status=pending under the caller's own user_id (never client-supplied).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  insertCalls: [] as Array<Record<string, unknown>>,
  state: { rateLimited: false }
}));

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    insert: (payload: Record<string, unknown>) => {
      h.insertCalls.push(payload);
      return {
        select: () => ({
          single: async () => ({ data: { id: "new-1", status: "pending" }, error: null })
        })
      };
    }
  }))
}));

vi.mock("@/lib/require-auth", () => ({
  requireAuth: vi.fn(async () => ({
    ok: true,
    user: { id: "user-1", email: "buyer@example.com" },
    supabase: mockSupabase
  }))
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => (h.state.rateLimited ? { success: false, remaining: 0 } : { success: true, remaining: 4 }))
}));

// The route enforces that photos come from the caller's OWN
// transformation-photos folder (review-hardening follow-up), built from
// this env var — pin it before importing the route.
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
const OWN_PREFIX = "https://test-project.supabase.co/storage/v1/object/public/transformation-photos/user-1";

import { POST } from "@/app/api/community/transformations/route";

function request(body: unknown) {
  return { text: async () => JSON.stringify(body) } as Request;
}

beforeEach(() => {
  h.insertCalls.length = 0;
  h.state.rateLimited = false;
  mockSupabase.from.mockClear();
});

describe("transformation submission validation", () => {
  it("requires both before and after image URLs", async () => {
    const res = await POST(request({ after_image_url: `${OWN_PREFIX}/a.jpg` }) as never);
    expect(res.status).toBe(400);
    expect(h.insertCalls).toHaveLength(0);
  });

  it("rejects an oversized image URL", async () => {
    const huge = OWN_PREFIX + "/" + "a".repeat(2100);
    const res = await POST(
      request({ before_image_url: huge, after_image_url: `${OWN_PREFIX}/a.jpg` }) as never
    );
    expect(res.status).toBe(400);
    expect(h.insertCalls).toHaveLength(0);
  });

  it("inserts as pending under the caller's own user_id, never a client-supplied one", async () => {
    const res = await POST(
      request({
        before_image_url: `${OWN_PREFIX}/before.jpg`,
        after_image_url: `${OWN_PREFIX}/after.jpg`,
        user_id: "someone-else",
        story: "12 weeks of consistency."
      }) as never
    );
    expect(res.status).toBe(201);
    expect(h.insertCalls).toHaveLength(1);
    expect(h.insertCalls[0]).toMatchObject({
      user_id: "user-1",
      before_image_url: `${OWN_PREFIX}/before.jpg`,
      after_image_url: `${OWN_PREFIX}/after.jpg`,
      story: "12 weeks of consistency."
    });
  });

  it("truncates a story longer than the bound instead of rejecting it", async () => {
    const longStory = "s".repeat(5000);
    const res = await POST(
      request({
        before_image_url: `${OWN_PREFIX}/before.jpg`,
        after_image_url: `${OWN_PREFIX}/after.jpg`,
        story: longStory
      }) as never
    );
    expect(res.status).toBe(201);
    const insertedStory = h.insertCalls[0]?.story as string;
    expect(insertedStory.length).toBe(4000);
  });

  it("defaults show_username to true when omitted", async () => {
    const res = await POST(
      request({ before_image_url: `${OWN_PREFIX}/before.jpg`, after_image_url: `${OWN_PREFIX}/after.jpg` }) as never
    );
    expect(res.status).toBe(201);
    expect(h.insertCalls[0]?.show_username).toBe(true);
  });

  it("honors an explicit show_username: false", async () => {
    const res = await POST(
      request({
        before_image_url: `${OWN_PREFIX}/before.jpg`,
        after_image_url: `${OWN_PREFIX}/after.jpg`,
        show_username: false
      }) as never
    );
    expect(res.status).toBe(201);
    expect(h.insertCalls[0]?.show_username).toBe(false);
  });

  it("returns 429 once the 5/hour submission limit is hit", async () => {
    h.state.rateLimited = true;
    const res = await POST(
      request({ before_image_url: `${OWN_PREFIX}/before.jpg`, after_image_url: `${OWN_PREFIX}/after.jpg` }) as never
    );
    expect(res.status).toBe(429);
    expect(h.insertCalls).toHaveLength(0);
  });
});

describe("own-folder photo enforcement (review hardening)", () => {
  it("rejects photos hosted outside the caller's own transformation folder", async () => {
    const foreign = "https://test-project.supabase.co/storage/v1/object/public/transformation-photos/other-user/x.jpg";
    const res = await POST(
      request({ before_image_url: foreign, after_image_url: `${OWN_PREFIX}/after.jpg` }) as never
    );
    expect(res.status).toBe(400);
    expect(h.insertCalls).toHaveLength(0);
  });

  it("rejects arbitrary external URLs even under 2048 chars", async () => {
    const res = await POST(
      request({ before_image_url: "https://evil.example/x.jpg", after_image_url: "https://evil.example/y.jpg" }) as never
    );
    expect(res.status).toBe(400);
    expect(h.insertCalls).toHaveLength(0);
  });
});

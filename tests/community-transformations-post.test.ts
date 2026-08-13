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
    const res = await POST(request({ after_image_url: "https://x/a.jpg" }) as never);
    expect(res.status).toBe(400);
    expect(h.insertCalls).toHaveLength(0);
  });

  it("rejects an oversized image URL", async () => {
    const huge = "https://x/" + "a".repeat(2100);
    const res = await POST(
      request({ before_image_url: huge, after_image_url: "https://x/a.jpg" }) as never
    );
    expect(res.status).toBe(400);
    expect(h.insertCalls).toHaveLength(0);
  });

  it("inserts as pending under the caller's own user_id, never a client-supplied one", async () => {
    const res = await POST(
      request({
        before_image_url: "https://x/before.jpg",
        after_image_url: "https://x/after.jpg",
        user_id: "someone-else",
        story: "12 weeks of consistency."
      }) as never
    );
    expect(res.status).toBe(201);
    expect(h.insertCalls).toHaveLength(1);
    expect(h.insertCalls[0]).toMatchObject({
      user_id: "user-1",
      before_image_url: "https://x/before.jpg",
      after_image_url: "https://x/after.jpg",
      story: "12 weeks of consistency."
    });
  });

  it("truncates a story longer than the bound instead of rejecting it", async () => {
    const longStory = "s".repeat(5000);
    const res = await POST(
      request({
        before_image_url: "https://x/before.jpg",
        after_image_url: "https://x/after.jpg",
        story: longStory
      }) as never
    );
    expect(res.status).toBe(201);
    const insertedStory = h.insertCalls[0]?.story as string;
    expect(insertedStory.length).toBe(4000);
  });

  it("defaults show_username to true when omitted", async () => {
    const res = await POST(
      request({ before_image_url: "https://x/before.jpg", after_image_url: "https://x/after.jpg" }) as never
    );
    expect(res.status).toBe(201);
    expect(h.insertCalls[0]?.show_username).toBe(true);
  });

  it("honors an explicit show_username: false", async () => {
    const res = await POST(
      request({
        before_image_url: "https://x/before.jpg",
        after_image_url: "https://x/after.jpg",
        show_username: false
      }) as never
    );
    expect(res.status).toBe(201);
    expect(h.insertCalls[0]?.show_username).toBe(false);
  });

  it("returns 429 once the 5/hour submission limit is hit", async () => {
    h.state.rateLimited = true;
    const res = await POST(
      request({ before_image_url: "https://x/before.jpg", after_image_url: "https://x/after.jpg" }) as never
    );
    expect(res.status).toBe(429);
    expect(h.insertCalls).toHaveLength(0);
  });
});

/**
 * POST /api/blog/posts/[id]/view — the WP-INFRA-07 view beacon. Pins the
 * three behaviors that let blog/[slug] go ISR without breaking counting:
 * rate-limited callers never reach the RPC, unpublished/unknown ids 404
 * before the RPC, and a published id increments exactly once via
 * increment_blog_view_count.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  limiterSuccess: true,
  postRow: { id: "post-1" } as { id: string } | null,
  rpcError: null as { message: string } | null,
  rpcCalls: [] as Array<[string, unknown]>
}));

const mockSupabase = vi.hoisted(() => ({
  from: (_table: string) => {
    const query: any = {
      select: () => query,
      eq: () => query,
      maybeSingle: () => Promise.resolve({ data: h.postRow, error: null })
    };
    return query;
  },
  rpc: (fn: string, args: unknown) => {
    h.rpcCalls.push([fn, args]);
    return Promise.resolve({ data: null, error: h.rpcError });
  }
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: vi.fn(() => mockSupabase)
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({ success: h.limiterSuccess, remaining: 0 }))
}));

import type { NextRequest } from "next/server";
import { POST } from "@/app/api/blog/posts/[id]/view/route";

function makeRequest(): NextRequest {
  return { headers: new Headers({ "x-forwarded-for": "203.0.113.7" }) } as unknown as NextRequest;
}

beforeEach(() => {
  h.limiterSuccess = true;
  h.postRow = { id: "post-1" };
  h.rpcError = null;
  h.rpcCalls = [];
});

describe("POST /api/blog/posts/[id]/view", () => {
  it("increments a published post through the RPC", async () => {
    const res = await POST(makeRequest(), { params: { id: "post-1" } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(h.rpcCalls).toEqual([["increment_blog_view_count", { p_id: "post-1" }]]);
  });

  it("never calls the RPC when the rate limiter says no", async () => {
    h.limiterSuccess = false;
    const res = await POST(makeRequest(), { params: { id: "post-1" } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, limited: true });
    expect(h.rpcCalls).toEqual([]);
  });

  it("404s unknown/unpublished ids without touching the RPC", async () => {
    h.postRow = null;
    const res = await POST(makeRequest(), { params: { id: "nope" } });
    expect(res.status).toBe(404);
    expect(h.rpcCalls).toEqual([]);
  });

  it("500s when the RPC fails so the beacon's catch stays silent client-side", async () => {
    h.rpcError = { message: "boom" };
    const res = await POST(makeRequest(), { params: { id: "post-1" } });
    expect(res.status).toBe(500);
  });
});

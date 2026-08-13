/**
 * GET /api/blog/posts — pinned-first ordering (WP-SOCIAL-01 port of System
 * B's is_pinned behavior). Pins the exact select/order chain rather than
 * asserting "it ran" so a dropped `.order("is_pinned", ...)` call fails.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  calls: {
    select: "",
    eqCalls: [] as Array<[string, unknown]>,
    orderCalls: [] as Array<[string, unknown]>,
    limit: 0
  }
}));

function makeQuery() {
  const query: any = {
    select: (cols: string) => {
      h.calls.select = cols;
      return query;
    },
    eq: (col: string, val: unknown) => {
      h.calls.eqCalls.push([col, val]);
      return query;
    },
    order: (col: string, opts: unknown) => {
      h.calls.orderCalls.push([col, opts]);
      return query;
    },
    limit: (n: number) => {
      h.calls.limit = n;
      return Promise.resolve({ data: [], error: null });
    },
    then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null })
  };
  return query;
}

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn()
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: vi.fn(() => mockSupabase)
}));
vi.mock("@/lib/require-admin", () => ({
  requireAdmin: vi.fn(async () => ({ ok: true, supabase: mockSupabase, userId: "admin-1" }))
}));

import type { NextRequest } from "next/server";
import { GET } from "@/app/api/blog/posts/route";

beforeEach(() => {
  h.calls.select = "";
  h.calls.eqCalls = [];
  h.calls.orderCalls = [];
  h.calls.limit = 0;
  mockSupabase.from.mockReset();
  mockSupabase.from.mockImplementation(() => makeQuery());
});

function request(url: string): NextRequest {
  return { url } as unknown as NextRequest;
}

describe("GET /api/blog/posts pin-first ordering", () => {
  it("orders is_pinned before is_featured before created_at", async () => {
    const res = await GET(request("http://localhost/api/blog/posts"));
    expect(res.status).toBe(200);
    expect(h.calls.orderCalls.map(([col]) => col)).toEqual(["is_pinned", "is_featured", "created_at"]);
    expect(h.calls.orderCalls[0]).toEqual(["is_pinned", { ascending: false }]);
  });

  it("selects is_pinned so the client can render the pinned badge", () => {
    void GET(request("http://localhost/api/blog/posts"));
    expect(h.calls.select).toContain("is_pinned");
  });

  it("defaults to status=published for public requests", async () => {
    await GET(request("http://localhost/api/blog/posts"));
    expect(h.calls.eqCalls).toContainEqual(["status", "published"]);
  });
});

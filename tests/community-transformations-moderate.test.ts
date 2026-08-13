/**
 * Transformation wall moderation — action allowlist + approve/reject
 * idempotency (WP-SOCIAL-03). Mirrors the blog-post moderate route's
 * lesson: an unvalidated `action` string can fall through to an
 * unintended branch, so the allowlist and the exact status transitions it
 * gates are pinned here directly against the route handler.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  state: {
    row: { id: "t-1", status: "pending" } as { id: string; status: string } | null
  },
  updateCalls: [] as Array<Record<string, unknown>>
}));

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: h.state.row, error: null })
      })
    }),
    update: (payload: Record<string, unknown>) => {
      h.updateCalls.push(payload);
      return { eq: async () => ({ error: null }) };
    }
  }))
}));

vi.mock("@/lib/require-admin", () => ({
  requireAdmin: vi.fn(async () => ({ ok: true, supabase: mockSupabase, userId: "admin-1" }))
}));

import type { NextRequest } from "next/server";
import { POST } from "@/app/api/community/transformations/[id]/moderate/route";

function request(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}
const params = { params: { id: "t-1" } };

beforeEach(() => {
  h.state.row = { id: "t-1", status: "pending" };
  h.updateCalls.length = 0;
  mockSupabase.from.mockClear();
});

describe("transformation moderation allowlist", () => {
  it("rejects an action outside approve/reject", async () => {
    const res = await POST(request({ action: "delete" }), params);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Invalid action" });
    expect(h.updateCalls).toHaveLength(0);
  });

  it("rejects a missing action", async () => {
    const res = await POST(request({}), params);
    expect(res.status).toBe(400);
    expect(h.updateCalls).toHaveLength(0);
  });

  it("404s a transformation that does not exist", async () => {
    h.state.row = null;
    const res = await POST(request({ action: "approve" }), params);
    expect(res.status).toBe(404);
  });

  it("approve sets status=approved and stamps approved_at", async () => {
    const res = await POST(request({ action: "approve" }), params);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(h.updateCalls).toHaveLength(1);
    expect(h.updateCalls[0]).toMatchObject({ status: "approved" });
    expect(typeof h.updateCalls[0]?.approved_at).toBe("string");
  });

  it("reject sets status=rejected without touching approved_at", async () => {
    const res = await POST(request({ action: "reject" }), params);
    expect(res.status).toBe(200);
    expect(h.updateCalls).toHaveLength(1);
    expect(h.updateCalls[0]).toEqual({ status: "rejected" });
  });

  it("re-approving an already-approved row is a no-op (idempotent)", async () => {
    h.state.row = { id: "t-1", status: "approved" };
    const res = await POST(request({ action: "approve" }), params);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, alreadyApproved: true });
    expect(h.updateCalls).toHaveLength(0);
  });

  it("re-rejecting an already-rejected row is a no-op (idempotent)", async () => {
    h.state.row = { id: "t-1", status: "rejected" };
    const res = await POST(request({ action: "reject" }), params);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, alreadyRejected: true });
    expect(h.updateCalls).toHaveLength(0);
  });
});

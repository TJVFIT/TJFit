/**
 * Blog post moderation (WP-SOCIAL-01) — action allowlist including the
 * pin/unpin actions ported from the retired System B endpoint
 * (community/blogs PATCH), plus pin/unpin idempotency.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  state: {
    row: {
      id: "post-1",
      title: "Test Post",
      author_id: "author-1",
      status: "pending",
      is_featured: false,
      is_pinned: false
    } as {
      id: string;
      title: string;
      author_id: string;
      status: string;
      is_featured: boolean;
      is_pinned: boolean;
    } | null
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
  })),
  auth: {
    admin: {
      getUserById: vi.fn(async () => ({ data: { user: null } }))
    }
  }
}));

vi.mock("@/lib/require-admin", () => ({
  requireAdmin: vi.fn(async () => ({ ok: true, supabase: mockSupabase, userId: "admin-1" }))
}));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => ({})) }));
vi.mock("@/lib/email-templates", () => ({
  EmailTemplates: { blogPublished: vi.fn(() => "<p/>"), blogRejected: vi.fn(() => "<p/>") }
}));
vi.mock("@/lib/email-preferences", () => ({ signUnsubscribeToken: vi.fn(() => "token") }));
vi.mock("@/lib/pending-notifications", () => ({ enqueuePendingNotification: vi.fn(async () => {}) }));

import type { NextRequest } from "next/server";
import { POST } from "@/app/api/blog/posts/[id]/moderate/route";

function request(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}
const params = { params: { id: "post-1" } };

beforeEach(() => {
  h.state.row = {
    id: "post-1",
    title: "Test Post",
    author_id: "author-1",
    status: "pending",
    is_featured: false,
    is_pinned: false
  };
  h.updateCalls.length = 0;
  mockSupabase.from.mockClear();
});

describe("blog post moderation allowlist", () => {
  it("rejects an action outside the allowlist", async () => {
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

  it("404s a post that does not exist", async () => {
    h.state.row = null;
    const res = await POST(request({ action: "pin" }), params);
    expect(res.status).toBe(404);
  });

  it("accepts pin and unpin as valid actions", async () => {
    const pinRes = await POST(request({ action: "pin" }), params);
    expect(pinRes.status).toBe(200);

    h.state.row = { ...h.state.row!, is_pinned: true };
    const unpinRes = await POST(request({ action: "unpin" }), params);
    expect(unpinRes.status).toBe(200);
  });
});

describe("blog post pin/unpin", () => {
  it("pin sets is_pinned true", async () => {
    const res = await POST(request({ action: "pin" }), params);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(h.updateCalls).toHaveLength(1);
    expect(h.updateCalls[0]).toEqual({ is_pinned: true });
  });

  it("unpin sets is_pinned false", async () => {
    h.state.row = { ...h.state.row!, is_pinned: true };
    const res = await POST(request({ action: "unpin" }), params);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(h.updateCalls).toHaveLength(1);
    expect(h.updateCalls[0]).toEqual({ is_pinned: false });
  });

  it("re-pinning an already-pinned post is a no-op (idempotent)", async () => {
    h.state.row = { ...h.state.row!, is_pinned: true };
    const res = await POST(request({ action: "pin" }), params);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, alreadyPinned: true });
    expect(h.updateCalls).toHaveLength(0);
  });

  it("re-unpinning an already-unpinned post is a no-op (idempotent)", async () => {
    const res = await POST(request({ action: "unpin" }), params);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, alreadyPinned: false });
    expect(h.updateCalls).toHaveLength(0);
  });

  it("pin/unpin never touches status or is_featured", async () => {
    await POST(request({ action: "pin" }), params);
    expect(h.updateCalls[0]).not.toHaveProperty("status");
    expect(h.updateCalls[0]).not.toHaveProperty("is_featured");
  });
});

describe("blog post approve/reject/feature still work without TJCoin", () => {
  it("approve publishes and does not throw despite no TJCoin dependency", async () => {
    const res = await POST(request({ action: "approve" }), params);
    expect(res.status).toBe(200);
    expect(h.updateCalls[0]).toEqual({ status: "published" });
  });

  it("re-approving an already-published post is idempotent", async () => {
    h.state.row = { ...h.state.row!, status: "published" };
    const res = await POST(request({ action: "approve" }), params);
    await expect(res.json()).resolves.toEqual({ ok: true, alreadyApproved: true });
    expect(h.updateCalls).toHaveLength(0);
  });

  it("feature sets is_featured true", async () => {
    const res = await POST(request({ action: "feature" }), params);
    expect(res.status).toBe(200);
    expect(h.updateCalls[0]).toEqual({ is_featured: true });
  });
});

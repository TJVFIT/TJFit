/**
 * requireAdmin (WP-SEC-04) — pins both admin gates independently:
 * ADMIN_EMAILS membership alone is sufficient (no profile row needed), and
 * profiles.role="admin" alone is sufficient (no env membership needed).
 * Neither → 403. No session → 401.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ADMIN_EMAILS must be set before requireAdmin is imported — isAdminEmail
// reads it at call time via process.env, but set it up front for clarity
// and so the module graph never sees an unset value.
process.env.ADMIN_EMAILS = "admin-by-email@example.com";

const h = vi.hoisted(() => ({
  state: {
    user: null as { id: string; email: string } | null,
    getUserError: null as unknown,
    profileRole: null as string | null,
    profileError: null as unknown
  }
}));

const mockAuthSupabase = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: h.state.user },
      error: h.state.getUserError
    }))
  },
  from: vi.fn(() => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: h.state.profileRole !== null ? { role: h.state.profileRole } : null,
          error: h.state.profileError
        })
      })
    })
  }))
}));

const mockServiceSupabase = vi.hoisted(() => ({ __serviceClient: true }));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() => mockAuthSupabase)
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: vi.fn(() => mockServiceSupabase)
}));

import { requireAdmin } from "@/lib/require-admin";

beforeEach(() => {
  h.state.user = null;
  h.state.getUserError = null;
  h.state.profileRole = null;
  h.state.profileError = null;
  mockAuthSupabase.auth.getUser.mockClear();
  mockAuthSupabase.from.mockClear();
});

describe("requireAdmin", () => {
  it("passes an ADMIN_EMAILS-only user (email listed, profiles.role is 'user')", async () => {
    h.state.user = { id: "user-1", email: "admin-by-email@example.com" };
    h.state.profileRole = "user";

    const result = await requireAdmin();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBe("user-1");
      expect(result.supabase).toBe(mockServiceSupabase);
    }
  });

  it("passes a role-admin user who is NOT in ADMIN_EMAILS", async () => {
    h.state.user = { id: "user-2", email: "not-in-env@example.com" };
    h.state.profileRole = "admin";

    const result = await requireAdmin();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBe("user-2");
    }
  });

  it("rejects with 403 when neither gate passes", async () => {
    h.state.user = { id: "user-3", email: "nobody@example.com" };
    h.state.profileRole = "user";

    const result = await requireAdmin();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
  });

  it("rejects with 401 when there is no session", async () => {
    h.state.user = null;

    const result = await requireAdmin();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });
});

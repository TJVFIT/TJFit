/**
 * Bundle PDF download — entitlement gate.
 *
 * This route is the paid-content boundary: a paid `program_orders` row is the
 * only thing (besides an admin email) that turns a bundle into a downloadable
 * dossier. It had no test, which is how the following near-miss survived:
 *
 * Security-hardening migration `20260723221731` runs
 *   `revoke all on table public.program_orders ... from anon, authenticated`
 * while this route was reading entitlement with the *session* client
 * (`auth.supabase`, anon key + cookie → role `authenticated`). Applying the
 * migration would have made every paying customer's download 403 with
 * "Purchase required" — a silent revenue outage, since nothing here failed
 * loudly.
 *
 * The fix reads entitlement with the service client. These tests pin that:
 * the row scope stays the caller's own (`auth.user.id` is session-verified),
 * and the gate fails CLOSED when the service client is unavailable.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks ----
// vi.mock factories are hoisted above every const in this file, so the shared
// state they close over has to be created with vi.hoisted().
const h = vi.hoisted(() => ({
  serviceClient: { __role: "service_role" },
  state: { serviceClientAvailable: true, isAdmin: false, purchased: false }
}));

const mockHasPurchasedProgram = vi.hoisted(() => vi.fn(async () => false));

vi.mock("@/lib/require-auth", () => ({
  requireAuth: vi.fn(async () => ({
    ok: true,
    user: { id: "user-1", email: "buyer@example.com" },
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: { full_name: "Buyer" } }) })
        })
      })
    }
  }))
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: vi.fn(() => (h.state.serviceClientAvailable ? h.serviceClient : null))
}));

vi.mock("@/lib/auth-utils", () => ({
  isAdminEmail: vi.fn(() => h.state.isAdmin)
}));

vi.mock("@/lib/purchases", () => ({
  hasPurchasedProgram: mockHasPurchasedProgram
}));

vi.mock("@/lib/bundles", () => ({
  getBundle: vi.fn((slug: string) => (slug === "missing" ? null : { slug, goal: "cut" }))
}));

vi.mock("@/lib/bundle-localization", () => ({
  localizeBundle: vi.fn(() => ({ name: "Bundle" }))
}));

vi.mock("@/lib/bundle-pdf-builder", () => ({
  buildBundlePdf: vi.fn(() => ({ output: () => new ArrayBuffer(8) }))
}));

import { GET } from "@/app/api/bundles/download/[slug]/route";

function request() {
  return { url: "https://tjfit.org/api/bundles/download/lean-12w?locale=en" } as Request;
}
const params = { params: { slug: "lean-12w" } };

beforeEach(() => {
  h.state.serviceClientAvailable = true;
  h.state.isAdmin = false;
  h.state.purchased = false;
  mockHasPurchasedProgram.mockClear();
  mockHasPurchasedProgram.mockImplementation(async () => h.state.purchased);
});

describe("bundle download entitlement gate", () => {
  it("reads entitlement with the SERVICE client, not the session client", async () => {
    h.state.purchased = true;

    await GET(request(), params);

    expect(mockHasPurchasedProgram).toHaveBeenCalledTimes(1);
    const [clientArg, userIdArg, slugArg] = mockHasPurchasedProgram.mock.calls[0] as unknown as [
      { __role: string },
      string,
      string
    ];
    // The regression guard: program_orders is revoked from `authenticated`,
    // so an entitlement read on the session client would 403 every buyer.
    expect(clientArg.__role).toBe("service_role");
    // Row scope must still be the caller's own, from the verified session.
    expect(userIdArg).toBe("user-1");
    expect(slugArg).toBe("lean-12w");
  });

  it("serves the PDF when a paid order exists", async () => {
    h.state.purchased = true;

    const res = await GET(request(), params);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("denies with 403 when there is no paid order", async () => {
    h.state.purchased = false;

    const res = await GET(request(), params);

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: "Purchase required" });
  });

  it("fails CLOSED when the service client is unavailable", async () => {
    // Misconfigured env must never hand out paid content.
    h.state.serviceClientAvailable = false;
    h.state.purchased = true;

    const res = await GET(request(), params);

    expect(res.status).toBe(500);
    expect(mockHasPurchasedProgram).not.toHaveBeenCalled();
  });

  it("lets an admin through without an order, and without touching program_orders", async () => {
    h.state.isAdmin = true;
    h.state.purchased = false;

    const res = await GET(request(), params);

    expect(res.status).toBe(200);
    expect(mockHasPurchasedProgram).not.toHaveBeenCalled();
  });

  it("404s an unknown bundle before any entitlement work", async () => {
    const res = await GET(request(), { params: { slug: "missing" } });

    expect(res.status).toBe(404);
    expect(mockHasPurchasedProgram).not.toHaveBeenCalled();
  });
});

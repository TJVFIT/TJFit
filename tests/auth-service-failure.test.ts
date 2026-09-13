import { AuthApiError, AuthSessionMissingError, AuthRetryableFetchError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_SERVICE_UNAVAILABLE, classifyAuthSessionFailure } from "@/lib/auth-session-failure";

const h = vi.hoisted(() => ({ client: vi.fn(), user: vi.fn(), profile: vi.fn(), links: vi.fn(), from: vi.fn(), logError: vi.fn(), logWarning: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: h.client }));
vi.mock("@/lib/server-log", () => ({ logServerError: h.logError, logServerWarning: h.logWarning }));
vi.mock("@/lib/auth-utils", () => ({ isAdminEmail: () => false }));

import { requireAuth } from "@/lib/require-auth";
import { GET as me } from "@/app/api/auth/me/route";

const privateDetail = "synthetic-private-provider-detail";
beforeEach(() => {
  vi.clearAllMocks();
  h.user.mockResolvedValue({ data: { user: null }, error: null });
  h.profile.mockResolvedValue({ data: { role: "user", username: "customer" }, error: null });
  h.links.mockResolvedValue({ data: null, error: null });
  h.from.mockImplementation((table: string) => {
    const query = { select: () => query, eq: () => query, or: () => query, limit: () => query, maybeSingle: () => table === "profiles" ? h.profile() : h.links() };
    return query;
  });
  h.client.mockResolvedValue({ auth: { getUser: h.user }, from: h.from });
});

async function requireResponse() {
  const result = await requireAuth();
  if (result.ok) throw new Error("Expected auth failure");
  return result.response;
}

describe("anonymous sessions versus unavailable identity services", () => {
  it.each([null, new AuthSessionMissingError(), new AuthApiError(privateDetail, 401, "bad_jwt"), new AuthApiError(privateDetail, 400, "session_expired")])(
    "treats known missing or invalid sessions as normal logout: %s", async (error) => {
      h.user.mockResolvedValue({ data: { user: null }, error });
      const session = await me();
      expect(session.status).toBe(200);
      expect(await session.json()).toEqual({ user: null, role: null });
      expect((await requireResponse()).status).toBe(401);
      expect(h.from).not.toHaveBeenCalled();
      expect(h.logError).not.toHaveBeenCalled();
      expect(h.logWarning).not.toHaveBeenCalled();
    }
  );

  it.each([
    new AuthApiError(privateDetail, 402, undefined),
    new AuthApiError(privateDetail, 429, undefined),
    new AuthApiError(privateDetail, 503, "bad_jwt"),
    new AuthRetryableFetchError(privateDetail, 0),
    new AuthApiError(privateDetail, 401, "unknown_provider_failure"),
    { message: privateDetail, code: "unexpected_failure" }
  ])("returns a sanitized retryable 503 for service failure: %s", async (error) => {
    h.user.mockResolvedValue({ data: { user: null }, error });
    expect(classifyAuthSessionFailure(error)).toBe("unavailable");
    for (const response of [await me(), await requireResponse()]) {
      expect(response.status).toBe(503);
      expect(response.headers.get("Cache-Control")).toContain("no-store");
      const body = await response.json();
      expect(body.code).toBe(AUTH_SERVICE_UNAVAILABLE);
      expect(JSON.stringify(body)).not.toContain(privateDetail);
    }
    expect(h.from).not.toHaveBeenCalled();
    expect(JSON.stringify(h.logError.mock.calls)).not.toContain(privateDetail);
  });

  it("catches a thrown network failure in both session entry points", async () => {
    h.user.mockRejectedValue(new TypeError(privateDetail));
    expect((await me()).status).toBe(503);
    const response = await requireResponse();
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe(AUTH_SERVICE_UNAVAILABLE);
    expect(JSON.stringify(h.logError.mock.calls)).not.toContain(privateDetail);
  });

  it("preserves the configuration failure code without exposing exception details", async () => {
    h.client.mockRejectedValue(new Error(privateDetail));
    for (const response of [await me(), await requireResponse()]) {
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body.code).toBe("SUPABASE_MISCONFIGURED");
      expect(JSON.stringify(body)).not.toContain(privateDetail);
    }
  });

  it.each(["returned", "thrown"])("does not fabricate role context when the profile lookup failure is %s", async (kind) => {
    h.user.mockResolvedValue({ data: { user: { id: "verified-user", email: "customer@example.com" } }, error: null });
    if (kind === "thrown") h.profile.mockRejectedValue(new Error(privateDetail));
    else h.profile.mockResolvedValue({ data: null, error: { message: privateDetail, code: "quota_exceeded" } });
    const response = await me();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ user: null, role: null, code: "PROFILE_SERVICE_UNAVAILABLE" });
    expect(h.links).not.toHaveBeenCalled();
    expect(JSON.stringify(h.logError.mock.calls)).not.toContain(privateDetail);
  });

  it("preserves a verified customer's normal identity, role and profile", async () => {
    h.user.mockResolvedValue({ data: { user: { id: "verified-user", email: "customer@example.com" } }, error: null });
    expect((await requireAuth()).ok).toBe(true);
    const response = await me();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ user: { id: "verified-user" }, role: "user", profile: { username: "customer" } });
  });
});

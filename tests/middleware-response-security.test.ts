import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockClient = vi.hoisted(() => vi.fn());
vi.mock("@supabase/ssr", () => ({ createServerClient: mockClient }));
vi.mock("@/lib/auth-utils", () => ({ isAdminEmail: () => false }));
import { middleware } from "@/middleware";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
  vi.stubEnv("LAUNCH_GATE", "coming-soon");
  mockClient.mockImplementation((_url, _key, options) => {
    options.cookies.setAll([{
      name: "session-test", value: "opaque-test-session",
      options: { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 3600 }
    }]);
    return { auth: { getUser: async () => ({ data: { user: null } }) } };
  });
});
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("session response headers", () => {
  it("forwards refreshed cookies to downstream SSR in the same request", async () => {
    const request = new NextRequest("https://tjfit.org/tr/login", { headers: { accept: "text/html", cookie: "session-test=expired" } });
    const response = await middleware(request);
    expect(request.cookies.get("session-test")?.value).toBe("opaque-test-session");
    expect(response.headers.get("x-middleware-request-cookie")).toContain("session-test=opaque-test-session");
    expect(response.headers.get("x-middleware-request-cookie")).not.toContain("expired");
  });
  it("preserves session cookie security options when the launch gate redirects", async () => {
    const response = await middleware(new NextRequest("https://tjfit.org/tr/store", { headers: { accept: "text/html" } }));
    expect(response.status).toBe(307);
    expect(response.cookies.get("session-test")).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 3600 });
  });
  it("prevents shared caching of session-dependent HTML and redirects", async () => {
    const response = await middleware(new NextRequest("https://tjfit.org/tr/store", { headers: { accept: "text/html" } }));
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
  });
});

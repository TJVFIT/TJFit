import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/app/api/webhooks/gumroad/handlers/sale", () => ({ handleSale: vi.fn() }));
import { POST as consume } from "@/app/api/admin/test/consume-credit/route";
import { POST as credit } from "@/app/api/admin/test/simulate-credit-purchase/route";
import { POST as program } from "@/app/api/admin/test/simulate-program-purchase/route";

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe.each([consume, credit, program])("admin simulation boundary", handler => {
  it.each(["NODE_ENV", "VERCEL_ENV"])("cannot be enabled in production through %s", async env => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("ALLOW_TEST_CHECKOUT", "true");
    vi.stubEnv(env, "production");
    const response = await handler(new NextRequest("https://tjfit.org/api/admin/test/simulation", { method: "POST" }));
    expect(response.status).toBe(403);
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });
  it("requires explicit opt in even in development", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("ALLOW_TEST_CHECKOUT", "false");
    expect((await handler(new NextRequest("https://tjfit.org/api/admin/test/simulation", { method: "POST" }))).status).toBe(403);
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });
});

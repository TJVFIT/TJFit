import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase-server", () => ({ getSupabaseServerClient: () => null }));
import { POST } from "@/app/api/webhooks/gumroad/route";

beforeEach(() => vi.stubEnv("GUMROAD_SELLER_ID", "configured-test-seller"));
afterEach(() => {
  vi.unstubAllEnvs();
  delete (Object.prototype as Record<string, unknown>).webhookPolluted;
});

describe("untrusted Gumroad webhook parsing", () => {
  it("stops oversized streamed webhook bodies before parsing", async () => {
    const response = await POST(new NextRequest("https://tjfit.org/api/webhooks/gumroad", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "x=" + "a".repeat(65536)
    }));
    expect(response.status).toBe(413);
  });
  it("never mutates Object.prototype before rejecting an unauthenticated form", async () => {
    const response = await POST(new NextRequest("https://tjfit.org/api/webhooks/gumroad", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "__proto__%5BwebhookPolluted%5D=yes&seller_id=wrong"
    }));
    expect([400, 401]).toContain(response.status);
    expect(Object.prototype).not.toHaveProperty("webhookPolluted");
    expect({}).not.toHaveProperty("webhookPolluted");
  });
  it.each([null, [], "text", 42, { seller_id: 123 }, { seller_id: "configured-test-seller", url_params: { tjfit_order_id: 123 } }])("rejects invalid JSON shapes without throwing", async body => {
    const response = await POST(new NextRequest("https://tjfit.org/api/webhooks/gumroad", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    }));
    expect(response.status).toBe(400);
  });
});

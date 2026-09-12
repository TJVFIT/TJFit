import { AuthApiError, AuthSessionMissingError } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  getUser: vi.fn(), client: vi.fn(), from: vi.fn(), digital: vi.fn(), legacy: vi.fn(),
  filters: [] as unknown[][], configured: true
}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: h.client }));
vi.mock("@/lib/supabase-server", () => ({ getSupabaseServerClient: () => h.configured ? { from: h.from } : null }));
import { GET as orderStatus } from "@/app/api/checkout/order-status/route";
import { POST as createOrder } from "@/app/api/checkout/create-order/route";
import { POST as prepareSession } from "@/app/api/checkout/prepare-session/route";

const owner = "6deaa048-e50c-49ab-b6d8-6d3bd1345a74";
const id = "258c4040-5c04-4ec3-a66c-2a00c1b03b9c";
const intakeId = "50c75a91-4662-4975-bec1-674dd0bab343";
const request = (value = id) => new NextRequest(`https://tjfit.example.test/api/checkout/order-status?orderId=${encodeURIComponent(value)}`);
beforeEach(() => {
  vi.clearAllMocks(); h.configured = true; h.filters.length = 0;
  h.getUser.mockResolvedValue({ data: { user: { id: owner, email: "buyer@example.test", email_confirmed_at: "2026-09-01" } }, error: null });
  h.client.mockResolvedValue({ auth: { getUser: h.getUser } });
  h.digital.mockResolvedValue({ data: null, error: null });
  h.legacy.mockResolvedValue({ data: null, error: null });
  h.from.mockImplementation((table: string) => {
    const query = {
      select: () => query,
      eq: (...filter: unknown[]) => { h.filters.push([table, ...filter]); return query; },
      maybeSingle: () => table === "digital_checkout_intents" ? h.digital() : h.legacy()
    };
    return query;
  });
});

describe("owned checkout receipts", () => {
  it("returns only the customer's receipt and intake association, without private provider data", async () => {
    h.digital.mockResolvedValue({ data: {
      status: "test_paid", test_mode: true, program_slug: "tjai-pass", product_kind: "tjai_pass",
      intake_id: intakeId, expires_at: "2026-09-13T00:00:00Z", user_id: owner,
      email: "buyer@example.test", checkout_url: "private-provider-url", checkout_id: "private-checkout"
    }, error: null });
    const response = await orderStatus(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ status: "test_paid", testMode: true, programSlug: "tjai-pass",
      productKind: "tjai_pass", intakeId, expiresAt: "2026-09-13T00:00:00Z" });
    expect(h.filters).toContainEqual(["digital_checkout_intents", "id", id]);
    expect(h.filters).toContainEqual(["digital_checkout_intents", "user_id", owner]);
    expect(h.legacy).not.toHaveBeenCalled();
  });

  it("preserves historical order status and scopes both lookups to the authenticated customer", async () => {
    h.legacy.mockResolvedValue({ data: { status: "paid" }, error: null });
    const response = await orderStatus(request());
    expect(await response.json()).toEqual({ status: "paid" });
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(h.filters).toContainEqual(["program_orders", "id", id]);
    expect(h.filters).toContainEqual(["program_orders", "user_id", owner]);
  });

  it("reports an order absent only when both owned lookups succeed without a row", async () => {
    expect((await orderStatus(request())).status).toBe(404);
    expect(h.digital).toHaveBeenCalledOnce(); expect(h.legacy).toHaveBeenCalledOnce();
  });

  it.each(["digital", "legacy"] as const)("reports unavailable instead of not found when %s storage fails", async table => {
    h[table].mockResolvedValue({ data: null, error: { message: "private-database-detail" } });
    const response = await orderStatus(request());
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("private-database-detail");
    if (table === "digital") expect(h.legacy).not.toHaveBeenCalled();
  });

  it("rejects invalid identifiers before querying storage and handles missing storage", async () => {
    expect((await orderStatus(request("invalid"))).status).toBe(400);
    expect(h.from).not.toHaveBeenCalled();
    h.configured = false;
    expect((await orderStatus(request())).status).toBe(503);
  });
});

describe("checkout authentication service failures", () => {
  const endpoints = { status: () => orderStatus(request()),
    create: () => createOrder(new NextRequest("https://tjfit.example.test/api/checkout/create-order", { method: "POST", body: "{}" })),
    prepare: () => prepareSession(new NextRequest("https://tjfit.example.test/api/checkout/prepare-session", { method: "POST", body: "{}" })) };

  it.each(Object.entries(endpoints))("%s preserves an unavailable account service instead of reporting logout", async (_name, endpoint) => {
    h.getUser.mockResolvedValue({ data: { user: null }, error: new AuthApiError("private-account-detail", 402, undefined) });
    const response = await endpoint();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Service temporarily unavailable.", code: "AUTH_SERVICE_UNAVAILABLE" });
    expect(h.from).not.toHaveBeenCalled();
  });

  it.each(Object.entries(endpoints))("%s still rejects an absent session and catches a thrown network failure", async (_name, endpoint) => {
    h.getUser.mockResolvedValue({ data: { user: null }, error: new AuthSessionMissingError() });
    expect((await endpoint()).status).toBe(401);
    h.getUser.mockRejectedValue(new TypeError("private-network-detail"));
    const response = await endpoint();
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("private-network-detail");
    expect(h.from).not.toHaveBeenCalled();
  });
});

import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getLemonCheckoutConfig, getDigitalProduct } from "@/lib/payments/lemon/config";
import { parseLemonOrderEvent, verifyLemonSignature } from "@/lib/payments/lemon/webhook";
import { resolvePaymentBackend } from "@/lib/payments/resolve-provider";

afterEach(() => vi.unstubAllEnvs());
const intentId = "a922b106-25ab-4103-8220-560962814bc8";
const event = () => ({ meta: { event_name: "order_created", custom_data: { tjfit_intent: intentId } }, data: {
  type: "orders", id: "54", attributes: { store_id: 12, test_mode: true, user_email: "buyer@example.test",
    currency: "USD", subtotal: 1999, total: 2399, tax: 400, discount_total: 0, tax_inclusive: false,
    status: "paid", refunded: false, refunded_amount: 0,
    first_order_item: { order_id: 54, product_id: 6, variant_id: 8, price: 1999, test_mode: true }
  }
} });
describe("Lemon payment boundaries", () => {
  it("closes unset and legacy Gumroad checkout instead of silently selecting it", () => {
    for (const provider of ["", "gumroad", "paddle", "lemon"]) {
      vi.stubEnv("PAYMENT_PROVIDER", provider);
      expect(resolvePaymentBackend().providerId).toBeNull();
    }
  });
  it("requires explicit live activation and never defaults to live", () => {
    vi.stubEnv("LEMON_MODE", "live");
    vi.stubEnv("LEMON_LIVE_ENABLED", "false");
    expect(getLemonCheckoutConfig()).toBeNull();
    vi.stubEnv("LEMON_MODE", "test");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getLemonCheckoutConfig()).toBeNull();
  });
  it.each([
    ["", "deploy-preview", true], ["", "branch-deploy", true],
    ["", "production", false], ["", "", false], ["", "dev", false],
    ["preview", "", true], ["production", "deploy-preview", false],
    ["preview", "production", false]
  ])("limits production-built test checkouts to trusted preview context (%s / %s)", (vercel, netlify, allowed) => {
    vi.stubEnv("ALLOW_TEST_CHECKOUT", "true");
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("VERCEL_ENV", String(vercel)); vi.stubEnv("CONTEXT", String(netlify));
    vi.stubEnv("LEMON_MODE", "test"); vi.stubEnv("LEMON_TEST_API_KEY", "fake-test-key");
    vi.stubEnv("LEMON_TEST_WEBHOOK_SECRET", "fake-test-secret"); vi.stubEnv("LEMON_TEST_STORE_ID", "12");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.test");
    vi.stubEnv("LEMON_TEST_PRODUCT_MAP_JSON", JSON.stringify({"home-starter":{productId:"7",variantId:"9"}}));
    expect(Boolean(getLemonCheckoutConfig())).toBe(allowed);
  });
  it("fixes the approved USD amount server side and rejects free/unknown products", () => {
    expect(getDigitalProduct("tjai-pass")).toEqual({ slug: "tjai-pass", kind: "tjai_pass", amountMinor: 1999 });
    expect(getDigitalProduct("made-up-product")).toBeNull();
  });
  it("authenticates exact bytes and rejects malformed or modified signatures", () => {
    const bytes = Buffer.from(JSON.stringify(event()));
    const signature = createHmac("sha256", "secret").update(bytes).digest("hex");
    expect(verifyLemonSignature(bytes, signature, "secret")).toBe(true);
    expect(verifyLemonSignature(Buffer.concat([bytes, Buffer.from(" ")]), signature, "secret")).toBe(false);
    expect(verifyLemonSignature(bytes, "aa", "secret")).toBe(false);
    expect(verifyLemonSignature(bytes, signature, "")).toBe(false);
  });
  it("extracts only an opaque intent and authoritative order fields", () => {
    expect(parseLemonOrderEvent(event(), true)).toMatchObject({ intentId, orderId: "54", storeId: "12", productId: "6", variantId: "8", amountMinor: 1999, refunded: false, testMode: true });
  });
  it("rejects mismatched mode, product item order and mutable metadata shapes", () => {
    expect(() => parseLemonOrderEvent(event(), false)).toThrow();
    const wrongOrder = event(); wrongOrder.data.attributes.first_order_item.order_id = 55;
    expect(() => parseLemonOrderEvent(wrongOrder, true)).toThrow();
    const bad = event(); bad.meta.custom_data.tjfit_intent = "other-user";
    expect(() => parseLemonOrderEvent(bad, true)).toThrow();
  });
  it("rejects discounts and malformed arithmetic rather than granting the expected SKU", () => {
    const discounted = event(); discounted.data.attributes.discount_total = 999;
    expect(() => parseLemonOrderEvent(discounted, true)).toThrow();
    const badTotal = event(); badTotal.data.attributes.total = 1;
    expect(() => parseLemonOrderEvent(badTotal, true)).toThrow();
  });
  it("treats partial refunds as revocations and rejects fake refund events", () => {
    const partial = event(); partial.meta.event_name = "order_refunded";
    partial.data.attributes.status = "partial_refund"; partial.data.attributes.refunded_amount = 100;
    expect(parseLemonOrderEvent(partial, true).refunded).toBe(true);
    const fake = event(); fake.meta.event_name = "order_refunded";
    expect(() => parseLemonOrderEvent(fake, true)).toThrow();
  });
});

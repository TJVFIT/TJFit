import { afterEach, describe, expect, it, vi } from "vitest";
import { isTestCheckoutAllowed } from "../src/lib/payments/test-checkout-policy";
import { resolvePaymentBackend } from "../src/lib/payments/resolve-provider";

afterEach(() => vi.unstubAllEnvs());
describe("simulated checkout boundary", () => {
  it.each(["NODE_ENV", "VERCEL_ENV"])("rejects production even when test checkout is enabled via %s", key => {
    vi.stubEnv("ALLOW_TEST_CHECKOUT", "true");
    vi.stubEnv("PAYMENT_PROVIDER", "test");
    vi.stubEnv(key, "production");
    expect(isTestCheckoutAllowed()).toBe(false);
    expect(resolvePaymentBackend().providerId).toBeNull();
  });
  it("does not turn a misspelled provider into a paid simulation", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("ALLOW_TEST_CHECKOUT", "true");
    vi.stubEnv("PAYMENT_PROVIDER", "gumraod");
    expect(resolvePaymentBackend().providerId).toBeNull();
    vi.stubEnv("PAYMENT_PROVIDER", "test");
    expect(resolvePaymentBackend().providerId).toBe("test");
  });
});

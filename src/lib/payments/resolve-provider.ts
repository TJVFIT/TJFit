import type { PaymentProviderId, ResolvedPaymentBackend } from "@/lib/payments/types";

/**
 * Single place to decide which payment backend is active.
 *
 * Optional override: PAYMENT_PROVIDER=live|test|none (server-only).
 * - live: real PSP handoff (`await_gateway`); wire your provider in prepare-session / webhooks.
 * - test: simulated completion when ALLOW_TEST_CHECKOUT=true.
 */
export function resolvePaymentBackend(): ResolvedPaymentBackend {
  const allowTestCheckout = process.env.ALLOW_TEST_CHECKOUT === "true";
  const override = (process.env.PAYMENT_PROVIDER ?? "").trim().toLowerCase();
  if (override === "none" || override === "off") {
    return { providerId: null, allowTestCheckout };
  }
  if (override === "test" && allowTestCheckout) {
    return { providerId: "test", allowTestCheckout };
  }
  if (override === "live") {
    return { providerId: "live", allowTestCheckout };
  }
  if (allowTestCheckout) {
    return { providerId: "test", allowTestCheckout };
  }
  return { providerId: null, allowTestCheckout };
}

export function providerIdForStorage(id: PaymentProviderId | null): string {
  return id ?? "";
}

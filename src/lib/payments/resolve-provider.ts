import type { PaymentProviderId, ResolvedPaymentBackend } from "@/lib/payments/types";
import { isTestCheckoutAllowed } from "@/lib/payments/test-checkout-policy";

/**
 * Server-only: which checkout backend is active.
 *
 * PAYMENT_PROVIDER:
 * - `lemonsqueezy` → explicit digital checkout; separate configuration gates apply.
 * - `test` → legacy development simulation adapter (no new public order route).
 * - Unset, Gumroad, unknown, `none`, or `off` → new checkout disabled.
 */
export function resolvePaymentBackend(): ResolvedPaymentBackend {
  const allowTestCheckout = isTestCheckoutAllowed();
  const override = (process.env.PAYMENT_PROVIDER ?? "").trim().toLowerCase();
  if (override === "none" || override === "off") {
    return { providerId: null, allowTestCheckout };
  }
  if (override === "test" && allowTestCheckout) {
    return { providerId: "test", allowTestCheckout };
  }
  if (override === "lemonsqueezy") {
    return { providerId: "lemonsqueezy", allowTestCheckout };
  }
  return { providerId: null, allowTestCheckout };
}

export function providerIdForStorage(id: PaymentProviderId | null): string {
  return id ?? "";
}

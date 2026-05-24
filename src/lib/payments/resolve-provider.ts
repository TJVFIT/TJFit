import type { PaymentProviderId, ResolvedPaymentBackend } from "@/lib/payments/types";

/**
 * Server-only: which checkout backend is active.
 *
 * PAYMENT_PROVIDER:
 * - `gumroad` (default when env unset) → Gumroad hosted checkout.
 * - `test` → simulated completion (requires ALLOW_TEST_CHECKOUT=true).
 * - `none` / `off` → checkout disabled.
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
  if (override === "gumroad" || override === "") {
    return { providerId: "gumroad", allowTestCheckout };
  }
  if (allowTestCheckout) {
    return { providerId: "test", allowTestCheckout };
  }
  return { providerId: null, allowTestCheckout };
}

export function providerIdForStorage(id: PaymentProviderId | null): string {
  return id ?? "";
}

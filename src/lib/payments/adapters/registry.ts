import type { CheckoutPaymentAdapter } from "@/lib/payments/adapters/types";
import { paddleCheckoutAdapter } from "@/lib/payments/adapters/paddle-checkout-adapter";
import { testCheckoutAdapter } from "@/lib/payments/adapters/test-adapter";
import type { PaymentProviderId } from "@/lib/payments/types";
import { isPaddleLiveCheckoutStored } from "@/lib/payments/stored-provider";

export function getCheckoutPaymentAdapter(providerId: PaymentProviderId): CheckoutPaymentAdapter {
  if (providerId === "test") return testCheckoutAdapter;
  return paddleCheckoutAdapter;
}

/**
 * Map a DB `program_orders.provider` string to the adapter that created the order.
 * Accepts legacy `live` (same as `paddle`).
 */
export function getCheckoutAdapterForStoredProvider(stored: string): CheckoutPaymentAdapter | null {
  if (stored === "test") return testCheckoutAdapter;
  if (isPaddleLiveCheckoutStored(stored)) return paddleCheckoutAdapter;
  return null;
}

export function allowsSimulatedPaidCompletionForStoredProvider(stored: string): boolean {
  return getCheckoutAdapterForStoredProvider(stored)?.allowsSimulatedPaidCompletion ?? false;
}

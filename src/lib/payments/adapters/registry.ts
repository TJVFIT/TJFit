import type { CheckoutPaymentAdapter } from "@/lib/payments/adapters/types";
import { createGatewayCheckoutAdapter } from "@/lib/payments/adapters/gateway-adapter";
import { testCheckoutAdapter } from "@/lib/payments/adapters/test-adapter";
import type { PaymentProviderId } from "@/lib/payments/types";

const liveCheckoutAdapter = createGatewayCheckoutAdapter("live");

export function getCheckoutPaymentAdapter(providerId: PaymentProviderId): CheckoutPaymentAdapter {
  if (providerId === "test") return testCheckoutAdapter;
  return liveCheckoutAdapter;
}

/** Resolve adapter from `program_orders.provider` (DB string). */
export function getCheckoutAdapterForStoredProvider(stored: string): CheckoutPaymentAdapter | null {
  if (stored === "test") return testCheckoutAdapter;
  if (stored === "live") return liveCheckoutAdapter;
  return null;
}

export function allowsSimulatedPaidCompletionForStoredProvider(stored: string): boolean {
  return getCheckoutAdapterForStoredProvider(stored)?.allowsSimulatedPaidCompletion ?? false;
}

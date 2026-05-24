import type { CheckoutPaymentAdapter } from "@/lib/payments/adapters/types";
import { gumroadCheckoutAdapter } from "@/lib/payments/adapters/gumroad-checkout-adapter";
import { testCheckoutAdapter } from "@/lib/payments/adapters/test-adapter";
import type { PaymentProviderId } from "@/lib/payments/types";
import {
  isGumroadCheckoutStored,
  isLegacyCheckoutStored
} from "@/lib/payments/stored-provider";

export function getCheckoutPaymentAdapter(providerId: PaymentProviderId): CheckoutPaymentAdapter {
  if (providerId === "test") return testCheckoutAdapter;
  return gumroadCheckoutAdapter;
}

/**
 * Map a DB `program_orders.provider` string to the adapter that created the order.
 * Legacy `paddle` / `live` rows resolve to the Gumroad adapter so receipts still load;
 * we no longer offer a Paddle pay-flow but historical orders remain readable.
 */
export function getCheckoutAdapterForStoredProvider(stored: string): CheckoutPaymentAdapter | null {
  if (stored === "test") return testCheckoutAdapter;
  if (isGumroadCheckoutStored(stored) || isLegacyCheckoutStored(stored)) {
    return gumroadCheckoutAdapter;
  }
  return null;
}

export function allowsSimulatedPaidCompletionForStoredProvider(stored: string): boolean {
  return getCheckoutAdapterForStoredProvider(stored)?.allowsSimulatedPaidCompletion ?? false;
}

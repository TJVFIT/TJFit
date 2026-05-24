export type {
  CheckoutClientFlow,
  PaymentProviderId,
  ResolvedPaymentBackend
} from "@/lib/payments/types";
export {
  isGumroadCheckoutStored,
  isLegacyCheckoutStored,
  STORED_CHECKOUT_PROVIDER_GUMROAD
} from "@/lib/payments/stored-provider";
export { providerIdForStorage, resolvePaymentBackend } from "@/lib/payments/resolve-provider";
export {
  allowsSimulatedPaidCompletionForStoredProvider,
  getCheckoutAdapterForStoredProvider,
  getCheckoutPaymentAdapter
} from "@/lib/payments/adapters/registry";

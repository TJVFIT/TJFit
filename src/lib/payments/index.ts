export type {
  CheckoutClientFlow,
  PaymentProviderId,
  ResolvedPaymentBackend
} from "@/lib/payments/types";
export { providerIdForStorage, resolvePaymentBackend } from "@/lib/payments/resolve-provider";
export {
  allowsSimulatedPaidCompletionForStoredProvider,
  getCheckoutAdapterForStoredProvider,
  getCheckoutPaymentAdapter
} from "@/lib/payments/adapters/registry";

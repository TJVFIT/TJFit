import type { CheckoutClientFlow, PaymentProviderId } from "@/lib/payments/types";

export type OrderRowForCheckoutFlow = {
  id: string;
  finalAmountTry: number;
  currency: string;
};

/**
 * One implementation per stored `program_orders.provider` value.
 * Add gateway session creation in a server route that delegates here later.
 */
export interface CheckoutPaymentAdapter {
  readonly id: PaymentProviderId;
  /** When true, `POST /api/checkout/complete-order` may mark the order paid (dev / sandbox only). */
  allowsSimulatedPaidCompletion: boolean;
  clientFlowAfterOrderCreated(order: OrderRowForCheckoutFlow): CheckoutClientFlow;
}

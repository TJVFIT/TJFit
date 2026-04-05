import type { CheckoutClientFlow, PaymentProviderId } from "@/lib/payments/types";

export type OrderRowForCheckoutFlow = {
  id: string;
  finalAmountTry: number;
  currency: string;
};

/**
 * One implementation per stored `program_orders.provider` value (`paddle` | `test`; legacy `live` → paddle).
 */
export interface CheckoutPaymentAdapter {
  readonly id: PaymentProviderId;
  /** When true, `POST /api/checkout/complete-order` may mark the order paid (dev / sandbox only). */
  allowsSimulatedPaidCompletion: boolean;
  clientFlowAfterOrderCreated(order: OrderRowForCheckoutFlow): CheckoutClientFlow;
}

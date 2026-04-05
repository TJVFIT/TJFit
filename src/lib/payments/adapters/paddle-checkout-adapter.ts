import type { CheckoutPaymentAdapter } from "@/lib/payments/adapters/types";

/**
 * Paddle Billing: browser opens overlay checkout after `prepare-session` creates a transaction.
 */
export const paddleCheckoutAdapter: CheckoutPaymentAdapter = {
  id: "paddle",
  allowsSimulatedPaidCompletion: false,
  clientFlowAfterOrderCreated(order) {
    return {
      action: "await_gateway",
      orderId: order.id,
      amount: { value: order.finalAmountTry, currency: order.currency }
    };
  }
};

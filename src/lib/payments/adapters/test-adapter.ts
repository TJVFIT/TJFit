import type { CheckoutPaymentAdapter } from "@/lib/payments/adapters/types";

export const testCheckoutAdapter: CheckoutPaymentAdapter = {
  id: "test",
  allowsSimulatedPaidCompletion: true,
  clientFlowAfterOrderCreated(order) {
    return { action: "complete_simulated", orderId: order.id };
  }
};

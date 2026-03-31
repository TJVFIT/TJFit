import type { CheckoutPaymentAdapter } from "@/lib/payments/adapters/types";
import type { PaymentProviderId } from "@/lib/payments/types";

/** Live PSP handoff — same shape for any gateway you plug in later. */
export function createGatewayCheckoutAdapter(
  id: Exclude<PaymentProviderId, "test">
): CheckoutPaymentAdapter {
  return {
    id,
    allowsSimulatedPaidCompletion: false,
    clientFlowAfterOrderCreated(order) {
      return {
        action: "await_gateway",
        orderId: order.id,
        amount: { value: order.finalAmountTry, currency: order.currency }
      };
    }
  };
}

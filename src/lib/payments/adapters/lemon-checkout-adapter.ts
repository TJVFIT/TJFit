import type { CheckoutPaymentAdapter } from "./types";

export const lemonCheckoutAdapter: CheckoutPaymentAdapter = {
  id: "lemonsqueezy",
  allowsSimulatedPaidCompletion: false,
  clientFlowAfterOrderCreated: order => ({ action: "redirect_lemon", orderId: order.id, url: "" })
};

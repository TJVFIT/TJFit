import type { CheckoutPaymentAdapter } from "@/lib/payments/adapters/types";

/**
 * Gumroad hosted checkout: server resolves the product URL, browser
 * window.location.href = url. Fulfillment is handled by the Gumroad
 * webhook (src/app/api/webhooks/gumroad/route.ts).
 *
 * The url itself is produced by `getGumroadCheckoutUrl()` from
 * `src/lib/gumroad/client.ts` and embedded in `prepare-session`'s response.
 */
export const gumroadCheckoutAdapter: CheckoutPaymentAdapter = {
  id: "gumroad",
  allowsSimulatedPaidCompletion: false,
  clientFlowAfterOrderCreated(order) {
    return {
      action: "redirect_gumroad",
      orderId: order.id,
      // Placeholder; the real URL is appended by the prepare-session route
      // before the client flow is sent to the browser.
      url: ""
    };
  }
};

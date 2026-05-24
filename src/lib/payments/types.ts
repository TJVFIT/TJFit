/**
 * Checkout provider resolution (env) and `program_orders.provider` storage.
 *
 * - `gumroad` — Gumroad hosted checkout (Merchant of Record). Default live.
 * - `test`    — Simulated paid completion when ALLOW_TEST_CHECKOUT=true.
 */

export type PaymentProviderId = "gumroad" | "test";

export type ResolvedPaymentBackend = {
  /** Active provider for new orders, or null if checkout must be disabled. */
  providerId: PaymentProviderId | null;
  /** Whether sandbox / dev test completion is allowed. */
  allowTestCheckout: boolean;
};

/**
 * What the browser should do after `POST /api/checkout/create-order` succeeds.
 */
export type CheckoutClientFlow =
  | { action: "complete_simulated"; orderId: string }
  | {
      action: "redirect_gumroad";
      orderId: string;
      url: string;
    };

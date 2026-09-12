/**
 * Checkout provider resolution (env) and `program_orders.provider` storage.
 *
 * - `lemonsqueezy` — explicitly configured test/live digital checkout.
 * - `gumroad` — historical records only; new checkout is closed.
 * - `test` — historical development simulation when ALLOW_TEST_CHECKOUT=true.
 */

export type PaymentProviderId = "gumroad" | "lemonsqueezy" | "test";

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
      action: "redirect_gumroad" | "redirect_lemon";
      orderId: string;
      url: string;
    };

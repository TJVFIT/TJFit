/**
 * Checkout provider resolution (env) and `program_orders.provider` storage.
 *
 * - `paddle` — Paddle Billing (live). Env: PAYMENT_PROVIDER=paddle or live (alias).
 * - `test` — Simulated paid completion when ALLOW_TEST_CHECKOUT=true.
 */

export type PaymentProviderId = "paddle" | "test";

export type ResolvedPaymentBackend = {
  /** Active provider for new orders, or null if checkout must be disabled. */
  providerId: PaymentProviderId | null;
  /** Whether sandbox / dev test completion is allowed. */
  allowTestCheckout: boolean;
};

/**
 * What the browser should do after `POST /api/checkout/create-order` succeeds.
 * `await_gateway` is the Paddle overlay handoff (name kept for minimal UI churn).
 */
export type CheckoutClientFlow =
  | { action: "complete_simulated"; orderId: string }
  | {
      action: "await_gateway";
      orderId: string;
      amount: { value: number; currency: string };
    };

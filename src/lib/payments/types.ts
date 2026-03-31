/**
 * Provider-agnostic payment types. Adapters map stored `program_orders.provider` into checkout flows.
 */

export type PaymentProviderId = "live" | "test";

export type ResolvedPaymentBackend = {
  /** Active provider for new orders, or null if checkout must be disabled. */
  providerId: PaymentProviderId | null;
  /** Whether sandbox / dev test completion is allowed. */
  allowTestCheckout: boolean;
};

/**
 * What the browser should do after `POST /api/checkout/create-order` succeeds.
 * UI branches on `action` only — never on raw provider ids.
 */
export type CheckoutClientFlow =
  | { action: "complete_simulated"; orderId: string }
  | {
      action: "await_gateway";
      orderId: string;
      amount: { value: number; currency: string };
    };

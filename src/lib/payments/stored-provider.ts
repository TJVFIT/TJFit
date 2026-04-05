/**
 * `program_orders.provider` values for checkout.
 *
 * Live production payments are **Paddle Billing only**. Legacy rows may still use `live` (pre-normalization).
 */

/** Written to the database for new Paddle checkouts. */
export const STORED_CHECKOUT_PROVIDER_PADDLE = "paddle";

const LEGACY_LIVE_ALIAS = "live";

export function isPaddleLiveCheckoutStored(provider: string): boolean {
  const p = provider.trim().toLowerCase();
  return p === STORED_CHECKOUT_PROVIDER_PADDLE || p === LEGACY_LIVE_ALIAS;
}

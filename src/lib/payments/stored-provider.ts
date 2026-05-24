/**
 * `program_orders.provider` values for checkout.
 * Live production payments are Gumroad-only. Legacy `paddle` / `live` rows are
 * tolerated by `isLegacyCheckoutStored` so existing receipts still resolve.
 */

export const STORED_CHECKOUT_PROVIDER_GUMROAD = "gumroad";

const LEGACY_PADDLE_ALIASES = ["paddle", "live"];

export function isGumroadCheckoutStored(provider: string): boolean {
  return provider.trim().toLowerCase() === STORED_CHECKOUT_PROVIDER_GUMROAD;
}

export function isLegacyCheckoutStored(provider: string): boolean {
  return LEGACY_PADDLE_ALIASES.includes(provider.trim().toLowerCase());
}

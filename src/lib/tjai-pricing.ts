// Prices are zeroed platform-wide until the owner sets them. Architecture preserved.
export const TJAI_ONE_TIME_PRICE_USD = 0;

export const TJAI_SUBSCRIPTION_PRICES_USD = {
  core: { monthly: 0, annual: 0 },
  pro: { monthly: 0, annual: 0 },
  apex: { monthly: 0, annual: 0 }
} as const;

export type TjaiPaidTier = "pro" | "apex";

export function getAnnualSavingsPercent(monthly: number, annual: number) {
  const fullYear = monthly * 12;
  if (fullYear <= 0) return 0;
  return Math.round(((fullYear - annual) / fullYear) * 100);
}

export function formatMonthlyPriceUsd(price: number) {
  return `$${price}/mo`;
}

export function formatOneTimePriceUsd(price: number) {
  return `$${price}`;
}

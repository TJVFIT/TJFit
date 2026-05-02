// Locked pricing model (master upgrade prompt 2026-05-02). Tier-1 (US/EU/UK/AU)
// prices in USD. Tiered regional pricing handled separately in
// `src/lib/pricing/locale-tier.ts`. TJAI plan generation is NEVER bundled into
// a subscription — subs unlock more *usage* of TJAI chat after the user has
// paid for a plan, never the plan itself.
export const TJAI_ONE_TIME_PRICE_USD = 8;

export const TJAI_SUBSCRIPTION_PRICES_USD = {
  core: { monthly: 0, annual: 0 },
  pro: { monthly: 10, annual: 79 },
  apex: { monthly: 19.99, annual: 159 }
} as const;

// One-time content pricing (charm endings per the 1,200-paywall study).
export const PROGRAM_PRICE_USD = 5.99;
export const DIET_PRICE_USD = 4.99;

// Locked bundle SKUs — high AOV, low complexity.
export const BUNDLE_PRICES_USD = {
  starterStack: 9.99, // 1 program + 1 diet (saves $0.99)
  transformBundle: 34.99, // 3 programs + 2 diets + 1 TJAI plan (saves ~$10)
  proPlusTjaiFirstMonth: 14 // Pro $10 + TJAI $8 reduced to $4 first month
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

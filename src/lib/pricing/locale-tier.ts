// Regional pricing tier helper.
//
// Tier 1 (US/EU/UK/AU and other developed markets) pays the canonical
// USD prices. Tier 2 / Tier 3 receive purchasing-power-adjusted
// equivalents — this captures meaningful LTV in MENA / LATAM / SEA
// without leaving money on the table in core markets.
//
// Tier 1 is the only tier wired live in this commit. Tier 2 and Tier 3
// values are defined but the consuming UI (catalog cards, /pro page,
// Paddle checkout product mapping) only reads from Tier 1 until the
// owner flips the per-tier Paddle product IDs in env.
//
// To activate a tier:
//   1. Create matching Paddle products + price IDs in your Paddle dashboard
//   2. Set the env vars (see `tierActiveFlag` below)
//   3. Tier resolution then routes by request country header / user profile

export type PricingTier = 1 | 2 | 3;

export type PricedItem =
  | "program"
  | "diet"
  | "tjaiPlan"
  | "proMonthly"
  | "proAnnual"
  | "apexMonthly"
  | "apexAnnual"
  | "starterStack"
  | "transformBundle";

export type TierPriceTable = Record<PricedItem, number>;

// Tier 1 — canonical USD list prices. Charm endings (.99/.49) per the
// 1,200-paywall study cited in the master upgrade prompt.
export const TIER_1_PRICES_USD: TierPriceTable = {
  program: 5.99,
  diet: 4.99,
  tjaiPlan: 8,
  proMonthly: 10,
  proAnnual: 79,
  apexMonthly: 19.99,
  apexAnnual: 159,
  starterStack: 9.99,
  transformBundle: 34.99
};

// Tier 2 — purchasing-power-adjusted USD for TR / MX / BR / ZA and
// similar mid-tier markets. ~50% of Tier 1.
export const TIER_2_PRICES_USD: TierPriceTable = {
  program: 2.99,
  diet: 2.49,
  tjaiPlan: 3.99,
  proMonthly: 4.99,
  proAnnual: 39,
  apexMonthly: 9.99,
  apexAnnual: 79,
  starterStack: 4.99,
  transformBundle: 17.49
};

// Tier 3 — emerging markets (IQ / EG / IN / ID / PK and similar).
// ~33% of Tier 1.
export const TIER_3_PRICES_USD: TierPriceTable = {
  program: 1.99,
  diet: 1.49,
  tjaiPlan: 2.99,
  proMonthly: 3.49,
  proAnnual: 27,
  apexMonthly: 6.99,
  apexAnnual: 56,
  starterStack: 3.29,
  transformBundle: 11.49
};

const TIER_TABLE: Record<PricingTier, TierPriceTable> = {
  1: TIER_1_PRICES_USD,
  2: TIER_2_PRICES_USD,
  3: TIER_3_PRICES_USD
};

// ISO-3166 country code → tier mapping. Anything unmapped falls back
// to Tier 1 (charge the full rate by default — never undercharge a
// market we don't recognize).
const COUNTRY_TIER: Record<string, PricingTier> = {
  // Tier 1 (developed)
  US: 1, CA: 1, GB: 1, AU: 1, NZ: 1, JP: 1, KR: 1, SG: 1, HK: 1, IL: 1,
  DE: 1, FR: 1, IT: 1, ES: 1, NL: 1, BE: 1, AT: 1, CH: 1, IE: 1, SE: 1, NO: 1, DK: 1, FI: 1,
  PT: 1, GR: 1, LU: 1,

  // Tier 2 (mid)
  TR: 2, MX: 2, BR: 2, ZA: 2, AR: 2, CL: 2, CO: 2, PE: 2, MY: 2, TH: 2, VN: 2, PH: 2,
  RO: 2, PL: 2, CZ: 2, HU: 2, RU: 2, SA: 2, AE: 2, KW: 2, QA: 2, BH: 2, OM: 2,

  // Tier 3 (emerging)
  IQ: 3, EG: 3, IN: 3, ID: 3, PK: 3, BD: 3, NG: 3, KE: 3, ET: 3, MA: 3, TN: 3,
  DZ: 3, JO: 3, LB: 3, SY: 3, YE: 3, LK: 3, NP: 3, KH: 3, MM: 3
};

const TIER_LIVE_FLAGS: Record<PricingTier, boolean> = {
  1: true,
  2: process.env.NEXT_PUBLIC_TIER_2_LIVE === "true",
  3: process.env.NEXT_PUBLIC_TIER_3_LIVE === "true"
};

export function resolveTier(countryCode: string | null | undefined): PricingTier {
  if (!countryCode) return 1;
  const normalized = countryCode.trim().toUpperCase();
  const tier = COUNTRY_TIER[normalized] ?? 1;
  return TIER_LIVE_FLAGS[tier] ? tier : 1;
}

export function getTierPrices(tier: PricingTier): TierPriceTable {
  return TIER_TABLE[tier];
}

export function getPrice(item: PricedItem, tier: PricingTier = 1): number {
  return getTierPrices(tier)[item];
}

// Format price for display. Tabular-numerals friendly — call sites
// should wrap in `<span class="tabular-nums">`.
export function formatTierPrice(price: number, currency: "USD" = "USD"): string {
  if (currency === "USD") {
    return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
  }
  return `${price}`;
}

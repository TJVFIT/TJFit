import { TJAI_SUBSCRIPTION_PRICES_USD } from "@/lib/tjai-pricing";

export type SubscriptionTier = "core" | "pro" | "apex";

export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTier,
  { name: string; monthlyUsd: number; yearlyUsd: number; badge?: "pro" | "apex" }
> = {
  core: { name: "Core", monthlyUsd: TJAI_SUBSCRIPTION_PRICES_USD.core.monthly, yearlyUsd: TJAI_SUBSCRIPTION_PRICES_USD.core.annual },
  pro: { name: "Pro", monthlyUsd: TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly, yearlyUsd: TJAI_SUBSCRIPTION_PRICES_USD.pro.annual, badge: "pro" },
  apex: { name: "Apex", monthlyUsd: TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly, yearlyUsd: TJAI_SUBSCRIPTION_PRICES_USD.apex.annual, badge: "apex" }
};

export function hasTJAIFullAccess(tier: SubscriptionTier) {
  return tier === "apex";
}

export function hasProAccess(tier: SubscriptionTier) {
  return tier === "pro" || tier === "apex";
}


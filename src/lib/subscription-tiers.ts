export type SubscriptionTier = "core" | "pro" | "apex";

export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTier,
  { name: string; monthlyEur: number; yearlyEur: number; badge?: "pro" | "apex" }
> = {
  core: { name: "Core", monthlyEur: 0, yearlyEur: 0 },
  pro: { name: "Pro", monthlyEur: 10, yearlyEur: 100, badge: "pro" },
  apex: { name: "Apex", monthlyEur: 20, yearlyEur: 200, badge: "apex" }
};

export function hasTJAIFullAccess(tier: SubscriptionTier) {
  return tier === "apex";
}

export function hasProAccess(tier: SubscriptionTier) {
  return tier === "pro" || tier === "apex";
}


export type SubscriptionTier = "core" | "pro" | "apex";

export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTier,
  { name: string; monthlyEur: number; yearlyEur: number; badge?: "pro" | "apex" }
> = {
  core: { name: "Core", monthlyEur: 0, yearlyEur: 0 },
  pro: { name: "Pro", monthlyEur: 20, yearlyEur: 180, badge: "pro" },
  apex: { name: "Apex", monthlyEur: 35, yearlyEur: 320, badge: "apex" }
};

export function hasTJAIFullAccess(tier: SubscriptionTier) {
  return tier === "apex";
}

export function hasProAccess(tier: SubscriptionTier) {
  return tier === "pro" || tier === "apex";
}


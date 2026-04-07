import type { SubscriptionTier } from "@/lib/subscription-tiers";

export type TJAIAccess = {
  tier: SubscriptionTier;
  hasOneTimePlanPurchase: boolean;
  canGeneratePlan: boolean;
  canRegeneratePlan: boolean;
  canUseChat: boolean;
  canUseMealSwap: boolean;
  canUseProgress: boolean;
  canDownloadPdf: boolean;
  coreChatLimit: number;
};

export function getTJAIAccess(
  tier: SubscriptionTier,
  options?: {
    hasOneTimePlanPurchase?: boolean;
    coreTrialMessagesRemaining?: number;
  }
): TJAIAccess {
  const hasOneTimePlanPurchase = Boolean(options?.hasOneTimePlanPurchase);
  const remaining = Math.max(0, Number(options?.coreTrialMessagesRemaining ?? 0));
  const isCore = tier === "core";
  const isPro = tier === "pro";
  const isApex = tier === "apex";

  return {
    tier,
    hasOneTimePlanPurchase,
    canGeneratePlan: isPro || isApex || hasOneTimePlanPurchase,
    canRegeneratePlan: isApex,
    canUseChat: isApex || (isCore && remaining > 0),
    canUseMealSwap: isPro || isApex,
    canUseProgress: true,
    canDownloadPdf: isPro || isApex || hasOneTimePlanPurchase,
    coreChatLimit: 10
  };
}

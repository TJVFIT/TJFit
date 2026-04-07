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
    isAdmin?: boolean;
  }
): TJAIAccess {
  const isAdmin = Boolean(options?.isAdmin);
  if (isAdmin) {
    return {
      tier: "apex",
      hasOneTimePlanPurchase: true,
      canGeneratePlan: true,
      canRegeneratePlan: true,
      canUseChat: true,
      canUseMealSwap: true,
      canUseProgress: true,
      canDownloadPdf: true,
      coreChatLimit: 10
    };
  }
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

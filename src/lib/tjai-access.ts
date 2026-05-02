import type { SubscriptionTier } from "@/lib/subscription-tiers";

export type TJAIAccess = {
  tier: SubscriptionTier;
  hasOneTimePlanPurchase: boolean;
  canAccessHub: boolean;
  canGeneratePlan: boolean;
  canRegeneratePlan: boolean;
  canUseChat: boolean;
  canUseMealSwap: boolean;
  canUseProgress: boolean;
  canDownloadPdf: boolean;
  canUseDailyMealEmail: boolean;
  canUseEarlyAccessPerks: boolean;
  canRequestCoachReview: boolean;
  mealSwapDailyLimit: number;
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
      canAccessHub: true,
      canGeneratePlan: true,
      canRegeneratePlan: true,
      canUseChat: true,
      canUseMealSwap: true,
      canUseProgress: true,
      canDownloadPdf: true,
      canUseDailyMealEmail: true,
      canUseEarlyAccessPerks: true,
      canRequestCoachReview: true,
      mealSwapDailyLimit: 999,
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
    canAccessHub: hasOneTimePlanPurchase || isPro || isApex || (isCore && remaining > 0),
    canGeneratePlan: hasOneTimePlanPurchase,
    canRegeneratePlan: hasOneTimePlanPurchase && isApex,
    canUseChat: isApex || isPro || (isCore && remaining > 0),
    canUseMealSwap: hasOneTimePlanPurchase && (isPro || isApex),
    canUseProgress: hasOneTimePlanPurchase || isPro || isApex,
    canDownloadPdf: hasOneTimePlanPurchase,
    canUseDailyMealEmail: isPro || isApex,
    canUseEarlyAccessPerks: isPro || isApex,
    canRequestCoachReview: isPro || isApex,
    mealSwapDailyLimit: isApex ? 10 : isPro ? 3 : 0,
    coreChatLimit: 10
  };
}

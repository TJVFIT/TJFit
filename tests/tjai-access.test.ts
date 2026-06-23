import { describe, it, expect } from "vitest";

import { getTJAIAccess } from "@/lib/tjai-access";

/**
 * Locks the paid-feature entitlement matrix so a refactor can't silently
 * widen access (e.g. give free Core users chat, or let Pro regenerate plans).
 * This is the gate the RLS fixes protect at the DB layer; this protects it in code.
 */
describe("getTJAIAccess — entitlement matrix", () => {
  it("Core, no purchase, no trial messages → locked out", () => {
    const a = getTJAIAccess("core", { coreTrialMessagesRemaining: 0 });
    expect(a.canAccessHub).toBe(false);
    expect(a.canUseChat).toBe(false);
    expect(a.canGeneratePlan).toBe(false);
    expect(a.canRegeneratePlan).toBe(false);
    expect(a.mealSwapDailyLimit).toBe(0);
  });

  it("Core with trial messages → hub + chat, but no generation without purchase", () => {
    const a = getTJAIAccess("core", { coreTrialMessagesRemaining: 3 });
    expect(a.canAccessHub).toBe(true);
    expect(a.canUseChat).toBe(true);
    expect(a.canGeneratePlan).toBe(false);
  });

  it("Core free chat is strictly gated by remaining (no negative bypass)", () => {
    const a = getTJAIAccess("core", { coreTrialMessagesRemaining: -5 });
    expect(a.canUseChat).toBe(false);
  });

  it("Pro → chat/progress/daily-email/coach-review, but regeneration is Apex-only", () => {
    const a = getTJAIAccess("pro");
    expect(a.canUseChat).toBe(true);
    expect(a.canUseProgress).toBe(true);
    expect(a.canUseDailyMealEmail).toBe(true);
    expect(a.canRequestCoachReview).toBe(true);
    expect(a.canRegeneratePlan).toBe(false);
    expect(a.mealSwapDailyLimit).toBe(3);
  });

  it("Apex + one-time purchase → full access incl. regeneration + meal swap (limit 10)", () => {
    const a = getTJAIAccess("apex", { hasOneTimePlanPurchase: true });
    expect(a.canRegeneratePlan).toBe(true);
    expect(a.canUseMealSwap).toBe(true);
    expect(a.mealSwapDailyLimit).toBe(10);
    expect(a.canGeneratePlan).toBe(true);
    expect(a.canDownloadPdf).toBe(true);
  });

  it("Apex without a purchase → tier perks on, but generate/regenerate/meal-swap stay purchase-gated", () => {
    const a = getTJAIAccess("apex", { hasOneTimePlanPurchase: false });
    expect(a.canUseChat).toBe(true);
    expect(a.canGeneratePlan).toBe(false);
    expect(a.canRegeneratePlan).toBe(false);
    expect(a.canUseMealSwap).toBe(false);
  });

  it("One-time purchase unlocks generate + pdf + progress + hub for Core", () => {
    const a = getTJAIAccess("core", { hasOneTimePlanPurchase: true });
    expect(a.canGeneratePlan).toBe(true);
    expect(a.canDownloadPdf).toBe(true);
    expect(a.canUseProgress).toBe(true);
    expect(a.canAccessHub).toBe(true);
  });

  it("Admin → everything unlocked regardless of tier inputs", () => {
    const a = getTJAIAccess("core", { isAdmin: true });
    expect(a.tier).toBe("apex");
    expect(a.canAccessHub && a.canUseChat && a.canRegeneratePlan && a.canRequestCoachReview).toBe(true);
  });
});

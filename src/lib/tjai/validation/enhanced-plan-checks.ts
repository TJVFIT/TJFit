import { isTjaiStrictPlanValidation } from "@/lib/tjai/feature-flags";
import type { TJAIPlan, TJAIMetrics } from "@/lib/tjai-types";

export type EnhancedPlanCheckResult = { ok: true } | { ok: false; reason: string };

/**
 * Optional second-pass checks when TJAI_STRICT_PLAN_VALIDATION=true.
 * Catches large drift between server metrics and model-written summary (hallucination guard).
 */
export function runEnhancedPlanCoherenceChecks(plan: TJAIPlan, metrics: TJAIMetrics): EnhancedPlanCheckResult {
  if (!isTjaiStrictPlanValidation()) return { ok: true };

  const summary = plan.summary;
  const ct = summary.calorieTarget;
  const mt = metrics.calorieTarget;
  if (Number.isFinite(ct) && Number.isFinite(mt) && mt > 0) {
    const drift = Math.abs(ct - mt) / mt;
    if (drift > 0.15) {
      return { ok: false, reason: `calorieTarget drift: plan summary ${ct} vs server ${mt}` };
    }
  }

  const sp = summary.protein;
  const mp = metrics.protein;
  if (Number.isFinite(sp) && Number.isFinite(mp) && mp > 0) {
    const drift = Math.abs(sp - mp) / mp;
    if (drift > 0.2) {
      return { ok: false, reason: `protein drift: plan summary ${sp} vs server ${mp}` };
    }
  }

  return { ok: true };
}

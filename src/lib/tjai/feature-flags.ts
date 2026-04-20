/**
 * Feature flags for TJAI orchestration — safe defaults for production.
 */

export function isTjaiStrictPlanValidation(): boolean {
  return process.env.TJAI_STRICT_PLAN_VALIDATION === "true";
}

export function isTjaiDebugPipeline(): boolean {
  return process.env.TJAI_DEBUG_PIPELINE === "true";
}

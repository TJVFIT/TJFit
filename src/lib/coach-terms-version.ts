/**
 * Bump this env when coach terms change materially; coaches must re-accept.
 * Server-only preferred; exposed to client only where needed for display.
 */
export function getCoachTermsVersion() {
  return (process.env.COACH_TERMS_VERSION ?? "1.0").trim() || "1.0";
}

/** Static default for docs and migrations; runtime version is `getCoachTermsVersion()`. */
export const CURRENT_COACH_TERMS_VERSION = "1.0";

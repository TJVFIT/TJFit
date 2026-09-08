/** Simulated purchases must never grant entitlements in a production deployment. */
export function isTestCheckoutAllowed() {
  return process.env.ALLOW_TEST_CHECKOUT === "true"
    && process.env.NODE_ENV !== "production"
    && process.env.VERCEL_ENV !== "production";
}

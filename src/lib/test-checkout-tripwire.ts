/**
 * WP-SEC-06 — boot-time tripwire for ALLOW_TEST_CHECKOUT left on in
 * production. The request-time gate in
 * src/app/api/checkout/complete-order/route.ts (defense in depth, untouched
 * by this change) only alarms when a non-admin actually hits the route. This
 * pure evaluator lets src/instrumentation.ts alarm ONCE at boot, so the
 * misconfiguration cannot linger unnoticed simply because nobody happened to
 * call the route yet.
 *
 * "Production" here matches the request-time gate: VERCEL_ENV === "production"
 * on Vercel, or — for non-Vercel deployments where VERCEL_ENV is never set —
 * NODE_ENV === "production".
 */

export type TripwireEnv = {
  ALLOW_TEST_CHECKOUT?: string;
  VERCEL_ENV?: string;
  NODE_ENV?: string;
};

export type TripwireResult = {
  fire: boolean;
  message: string;
};

const MESSAGE =
  "TRIPWIRE: ALLOW_TEST_CHECKOUT=true in PRODUCTION at boot — test order completion is live for any request that reaches it. Unset the env var.";

export function evaluateTestCheckoutTripwire(env: TripwireEnv): TripwireResult {
  const isProduction = env.VERCEL_ENV
    ? env.VERCEL_ENV === "production"
    : env.NODE_ENV === "production";

  const fire = env.ALLOW_TEST_CHECKOUT === "true" && isProduction;

  return { fire, message: MESSAGE };
}

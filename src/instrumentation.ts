export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");

    // WP-SEC-06: alarm ONCE at boot if ALLOW_TEST_CHECKOUT is left on in
    // production, rather than only on the first request that hits the
    // checkout test-completion route (the request-time gate there stays as
    // defense in depth).
    const { evaluateTestCheckoutTripwire } = await import("./lib/test-checkout-tripwire");
    const Sentry = await import("@sentry/nextjs");
    const { fire, message } = evaluateTestCheckoutTripwire({
      ALLOW_TEST_CHECKOUT: process.env.ALLOW_TEST_CHECKOUT,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NODE_ENV: process.env.NODE_ENV
    });
    if (fire) {
      console.error(message);
      Sentry.captureMessage(message, "fatal");
    }
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

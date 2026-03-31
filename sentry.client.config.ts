import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    // Session Replay patches the DOM/canvas and has destabilized WebGL-heavy pages; keep off until isolated.
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0
  });
}

import * as Sentry from "@sentry/nextjs";
import { scrubTelemetryEvent } from './src/lib/telemetry-privacy';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubTelemetryEvent,
    debug: false,
    // Session Replay patches the DOM/canvas and has destabilized WebGL-heavy pages; keep off until isolated.
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0
  });
}

// Required by Next 14 + Sentry to instrument client-side navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

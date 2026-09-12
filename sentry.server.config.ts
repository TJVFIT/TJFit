import * as Sentry from "@sentry/nextjs";
import { scrubTelemetryEvent } from './src/lib/telemetry-privacy';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubTelemetryEvent,
    debug: false
  });
}

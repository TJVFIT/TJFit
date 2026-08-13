import * as Sentry from "@sentry/nextjs";

import { redactPiiDeep } from "@/lib/redact-pii";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    // Defense-in-depth: no event leaves with an email in it, whatever path
    // a payload-derived string took (message, exception, context, extra).
    beforeSend(event) {
      return redactPiiDeep(event);
    }
  });
}

import * as Sentry from "@sentry/nextjs";

/**
 * Logs server-side failures for ops visibility (stdout / Vercel logs) and Sentry when configured.
 */
export function logServerError(scope: string, err: unknown, extra?: Record<string, unknown>): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[TJFit:${scope}]`, message, extra && Object.keys(extra).length ? extra : "");

  if (err instanceof Error) {
    Sentry.captureException(err, { tags: { scope }, extra });
  } else {
    Sentry.captureMessage(`[${scope}] ${message}`, { level: "error", extra });
  }
}

export function logServerWarning(scope: string, message: string, extra?: Record<string, unknown>): void {
  console.warn(`[TJFit:${scope}]`, message, extra && Object.keys(extra).length ? extra : "");
}

import * as Sentry from "@sentry/nextjs";

/**
 * Logs server-side failures for ops visibility (stdout / Vercel logs) and Sentry when configured.
 */
export function logServerError(scope: string, err: unknown, _extra?: Record<string, unknown>): void {
  const label = scope.replace(/[^a-zA-Z0-9_:/.-]/g, '').slice(0, 80);
  // Provider/database errors may embed submitted health data or credentials.
  // Ordinary logs contain a stable scope only; never request bodies or extras.
  console.error(`[TJFit:${label}]`, 'operation_failed');

  if (err instanceof Error) {
    Sentry.captureException(err, { tags: { scope: label } });
  } else {
    Sentry.captureMessage(`[${label}] operation_failed`, { level: "error" });
  }
}

export function logServerWarning(scope: string, _message: string, _extra?: Record<string, unknown>): void {
  const label = scope.replace(/[^a-zA-Z0-9_:/.-]/g, '').slice(0, 80);
  console.warn(`[TJFit:${label}]`, 'operation_warning');
}

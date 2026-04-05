/**
 * Secret-safe logging for Paddle (server-only).
 *
 * - Never log API keys, webhook secrets, client tokens, raw signatures, or full request bodies.
 * - Use `PADDLE_DEBUG_LOG=true` (or `1`) for verbose success-path logs in staging/preview.
 * - Signature failures and fulfillment errors always log at warn/error with minimal context.
 */

const TRUTHY = new Set(["1", "true", "yes", "on"]);

export function isPaddleDebugLogEnabled(): boolean {
  const v = process.env.PADDLE_DEBUG_LOG?.trim().toLowerCase();
  return v ? TRUTHY.has(v) : false;
}

/** Shorten Paddle-style ids for logs (txn_…, pri_…, evt_…). */
export function redactPaddleId(id: string | undefined | null, keep = 14): string {
  if (!id || typeof id !== "string") return "(none)";
  if (id.length <= keep) return `${id.slice(0, 3)}…`;
  return `${id.slice(0, keep)}…`;
}

export function paddleLogDebug(scope: string, message: string, meta?: Record<string, unknown>): void {
  if (!isPaddleDebugLogEnabled()) return;
  console.log(`[paddle:debug][${scope}] ${message}`, meta && Object.keys(meta).length ? meta : "");
}

export function paddleLogInfo(scope: string, message: string, meta?: Record<string, unknown>): void {
  if (!isPaddleDebugLogEnabled()) return;
  console.info(`[paddle][${scope}] ${message}`, meta && Object.keys(meta).length ? meta : "");
}

export function paddleLogWarn(scope: string, message: string, meta?: Record<string, unknown>): void {
  console.warn(`[paddle][${scope}] ${message}`, meta && Object.keys(meta).length ? meta : "");
}

export function paddleLogError(scope: string, message: string, meta?: Record<string, unknown>): void {
  console.error(`[paddle][${scope}] ${message}`, meta && Object.keys(meta).length ? meta : "");
}

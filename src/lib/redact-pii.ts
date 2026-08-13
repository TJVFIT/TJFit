/**
 * PII redaction for outbound telemetry (Sentry). Error strings built from
 * webhook payloads can embed buyer emails (e.g. sale.ts's
 * "unable to resolve user for <email>") — telemetry must never carry them,
 * while the payment_webhooks DB row keeps the unredacted string for
 * debugging inside our own perimeter.
 */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export function redactEmails(text: string): string {
  return text.replace(EMAIL_RE, "[email redacted]");
}

/**
 * Recursively redact emails in every string field of a JSON-ish value.
 * Used by the Sentry beforeSend hook as defense-in-depth: whatever path a
 * payload-derived string takes into an event (message, exception value,
 * context, extra, breadcrumb), emails don't leave the building.
 */
export function redactPiiDeep<T>(value: T, depth = 0): T {
  if (depth > 8) return value;
  if (typeof value === "string") {
    return redactEmails(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => redactPiiDeep(v, depth + 1)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redactPiiDeep(v, depth + 1);
    }
    return out as unknown as T;
  }
  return value;
}

import type { Event } from '@sentry/nextjs';

const PRIVATE_FLOW = /(?:^|[\s/])(tjai|ai|intake|nutrition|workouts?|progress|auth|login|signup|verify-email|forgot-password|reset-password)(?:[\s/?]|$)/i;

/** Retain diagnostic stacks while excluding health flows and request contents. */
export function scrubTelemetryEvent<T extends Event>(event: T): T | null {
  const route = `${event.request?.url ?? ''} ${event.transaction ?? ''} ${String(event.tags?.scope ?? '')}`;
  if (PRIVATE_FLOW.test(route)) return null;
  delete event.user;
  delete event.extra;
  delete event.contexts;
  delete event.breadcrumbs;
  delete event.logentry;
  if (event.request) {
    const method = event.request.method;
    let url: string | undefined;
    try {
      const parsed = new URL(event.request.url ?? '');
      url = `${parsed.origin}${parsed.pathname}`;
    } catch { /* Omit malformed/relative URLs instead of passing arbitrary inputs. */ }
    event.request = { method, url };
  }
  return event;
}

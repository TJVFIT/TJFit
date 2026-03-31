/**
 * Central marketing / conversion events for GA4, Meta, TikTok, and dataLayer.
 * Pixels load only when env IDs are set (see TrackingScripts). No-ops on server and when APIs are absent.
 */

export type MarketingEventName =
  | "hero_cta_click"
  | "lead_submit"
  | "free_plan_click"
  | "tJAI_waitlist_click"
  | "coach_profile_view"
  | "pricing_section_view"
  | "checkout_start"
  | "program_view";

export type MarketingEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: object[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (name: string, props?: Record<string, unknown>) => void; page?: () => void };
  }
}

function pushDataLayer(name: MarketingEventName, params: MarketingEventParams) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: name,
    ...params
  });
}

/**
 * Fire a named conversion or funnel event across available vendors.
 * Uses custom event names suitable for GA4; Meta/TikTok use trackCustom where supported.
 */
export function trackMarketingEvent(name: MarketingEventName, params: MarketingEventParams = {}) {
  if (typeof window === "undefined") return;

  pushDataLayer(name, params);

  const gtag = window.gtag;
  if (typeof gtag === "function") {
    try {
      gtag("event", name, params);
    } catch {
      /* ignore */
    }
  }

  const fbq = window.fbq;
  if (typeof fbq === "function") {
    try {
      fbq("trackCustom", name, params);
    } catch {
      /* ignore */
    }
  }

  const ttq = window.ttq;
  if (ttq && typeof ttq.track === "function") {
    try {
      ttq.track(name, params as Record<string, unknown>);
    } catch {
      /* ignore */
    }
  }
}

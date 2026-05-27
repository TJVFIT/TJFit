# Activation Event Inventory — 2026-05-27

**Method:** static review of [src/lib/analytics-events.ts](../../src/lib/analytics-events.ts), [src/components/marketing/tracking-scripts.tsx](../../src/components/marketing/tracking-scripts.tsx), call-sites of `trackMarketingEvent(...)`, [src/lib/milestones.ts](../../src/lib/milestones.ts), [src/lib/tjai/badges.ts](../../src/lib/tjai/badges.ts), and [src/lib/tjai-analytics.ts](../../src/lib/tjai-analytics.ts). Cross-referenced against LASTCLAUDECODE.md Cycle 096 (Activation Checklist And First Value).

## Existing marketing event surface

[src/lib/analytics-events.ts](../../src/lib/analytics-events.ts) defines **10** event names that fan out to GA4 / Meta / TikTok / dataLayer (vendors loaded only when env IDs are set):

| Event | Fires when | Surface | Authenticated needed? |
|---|---|---|---|
| `hero_cta_click` | Primary CTA tapped on hero / sticky bar / final CTA / pricing strip | luxury-home, hero-section | no |
| `lead_submit` | Lead form submitted | lead-capture-form | no |
| `free_plan_click` | "Get free plan" CTA tapped | (search shows no direct call — likely deprecated) | no |
| `tJAI_waitlist_click` | TJAI waitlist CTA tapped | (deprecated — TJAI is shipped) | no |
| `coach_profile_view` | A coach card is clicked from home | luxury-home line 812 | no |
| `pricing_section_view` | Pricing block scrolled into view | pricing-preview-home | no |
| `checkout_start` | Checkout page mount fired | `/[locale]/checkout/page.tsx` line 164 | yes |
| `program_view` | Program card clicked from home | luxury-home line 628, 707 | no |
| `early_access_popup_cta` | Popup CTA tapped | delayed-early-access-popup | no |
| `early_access_popup_dismiss` | Popup dismissed | same | no |

**Funnel posture:** anonymous-marketing-heavy. Only `checkout_start` requires auth. **There is no event for post-signup activation moments.**

## Cycle 096 first-value events vs. coverage

| Cycle 096 activation event | Currently fired? | Backing data exists? | Gap |
|---|---|---|---|
| **Quiz completed** | ❌ | The TJAI quiz writes to `tjai_user_memory` and triggers plan generation, but no marketing/funnel event fires | Add `tjai_quiz_completed` event |
| **Plan generated (first time)** | **Partial** — `recordPlanGeneration` in [src/lib/tjai-analytics.ts](../../src/lib/tjai-analytics.ts) writes a DB row for internal analytics, but no marketing event | Add `tjai_plan_generated` (fire only on first plan to scope to activation) |
| **First workout opened** | ❌ | Badge system has a `first_workout` award (badges.ts line 25 / milestones.ts line 18) but no marketing event | Add `first_workout_opened` |
| **First grocery list opened** | ❌ | No badge, no marketing event | Add `first_grocery_opened` |
| **First progress log saved** | ❌ | No badge, no marketing event | Add `first_progress_logged` |
| **First program purchase** | **Partial** — `checkout_start` fires on mount but not on completion. Webhook updates DB but doesn't push to client | Add `program_purchase_completed` (client-side on success page, OR server-emitted via webhook to a server-side analytics destination) |
| **Coach booking (if applicable)** | ❌ | `coach_profile_view` exists but no booking event | Out of scope per Cycle 043 (coaches marketplace trust) |

## Badge unlock vs. activation event

[src/lib/tjai/badges.ts](../../src/lib/tjai/badges.ts) already encodes activation-style milestones at the DB layer:

```ts
| "first_workout"
| "first_program_complete"
// + more streak/blog/coach badges
```

These trigger via `tryAward(...)` in the badge engine. **Wiring them to also fire a `trackMarketingEvent` would close most of the activation gap with a 1-line addition per award path** — no new infrastructure needed.

## Recommended additions

Extend `MarketingEventName` (the union type in [analytics-events.ts](../../src/lib/analytics-events.ts)):

```ts
export type MarketingEventName =
  | "hero_cta_click"
  | "lead_submit"
  | "free_plan_click"
  | "tJAI_waitlist_click"
  | "coach_profile_view"
  | "pricing_section_view"
  | "checkout_start"
  | "program_view"
  | "early_access_popup_cta"
  | "early_access_popup_dismiss"
  // Activation (Cycle 096):
  | "signup_completed"
  | "tjai_quiz_completed"
  | "tjai_plan_generated"
  | "first_workout_opened"
  | "first_grocery_opened"
  | "first_progress_logged"
  | "program_purchase_completed";
```

Then call `trackMarketingEvent("tjai_plan_generated", { plan_id, surface })` once per first-time generation, etc.

**Server-emitted alternative:** for `program_purchase_completed`, the cleanest source of truth is the Gumroad webhook handler (since the client may not return to the success page reliably). Wire a server-side analytics push from `src/app/api/webhooks/gumroad/handlers/sale.ts` — but **that's Phase 5 ⚠ territory** (touches webhook payment code).

## Funnel stage map

Putting current + recommended events on a stage map:

| Stage | Events |
|---|---|
| **Awareness** (anonymous) | `hero_cta_click`, `program_view`, `coach_profile_view`, `pricing_section_view`, `early_access_popup_*` |
| **Acquisition** (anonymous → signup) | `lead_submit`, `signup_completed` *(new)* |
| **Activation** (signup → first value) | `tjai_quiz_completed`, `tjai_plan_generated`, `first_workout_opened`, `first_grocery_opened`, `first_progress_logged` *(all new)* |
| **Revenue** (activation → paid) | `checkout_start`, `program_purchase_completed` *(new)* |
| **Retention** | Streak / badge unlocks (existing — wire to funnel events as recommended above) |

Today the funnel jumps directly from Awareness → Revenue with no Activation visibility. This makes it hard to debug "why did 1000 signups produce only 30 paid?" because the in-between events don't exist.

## Implementation notes

- Cycle 096 rules: "Steps should be measurable outcomes, not click-around tasks. Behavioral completion matters more than ticking a box." → events should fire on the *outcome* (plan saved to DB, workout marked complete), not on page-mount.
- Cycle 042 (Analytics And Funnel Measurement) recommends UTM-aware events. Today `trackMarketingEvent` accepts free-form params — pass `utm_source / utm_campaign` from the landing-page session into activation events for end-to-end attribution.
- Honor `prefers-reduced-motion` is unrelated here, but per Cycle 096 the *user-facing* checklist UI built on top of these events should be opt-in / dismissable / locale-aware.

## What this audit did NOT cover

- Server-emitted analytics (no current pathway — Phase 5 ⚠ adjacent).
- TJAI usage events beyond plan generation (chat messages, meal swaps, grocery list opens — events likely needed for retention analysis).
- PostHog / Mixpanel / Segment integration evaluation — current stack is GA4 / Meta / TikTok / GTM, no product-analytics tool. Adding one is a product decision.
- Cookie consent / opt-out wiring (likely required alongside Phase 11 GDPR work).
- iOS / Android app-store activation requirements.

## Recommended next-action assignments

| Severity | Action | Phase to land in |
|---|---|---|
| P1 | Extend `MarketingEventName` with 7 activation events | Standalone micro-phase or merge into a new Plan-2 follow-up |
| P1 | Wire `tjai_quiz_completed` + `tjai_plan_generated` + `first_workout_opened` | Same — TJAI surface touches |
| P2 | Server-side `program_purchase_completed` from Gumroad webhook | Phase 5 ⚠ adjacent (webhook code) |
| P2 | UTM propagation through activation events | Phase 14 i18n/cleanup adjacent |
| P3 | Funnel measurement docs + cookie consent | Phase 11 GDPR follow-up |

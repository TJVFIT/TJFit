# Sentry alerts runbook (money / ops paths)

> Status: **code signals shipped, dashboard alert RULES not yet created.**
> This doc is the checklist for setting those rules up in the Sentry
> project dashboard. The code side (WP-SEC-10 / WP-INFRA-11) only emits
> tagged events — it cannot create alert rules itself.

## 0. Prerequisite — the DSN must be set

`NEXT_PUBLIC_SENTRY_DSN` is **optional and currently unset** (confirmed in
`.env.example`, "Sentry (optional - errors are no-op if not set)"). Every
`Sentry.init()` call in this repo (`sentry.server.config.ts`,
`sentry.edge.config.ts`) is gated on that variable being present — with it
unset, all the `Sentry.captureException` / `Sentry.captureMessage` calls
below are silent no-ops. **None of this fires until `NEXT_PUBLIC_SENTRY_DSN`
(and ideally `SENTRY_ORG` / `SENTRY_PROJECT` for source maps) is set in
Vercel** for the relevant environment(s). Set it, redeploy, then create the
rules below.

## 1. Alert rules to create

### A. Gumroad webhook failures — immediate

- **Condition:** event tag `surface:gumroad-webhook`, level `error` or
  `fatal`.
- **Why immediate:** every failure on this surface means a buyer paid and
  either didn't get their entitlement, or a refund/subscription-lifecycle
  event didn't apply. This is the money path.
- **Where it's emitted:** `src/app/api/webhooks/gumroad/route.ts`, via the
  `reportGumroadFailure()` helper. Every branch also sets a distinct
  `gumroad_action` tag so the specific failure is visible without opening
  the event body — e.g. `fulfill_order_failed`, `sale_api_reverify_failed`,
  `direct_purchase_insert_failed`, `subscription_upsert_<action>`,
  `refund_handler_<action>`, `uncaught_handler_error`. Filter/group by
  `gumroad_action` to see which failure mode is recurring.
- **Suggested routing:** page/Slack-immediate, not digest — these are
  individually rare and each one is a specific buyer who needs a manual
  fix (check `payment_webhooks.handler_error` for the same event, keyed by
  the `event_id` tag/context, for the full detail already logged there).

### B. `ALLOW_TEST_CHECKOUT` production tripwire — immediate

- **Condition:** message contains `ALLOW_TEST_CHECKOUT enabled in
  production`, level `fatal`.
- **Why immediate:** this fires only when the test-order-completion bypass
  is left on in production for a non-admin — i.e. anyone could mark their
  own order paid for free. Two emission points, both already shipped
  (unchanged by this work order, listed here so the rule catches both):
  - Boot-time (`src/instrumentation.ts`, `evaluateTestCheckoutTripwire`) —
    fires once per cold start if the flag is misconfigured.
  - Request-time (`src/app/api/checkout/complete-order/route.ts`) — fires
    on the first actual exploit attempt.
- **Suggested routing:** page immediately — this is a live free-money bug,
  not a "review tomorrow" issue.

### C. Cron job failures — daily digest

- **Condition:** event tag `surface:cron`.
- **Why digest, not immediate:** `settleEndedChallenges` runs on a
  schedule and a single missed run is self-healing on the next tick (ended
  challenges stay eligible until settled); it's not a per-request money
  miss like the webhook path. A daily rollup is enough to catch a
  persistently broken settlement job before payouts fall meaningfully
  behind.
- **Where it's emitted:** `src/app/api/cron/route.ts`, tag
  `cron_job:settle_ended_challenges`, message
  `[cron] settleEndedChallenges failed: <error>`.

### D. TJAI credit-refund failure — immediate (recommend adding)

- **Condition:** event tag `surface:tjai-generate`, level `fatal`.
- **Why immediate:** this is the worst case in the whole credit system —
  the plan-generation pipeline already failed to deliver, AND the
  automatic compensating refund of the spent credit also failed. The
  buyer is out a credit with nothing to show for it and no automatic
  correction. Before this change it was a bare `console.error` with no
  alerting at all.
- **Where it's emitted:**
  `src/app/api/tjai/generate/route.ts`, in the `finally` block's refund
  path, tag `gumroad_action:credit_refund_failed`. Context includes
  `user_id` and the original `failure_reason` so the on-call engineer can
  manually credit the user directly from the Sentry event.

## 2. What did NOT change

This work order is instrumentation-only: zero control-flow, status-code,
or business-logic changes in any of the touched files. Every new call is
either a `Sentry.captureException` / `Sentry.captureMessage` inside a
`Sentry.withScope`, or the `import * as Sentry from "@sentry/nextjs"` it
needs. `@sentry/nextjs` was already a dependency; no packages were added.

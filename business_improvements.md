# TJFit — Business & Conversion Review (2026-06-10)

Lens: fitness entrepreneur · gym owner · online coach · personal trainer · customer.

## The one thing that matters most

**Every program/diet/bundle is $0 (owner directive until prices are set).**
The entire paid funnel — create-order → Gumroad → webhook fulfillment →
entitlement-gated PDF download — is built, tested end-to-end, and dormant.
Revenue starts the day prices are entered. Nothing else on this list is worth
a tenth of that. Recommended sequencing: price 3–5 hero bundles first (not all
51 programs), watch a week of data, then roll out.

## Funnel audit (state → opportunity)

1. **Onboarding:** COPPA-gated signup → verify-email → dashboard works.
   *Opportunity:* the `/start` route is the natural quiz-style entry — drive
   homepage primary CTA there and end the quiz in a TJAI plan preview
   (personalized value before the paywall).
2. **Lead generation:** newsletter double-opt-in, store waitlist, calculator
   page exist. *Opportunity:* the calculator is the strongest lead magnet —
   gate the *detailed* results PDF behind email, keep instant results free.
3. **Conversion funnel:** bundle claim flow is one click and idempotent —
   excellent. *Opportunity:* free claims build a buyer list at $0; when
   pricing flips, email past claimants a founding-member offer (the
   `email_sequences` + Resend infrastructure is already there).
4. **Checkout:** Gumroad-only keeps PCI scope nil. *Watch-item:* webhook-retry
   duplicate orders already handled (entitlement bug fixed). Add a
   post-purchase upsell page (bundle_upsell_suggestions table already exists —
   wire it into the success screen).
5. **Coaching signup:** become-a-coach → application → dashboard → payouts and
   commission tables all exist. *Opportunity:* coaching is the high-LTV line;
   add a "work with a coach" CTA on program detail pages (today it's siloed
   under /coaches).
6. **Retention/engagement:** streaks, badges, challenges, leaderboard, weekly
   check-ins, reengagement emails — unusually complete. *Opportunity:* TJAI
   weekly insights → email digest (tables exist: tjai_weekly_insights) is the
   cheapest retention win available.
7. **Referral/affiliate:** referrals + affiliates tables and an /affiliate
   page exist. *Opportunity:* surface "give a friend a free bundle" inside the
   post-claim success state where motivation peaks.

## Revenue levers, ranked by impact × readiness

| # | Lever | Impact | Effort | Blocked on |
|---|---|---|---|---|
| 1 | Set real prices on hero bundles | Existential | Minutes | Owner |
| 2 | Founding-member email to past free claimants at price flip | High | Low | #1 |
| 3 | TJAI credit packs visibility (packs/transactions built) — surface buy-more in the generation flow | High | Low | #1 (pricing) |
| 4 | Post-purchase upsell via bundle_upsell_suggestions | Medium-high | Medium | #1 |
| 5 | Calculator → email-gated PDF lead magnet | Medium | Low | — |
| 6 | Coach cross-sell CTA on program pages | Medium | Low | — |
| 7 | Weekly TJAI insight email digest | Medium (retention) | Medium | — |
| 8 | Membership tier merchandising (/membership, /pro exist) | High long-term | Medium | Pricing strategy |
| 9 | Equipment store | Unknown | High | Owner green-light (explicitly out of scope) |

## Customer-hat friction notes

- Bundle PDF is ~18 pages and generated server-side — delivery feels premium;
  add a one-line "check your downloads + email" confirmation state if absent.
- TJAI voice input is a differentiator nobody in this niche has — feature it
  on the marketing page, don't leave it as an easter egg.
- `/live` and `/podcast`/`/press` placeholders are honest, but ensure nav
  doesn't over-promise: keep coming-soon items visually de-emphasized.

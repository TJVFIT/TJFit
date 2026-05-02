# PostHog event taxonomy

> Source of truth for every analytics event TJFit fires. Per the
> PostHog SaaS playbook: name with `verb_noun` snake_case, capture
> the same property set on every event, never break the contract
> without bumping a version flag in the property bag.

This doc lists what events to fire and their properties — the actual
SDK install lands in a separate sprint, gated on cookie consent
(see `src/components/cookie-consent.tsx`).

---

## Naming convention

- Past-tense `verb_noun` snake_case: `signup_completed`, `program_purchased`
- Present-tense for ongoing states: `tjai_chat_message_sent` (one event per send)
- Never `clicked_button_x` — too granular and meaningless. Capture the
  outcome, not the click.

---

## Properties on every event (super-properties)

Set once on identify; persisted automatically by PostHog:

| Property             | Type    | Source                                   |
|----------------------|---------|------------------------------------------|
| `locale`             | string  | `params.locale` from `[locale]/`         |
| `subscription_tier`  | string  | `core` / `pro` / `apex` from DB           |
| `signup_date`        | ISO     | `auth.users.created_at`                  |
| `country`            | string  | `request.geo.country` (Vercel headers)   |
| `device_type`        | string  | `mobile` / `tablet` / `desktop`           |
| `pricing_tier`       | int     | `1` / `2` / `3` from `lib/pricing/locale-tier.ts` |
| `app_version`        | string  | `process.env.NEXT_PUBLIC_APP_VERSION`    |

---

## Authentication

| Event                      | Trigger                                            | Extra properties                       |
|----------------------------|----------------------------------------------------|----------------------------------------|
| `signup_started`           | User clicks Sign Up CTA                            | `source: 'cta'/'paywall'/'header'`     |
| `signup_completed`         | Account created in Supabase                        | `auth_method: 'email'/'google'/'apple'/'phone'` |
| `email_verified`           | Magic link clicked, email marked verified          | `time_to_verify_minutes: number`       |
| `signin_completed`         | Existing user signed in                            | `auth_method`                          |
| `signout_completed`        | User signed out                                    |                                        |
| `password_reset_requested` | Magic link request                                 |                                        |
| `password_reset_completed` | Password updated                                   |                                        |

---

## Activation (the 60-second rule)

| Event                              | Trigger                                          | Extra properties                  |
|------------------------------------|--------------------------------------------------|-----------------------------------|
| `welcome_flow_started`             | First-run 3-question survey opened               |                                   |
| `welcome_flow_completed`           | All 3 questions answered                         | `goal`, `location`, `level`       |
| `first_program_viewed`             | First program detail page after signup           | `program_slug`, `time_since_signup_seconds` |
| `first_workout_started`            | First "start workout" tap                        | `program_slug`, `time_since_signup_seconds` |
| `first_workout_completed`          | First workout marked complete                    | `program_slug`, `duration_minutes` |
| `first_tjai_intake_started`        | First TJAI intake question answered              |                                   |
| `first_tjai_plan_generated`        | First plan saved                                 | `time_to_generate_seconds`        |

---

## Programs

| Event                          | Trigger                                          | Extra properties                  |
|--------------------------------|--------------------------------------------------|-----------------------------------|
| `program_viewed`               | Program detail page loaded                       | `program_slug`, `is_free`         |
| `program_purchase_started`     | Buy button tap                                   | `program_slug`, `price_usd`       |
| `program_purchase_completed`   | Webhook fulfillment success                      | `program_slug`, `price_usd`, `payment_provider`, `coupon_code` |
| `workout_started`              | Any "start workout"                              | `program_slug`, `week`, `day`     |
| `workout_completed`            | Workout marked done                              | `program_slug`, `week`, `day`, `duration_minutes` |
| `workout_skipped`              | "Skip workout" tap                               | `program_slug`, `week`, `day`, `reason` |
| `set_completed`                | Set marked done                                  | `exercise_name`, `weight_kg`, `reps` |
| `exercise_replaced`            | Swap-exercise sheet → confirm                   | `original_exercise`, `new_exercise` |

---

## Diets

| Event                          | Trigger                                | Extra properties                  |
|--------------------------------|----------------------------------------|-----------------------------------|
| `diet_viewed`                  | Diet detail page loaded                | `diet_slug`, `is_free`            |
| `diet_purchase_started`        | Buy button tap                         | `diet_slug`, `price_usd`          |
| `diet_purchase_completed`      | Webhook fulfillment success            | `diet_slug`, `price_usd`, `coupon_code` |
| `meal_completed`               | Meal marked eaten                      | `meal_type`, `calories`           |
| `recipe_viewed`                | Recipe modal opened                    | `recipe_name`                     |
| `shopping_list_generated`      | Shopping list export                   | `diet_slug`                       |

---

## TJAI

| Event                                | Trigger                                | Extra properties                  |
|--------------------------------------|----------------------------------------|-----------------------------------|
| `tjai_intake_started`                | First intake question render           |                                   |
| `tjai_intake_question_answered`      | Each answer                            | `question_id`, `answer_value`     |
| `tjai_intake_completed`              | All questions answered, preview shown  |                                   |
| `tjai_plan_generated`                | Generation finished (success)          | `goal`, `level`, `days_per_week`, `latency_seconds` |
| `tjai_plan_saved`                    | Save → DB row created                  |                                   |
| `tjai_plan_regenerated`              | "Regenerate" tap                       | `modifier: 'harder'/'easier'/'shorter'` |
| `tjai_chat_message_sent`             | Each user → assistant message          | `message_length_chars`            |
| `tjai_feedback_given`                | Workout feedback prompt rated          | `rating: 'too_easy'/'right'/'too_hard'` |

---

## Subscriptions

| Event                          | Trigger                                | Extra properties                  |
|--------------------------------|----------------------------------------|-----------------------------------|
| `pro_upgrade_clicked`          | Pro CTA tap                            | `source_page`                     |
| `apex_upgrade_clicked`         | Apex CTA tap                           | `source_page`                     |
| `subscription_started`         | Webhook → DB updated                   | `tier`, `billing_period`, `price_usd` |
| `subscription_renewed`         | Webhook → renewal recorded             | `tier`                            |
| `subscription_canceled`        | User-initiated cancel                  | `tier`, `reason`                  |
| `subscription_paused`          | Pause-instead-of-cancel chosen         | `tier`, `pause_months`            |
| `payment_failed`               | Webhook → failed payment               | `tier`, `attempt_number`          |
| `payment_recovered`            | Webhook → recovery succeeded after fail| `tier`, `attempts_to_recover`     |

---

## Coach (Apex)

| Event                                | Trigger                                | Extra properties                  |
|--------------------------------------|----------------------------------------|-----------------------------------|
| `coach_application_submitted`        | `/become-a-coach` form submit          |                                   |
| `coach_approved`                     | Admin approval                         |                                   |
| `coach_assigned`                     | Apex user assigned to coach            | `coach_id`                        |
| `coach_message_sent`                 | User → coach message                   | `message_type`                    |
| `coach_message_received`             | Coach → user message                   | `message_type`                    |
| `coach_call_scheduled`               | Slot booking complete                  | `coach_id`                        |
| `coach_call_started`                 | Daily.co room joined                   | `coach_id`                        |
| `coach_call_completed`               | Coach ended call                       | `coach_id`, `duration_minutes`    |
| `coach_review_requested`             | "Have a coach review my plan" tap      |                                   |
| `coach_review_completed`             | Coach submits review                   | `coach_id`, `latency_hours`       |

---

## Community

| Event                          | Trigger                                | Extra properties                  |
|--------------------------------|----------------------------------------|-----------------------------------|
| `community_post_created`       | Post published                         | `category`, `has_media`           |
| `community_post_upvoted`       | Upvote tap                             | `post_id`                         |
| `community_comment_posted`     | Comment submit                         | `post_id`                         |

---

## Funnels to wire in PostHog dashboard

1. **Acquisition**: landing → `signup_started` → `signup_completed` → `email_verified`
2. **Activation**: `email_verified` → `welcome_flow_completed` → `first_workout_completed`
3. **Conversion (free → paid)**: `first_program_viewed` → `program_purchase_started` → `program_purchase_completed`
4. **Pro conversion**: free user → `pro_upgrade_clicked` → `subscription_started` (tier=pro)
5. **Apex conversion**: pro user → `apex_upgrade_clicked` → `subscription_started` (tier=apex)
6. **TJAI**: `tjai_intake_started` → `tjai_intake_completed` → `tjai_plan_generated` → `tjai_plan_saved`

---

## Cohort breakdowns to ship (per Adapty 2026 fitness benchmarks)

- D1 / D7 / D30 retention by signup cohort (target D30 ≥ 33%)
- Trial-to-paid conversion (target ≥ 35%)
- Free → Pro conversion rate
- Pro → Apex conversion rate
- Refund rate by cohort

---

## When to add a new event

Three rules:

1. **Action that changes user state.** Created something, completed
   something, paid for something. NOT every click.
2. **You know which dashboard / funnel / question it answers.** Adding
   an event that doesn't help a known question is debt.
3. **Property bag is consistent.** Same names across events: `program_slug`
   not `programSlug` not `program_id` for the same concept.

When deprecating an event: rename to `<event>_v2` rather than break
the old name. Old dashboards keep working until you migrate them.

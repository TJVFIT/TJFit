# TJFit — Project Audit (2026-06-10)

Full-stack discovery snapshot of tjfit.org at production-readiness review v7.
Companion reports: `issues_report.md`, `security_report.md`, `performance_report.md`,
`seo_report.md`, `design_review.md`, `business_improvements.md`, `master_execution_plan.md`.

## 1. Architecture map

```
Browser ──► Vercel (project tjfitmain, auto-deploy from main)
              │  Next.js 14 App Router (SSR + ISR), TypeScript, Tailwind
              │  src/middleware.ts → locale routing (en/tr/ar/es/fr) + auth session refresh
              ├─► Supabase (kohuiyqyixvrcqeepalz)
              │     Auth (PKCE/SSR via @supabase/ssr) · Postgres 103 tables, RLS everywhere
              │     Storage: avatars, community-blog-images, program-assets, secure-chat
              ├─► LLM providers (TJAI): OpenAI gpt-4o/gpt-4o-mini + Anthropic
              │     claude-sonnet-4-6 / opus-4-7 / haiku-4-5, routed by provider-policy.ts
              ├─► Gumroad (payments — sole processor; Paddle removed in 44f26a7)
              ├─► Resend (transactional + sequence email)
              ├─► Sentry (client/edge/server, DSN-gated, traces 0.1)
              └─► Analytics: PostHog + GA4 + Meta/TikTok pixels (consent-gated)
```

## 2. Folder structure (top level)

| Path | Purpose |
|---|---|
| `src/app/[locale]/` | 47 localized page routes (see feature inventory) |
| `src/app/api/` | 31 API route groups |
| `src/app/{coming-soon,privacy-policy,refund-policy,terms-and-conditions}` | Non-localized utility/legal entries |
| `src/components/` | UI components (3d/, tjai/, home/, membership/, ui/ …) |
| `src/lib/` | Domain logic (payments/, tjai/, supabase clients, require-auth) |
| `src/middleware.ts` | Locale + session middleware |
| `supabase/migrations/` | 88 SQL migrations (drift to prod remediated 2026-06-02) |
| `messages/` + i18n dictionaries | 5-locale copy, parity-checked by `npm run i18n:check` |
| `tests/` | Vitest suite — 14 files, 99 tests |
| `scripts/` | i18n checks, TJAI eval, brand asset generation |
| `.github/workflows/ci.yml` | CI: typecheck, lint, i18n parity, vitest on push/PR to main |

## 3. Tech stack

- **Framework:** Next.js 14.2.35 (App Router) · React 18.3 · TypeScript 5.7
- **Styling:** Tailwind 3.4 · brand: black/deep-purple/violet/lavender · Space Grotesk display
- **3D/visual:** three.js 0.160 + @react-three/fiber/drei + Spline runtime
- **Data/auth:** Supabase (`@supabase/ssr` 0.9, RLS-protected) · Resend 6 · Sentry 10
- **Payments:** Gumroad only · **Tests:** Vitest 4 · **Host:** Vercel

## 4. Database structure (103 public tables, grouped)

- **Identity/social:** profiles, user_follows, user_badges, user_public_keys, transformation_posts, user_transformations, leaderboard_weekly_snapshots, personal_records, user_number_milestones
- **Programs/commerce:** program_bundles, program_orders, program_enrollments, program_progress, program_reviews, program_certificates, custom_programs, bundle_gumroad_products, product_gumroad_sync, payment_webhooks, manual_purchase_requests, coupons/coupon_redemptions, flash_sales, user_subscriptions
- **TJAI (19 tables):** saved_tjai_plans, tjai_chat_messages, tjai_credit_packs/transactions, tjai_plan_purchases, tjai_user_memory/long_memory, tjai_streaks, tjai_weekly_check_ins/insights, tjai_adaptive_checkpoints, tjai_tts_cache, tjai_trial_usage, tjai_events, tjai_feedback, tjai_badges, tjai_plan_analytics, tjai_plan_suggestions, tjai_ai_call_logs
- **Coaching:** coach_applications, coach_student_links, coach_payouts, coach_review_requests, coach_terms_acceptance, coach_profile_views, commission_settings, sale_commissions
- **Community/messaging:** community_* (blog_posts, challenges, groups, spotlights, threads), groups/group_members, thread_replies, conversations/conversation_participants/messages/message_attachments/message_allowances, call_sessions/call_events, user_chat_preferences, suggestions/suggestion_votes
- **Tracking:** workout_logs, bundle_workout_logs, challenge_logs/participants, progress_entries/milestones, daily_water_logs, grocery_checks
- **Growth/marketing:** affiliates, affiliate_conversions, referrals, newsletter_subscribers, marketing_subscribers, email_sequences, reengagement_emails, store_waitlist, user_email_preferences, pending_notifications, dashboard_greetings
- **Coins (retired feature, tables retained):** tjfit_coin_ledger/wallets, tjcoin_reward_config, reaction_coin_log, tjfit_discount_codes/offers, user_discount_codes
- **Ops:** admin_audit_log, sync_log, feedback_submissions

RLS is enabled on all tables; service-role-only tables intentionally carry no
policies (verified write paths, see `security_report.md`).

## 5. User flows

1. **Visitor → lead:** `/{locale}` home → programs/bundles/calculator → newsletter (double-opt-in via Resend) or signup.
2. **Signup (COPPA-gated):** `/signup` → DOB required, <13 blocked → Supabase auth (avatar → `avatars` bucket) → `/verify-email` → `/dashboard`.
3. **Bundle acquisition (free, current state):** bundle page → CTA → `POST /api/bundles/claim` ($0 order row, idempotent) → `/api/bundles/download/[slug]` gated by `hasPurchasedProgram` → ~18-page generated PDF.
4. **Bundle purchase (paid path, dormant while prices are $0):** create-order → prepare-session → Gumroad redirect → webhook fulfillment → same download gate.
5. **TJAI:** `/tjai` hub → readiness profile → plan generation (credit/trial-gated, refund-safe) → saved plans, meal swap, weekly check-ins, voice input (Web Speech API), TTS cache.
6. **Coaching:** `/become-a-coach` → coach_applications → coach dashboard → student links → messaging (E2E-wrapped keys in secure-chat flow) → payouts/commissions.
7. **Community:** feed, groups, challenges, blog, suggestions + votes, leaderboard, transformations.

## 6. Feature inventory

**Pages (47):** admin, affiliate, ai, become-a-coach, blog, bundles, calculator, challenges, checkout, coach, coach-dashboard, coaches, coins, community, dashboard, equipment, feed, feedback, forgot-password, leaderboard, legal, live, login, membership, messages, people, podcast, press, privacy-policy, pro, profile, progress, records, refund-policy, reset-password, search, settings, signup, start, store, suggestions, support, terms-and-conditions, tjai, transformations, verify-email (+ home).

**API groups (31):** admin, auth, blog, bundles, chat, checkout, coach, coach-applications, coaches, coins, community, cron, email, feed, feedback, follow, leaderboard, newsletter, notifications, profile, profiles, programs, progress, search, store, suggestions, support, tjai, user, users, webhooks.

**Deliberately gated/dormant:** `/live` and `/store` are intentional "coming soon" (robots-disallowed); Shopify/equipment store is owner-gated; `/api/coins/redeem` returns 410 (TJCoin retired); paid checkout dormant while all prices are $0 (owner directive).

## 7. Missing / broken / debt

**Broken:** none known. RPC drift (5 features silently broken in prod: meal swap, blog views, reactions, workout records, suggestion votes) was found and fixed 2026-06-02; suggestion vote counts backfilled.

**Missing (intentional or owner-gated):** real prices (all $0 by directive) · Supabase "leaked password protection" toggle (dashboard-only, owner) · Content-Security-Policy (needs supervised per-embed testing) · Next.js 15/16 upgrade (4 high npm-audit CVEs wait on it).

**Technical debt:**
- 135 `auth_rls_initplan` + 228 `multiple_permissive_policies` advisor lints — RLS policy rewrites deferred to a supervised pass (high blast radius).
- Coin/discount tables retained for a retired feature — candidate for archival once owner confirms.
- `to-ico` replaced by inline encoder in favicon script (done); remaining npm-audit findings all chain to the Next major.
- CI does not apply Supabase migrations — repo↔prod drift recurrence risk; add `supabase db push` to deploy flow or a drift check.

## 8. Verification snapshot (2026-06-10)

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| Vitest | 99/99 pass (14 files, 1.4s) |
| ESLint (full `src`, max-warnings 0) | clean |
| i18n parity (5 locales) | pass |
| npm audit | 0 critical · 4 high + 1 moderate, all blocked on Next major |
| Production | /en 200 · robots/sitemap 200 · security headers live |

# TJFit

Premium multilingual online coaching platform built on `Next.js 14`, `Tailwind CSS`, `Supabase` (Auth + Postgres + RLS + Realtime + Storage), `Paddle Billing`, `Resend`, and Anthropic + ElevenLabs AI.

## Included

- Premium dark landing page
- AI coach matching and smart coach discovery
- Coach discovery and coach profile flows
- Programs marketplace
- Program detail pages with equipment recommendations
- Equipment store
- Transformation engine and public transformation pages
- Global transformation leaderboard
- Community feed
- Platform challenges
- Live training sessions
- Wallet and referral systems
- Premium membership page
- Become a coach page
- User dashboard
- Coach dashboard
- Admin panel
- Login and signup pages
- Checkout API: Paddle Billing when `PAYMENT_PROVIDER=paddle` (or `live` alias), test mode when `ALLOW_TEST_CHECKOUT=true`
- English, Turkish, Arabic, Spanish, and French route support

## Routes

- `/en`
- `/en/coaches`
- `/en/coaches/[slug]`
- `/en/programs`
- `/en/programs/[slug]`
- `/en/store`
- `/en/transformations`
- `/en/transformations/[slug]`
- `/en/community`
- `/en/challenges`
- `/en/live`
- `/en/membership`
- `/en/become-a-coach`
- `/en/dashboard`
- `/en/coach-dashboard`
- `/en/checkout`
- `/en/login`
- `/en/signup`
- `/en/admin`

Switch locale by replacing `/en` with `/tr`, `/ar`, `/es`, or `/fr`.

## Setup

1. Install Node.js `18.18+` or `20+`
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local`
4. Add your Supabase credentials (and payment env vars from `.env.example` when wiring a PSP)
5. Start development:

```bash
npm run dev
```

## Engineering

- Large or risky refactors: follow [docs/engineering/major-changes-and-rollback.md](docs/engineering/major-changes-and-rollback.md) so rollback stays straightforward (branch, optional pre-change tag, PR change summary).

## Notes

- Current data is mocked in `src/lib/content.ts`
- AI matching logic is in `src/lib/recommendations.ts`
- Supabase client bootstrap is in `src/lib/supabase.ts`
- Payment resolution and checkout adapters are in `src/lib/payments/`
- Simple rate limiting helper is in `src/lib/rate-limit.ts`
- Checkout APIs are under `src/app/api/checkout/`

## Required Database Migrations

| File | Description | Status |
|------|-------------|--------|
| 20250316000000_coach_applications_and_feedback.sql | Coach applications + feedback tables | Apply |
| 20250316100000_profiles_and_auth.sql | Profiles table + auth trigger | Apply |
| 20250316110000_paytr_callbacks.sql | Legacy payment callbacks | Apply |
| 20260316000100_progress_and_secure_chat.sql | Progress tracking + encrypted messaging | Apply |
| 20260330000100_tjfit_coin.sql | TJFit Coin wallet + ledger | Apply |
| 20260330000200_one_active_coach_per_student.sql | Coach-student constraint | Apply |
| 20260330000300_custom_program_uploads.sql | Coach PDF uploads | Apply |
| 20260330000400_marketing_subscribers.sql | Newsletter subscribers | Apply |
| 20260330000500_enforce_customer_signup_and_roles.sql | Role enforcement | Apply |
| 20260330000600_community_blogs.sql | Community blog posts | Apply |
| 20260330000700_community_blog_pinning.sql | Blog pinning | Apply |
| 20260331000101_coach_student_links_insert_policy_final.sql | Coach-student RLS | Apply |
| 20260331120000_drop_legacy_payment_callbacks.sql | Remove legacy tables | Apply |
| 20260331140000_social_profiles_username_messaging.sql | Usernames + messaging | Apply |
| 20260331180000_profile_v1_is_private_inbox_read.sql | Profile privacy settings | Apply |
| 20260331200000_profile_foundation_username_constraints.sql | Username constraints | Apply |
| 20260331210000_search_profiles_partial_can_message.sql | Profile search | Apply |
| 20260331220000_messaging_enforcement_and_realtime.sql | Realtime messaging | Apply |
| 20260331230100_ensure_messaging_and_profile_rpc_grants.sql | RPC grants | Apply |
| 20260403000000_program_catalog_free_flags.sql | Free program flags | Apply |
| 20260403120000_coach_terms_acceptance.sql | Coach terms table | Apply |
| 20260404180000_program_orders_provider_paddle.sql | Paddle provider column | Apply |
| 20260404190000_coach_terms_unique_upsert_rls.sql | Coach terms RLS | Apply |

## Required Environment Variables

| Variable | Required | Description |
|---|---|---|
| NEXT_PUBLIC_SITE_URL | Optional | Canonical site URL for metadata/sitemaps. |
| GOOGLE_SITE_VERIFICATION | Optional | Google Search Console verification token. |
| NEXT_PUBLIC_SUPABASE_URL | Required | Supabase project URL (client). |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Required | Supabase anon key (client). |
| SUPABASE_SERVICE_ROLE_KEY | Required | Supabase service role key (server-only). |
| ADMIN_EMAILS | Required | Comma-separated admin emails for role checks. |
| COACH_TERMS_VERSION | Required | Current coach terms version enforced by middleware/actions. |
| ALLOW_TEST_CHECKOUT | Optional | Enable test checkout when no live provider is used. |
| PADDLE_API_KEY | Required for Paddle live | Paddle API key for server transaction creation. |
| PADDLE_WEBHOOK_SECRET | Required for Paddle live | Paddle webhook signature verification secret. |
| PADDLE_ENVIRONMENT | Required for Paddle live | `sandbox` or `production`. |
| NEXT_PUBLIC_PADDLE_ENVIRONMENT | Required for Paddle client | Public Paddle environment value. |
| NEXT_PUBLIC_PADDLE_ENV | Optional | Short public alias for Paddle environment. |
| NEXT_PUBLIC_PADDLE_CLIENT_TOKEN | Required for Paddle overlay | Public Paddle checkout client token. |
| PADDLE_PRICE_MAP | Required for multi-product Paddle | JSON map of slug to Paddle `pri_...` id. |
| PADDLE_DEFAULT_PRICE_ID | Optional | Fallback Paddle price id when slug is missing in map. |
| PADDLE_WALLET_DISCOUNT_ID | Optional | Paddle `dsc_...` discount id applied on discounted orders. |
| CHECKOUT_PROMO_CODES | Optional | JSON promo-code map (code to percent). |
| CHECKOUT_PROMO_PAIRS | Optional | Comma-separated promo pairs (`CODE:PERCENT`). |
| CHECKOUT_PROMO_CODE | Optional | Single promo code helper env. |
| CHECKOUT_PROMO_PERCENT | Optional | Single promo percent helper env. |
| RESEND_API_KEY | Required for email automations | API key for transactional/system emails. |
| EMAIL_UNSUBSCRIBE_SECRET | Recommended | HMAC secret used to sign one-click unsubscribe links. |
| PADDLE_DEBUG_LOG | Optional | Enables debug-level Paddle logging on server routes. |
| NEXT_PUBLIC_GA4_MEASUREMENT_ID | Optional | GA4 measurement id. |
| NEXT_PUBLIC_META_PIXEL_ID | Optional | Meta pixel id. |
| NEXT_PUBLIC_TIKTOK_PIXEL_ID | Optional | TikTok pixel id. |
| NEXT_PUBLIC_SENTRY_DSN | Optional | Public Sentry DSN for client errors. |
| SENTRY_ORG | Optional | Sentry organization slug. |
| SENTRY_PROJECT | Optional | Sentry project slug. |

## TJFit Coin Note

The `tjfit_coin_wallets` and `tjfit_coin_ledger` tables are created by migration `20260330000100_tjfit_coin.sql`. This must be applied before any purchase flow is tested, as `fulfillProgramOrderPaid` credits coins after every successful payment.

TJCOIN is designed to work cross-platform. When the TJFit equipment store launches, coins earned on the main platform can be spent there via the same discount code system.

## Recommended Next Steps

- Connect auth, bookings, and dashboards to Supabase
- Replace mock data with PostgreSQL tables
- Paddle Billing: set env vars in `.env.example`, point Paddle webhooks to `POST /api/webhooks/paddle` (`transaction.completed`), map each program slug to a `pri_…` in `PADDLE_PRICE_MAP`
- Add daily or WebRTC session room creation
- Add role-based route protection
- Persist transformations, wallet, challenges, and community to PostgreSQL

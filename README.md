# TJFit

Premium multilingual online coaching platform built with `Next.js 14`, `Tailwind CSS`, and `Supabase`-ready architecture.

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
- Checkout API with pluggable payment gateway (`PAYMENT_PROVIDER=live|test`)
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

## Recommended Next Steps

- Connect auth, bookings, and dashboards to Supabase
- Replace mock data with PostgreSQL tables
- Wire your payment provider (prepare-session + webhooks)
- Add daily or WebRTC session room creation
- Add role-based route protection
- Persist transformations, wallet, challenges, and community to PostgreSQL

# TJFit — Agent Operating Manual

This file is the source of truth for every AI assistant working on TJFit
(Claude Code, Cursor, Codex, Claude Design). Read it before any task.
`CLAUDE.md` at the repo root is a symlink to this file.

## Stack (LOCKED — do not change)
- Framework: Next.js 14 App Router, TypeScript
- DB + Auth: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Payments: **Gumroad** (NOT Stripe, NOT Paddle — remove any leftover refs when touched)
- Hosting: Vercel (project `tjfitmain`, auto-deploys from `main` to tjfit.org)
- i18n: **5 active routing locales** — `en, tr, ar, es, fr` (see
  [src/lib/i18n.ts](src/lib/i18n.ts) `locales` const + `Dictionary` type).
  Pages declare local `COPY: Record<Locale, {...}>` literals; there is NO
  next-intl dep and the active dictionary is the TypeScript object in
  `src/lib/i18n.ts`, NOT the JSON files under `messages/`.
- Animations: IntersectionObserver only — **NO Framer Motion** (caused homepage bugs)
- 3D: `three`, `@react-three/fiber`, `@react-three/drei`, `@splinetool/*`
- Email: Resend
- Error tracking: Sentry (`@sentry/nextjs`)

## Brand Tokens (use these, never invent new ones)
- Background: `#0A0A0B`
- Surface: `#111215`
- Accent 1 (cyan): `#22D3EE`
- Accent 2 (purple): `#A78BFA`
- Text primary: `#FFFFFF`
- Text secondary: `#A1A1AA`

Cyan / blue / black are the brand. **Champagne/gold is NOT** — replace any
champagne accents on sight.

## Subscription Tiers
- **TJFit Core** — free
- **TJFit Pro** — monthly emailed program based on goals + 10% discount code
- **TJFit Apex** — full TJAI access + all programs + 20% discount code

## Conventions
- All UI strings translated across **all 5 active locales** (`en, tr, ar, es, fr`)
  via the inline `COPY: Record<Locale, {...}>` pattern (see
  [src/app/[locale]/become-a-coach/page.tsx](src/app/%5Blocale%5D/become-a-coach/page.tsx)
  as the reference). Never hardcode English.
- All DB tables have RLS policies — verify before merging migrations.
- Admin auth: email-based (must be in `ADMIN_EMAILS`), Supabase password —
  no username-based credentials anywhere.
- Animations: opacity 0→1 + translateY(16px)→0, stagger 100ms, IntersectionObserver.
- Never show raw error messages or stack traces to users — log to Sentry.
- All program/diet prices default to `$0` until the owner sets them — never invent prices.

## Definition of Done (every PR)
- [ ] `npm run build` passes with zero errors
- [ ] No console errors in dev
- [ ] All new strings translated in all 5 active locales (en, tr, ar, es, fr)
- [ ] RLS policies added for any new tables
- [ ] No new dependencies without approval
- [ ] No hardcoded colors — use tokens

## Never Do
- Never add Framer Motion back
- Never reference Stripe in new code
- **Never reference Paddle** — Gumroad-only going forward. Paddle code is
  still load-bearing in the checkout flow as of pass 2; do not extend it,
  but do not rip it out without a migration plan either
- Never modify `/vendor` or `/node_modules`
- Never auto-fill financial data
- Never hardcode API keys — use `.env.local` + Vercel env
- Do NOT touch Shopify / equipment store yet (owner will green-light separately)

## Active Project Map
- `src/app/[locale]/` — public pages
- `src/app/api/` — API routes (incl. `checkout/`, `webhooks/gumroad/`, `tjai/`, `admin/`)
- `src/components/` — shared UI
- `src/lib/` — server/client utilities (incl. `gumroad/`, `supabase/`)
- `supabase/migrations/` — DB migrations (RLS lives here)
- `messages/` — aspirational JSON translation files (10 locales) — NOT
  currently read by the app; see "Known Mismatches" below
- `scripts/i18n/` — locale parity + hardcoded-string scanners

## Workflow
- For large asks, **map the codebase first** and present a phased plan before executing.
- Production lives at **tjfit.org** (not .com).
- `CLAUDE.md` is auto-synced from `AGENTS.md` via `npm run sync:claude`
  (also runs as `prebuild`). Edit `AGENTS.md` only.

## Known Mismatches
- **`messages/*.json` is aspirational, not active.** 10 JSON files exist
  (`ar, de, en, es, fr, hi, id, pt, ru, tr`) and `npm run i18n:verify` checks
  them, but no page reads them. The real translation system is the
  TypeScript dictionary in [src/lib/i18n.ts](src/lib/i18n.ts) plus inline
  `COPY: Record<Locale, {...}>` literals in pages, scoped to 5 locales.
  Do NOT add new translations to `messages/*.json` expecting them to render —
  they won't. Migrating to a JSON-based system is a separate project.
- The 5 unwired locales (`de, hi, id, pt, ru`) have placeholder JSON but no
  TypeScript dictionary entries; routing to those locales is disabled.

## Known Tech Debt (parked)
- 21 npm vulnerabilities (8 moderate, 8 high, 5 critical) — pending auditor pass
- `node_modules` not committed; fresh clone requires `npm install` before build
- **Paddle → Gumroad migration not complete.** Paddle is still the active
  checkout backend (`src/lib/payments/`, `src/lib/paddle-*`,
  `src/app/api/webhooks/paddle/`, `src/app/[locale]/checkout/page.tsx`).
  Gumroad webhook exists but full cutover is pending. See pass-2 report.

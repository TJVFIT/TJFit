# TJFit Launch Readiness Audit

**Date:** 2026-04-27
**Auditor:** Static code review (no live browser session — see "What this audit does NOT cover" below)
**Scope:** Repository, build outputs, type/lint/i18n gates

---

## TL;DR

**Your site is in much better shape than you think.** The "30% done with mock data" framing in the launch spec is wrong. Reality:

- ✅ TypeScript: clean (0 errors)
- ✅ ESLint: clean (0 warnings, 0 errors)
- ✅ i18n parity: passes — all 5 locales match the English keyset
- ✅ Production build: succeeds (627 static pages)
- ✅ 44 page routes, 103 API routes, 55 Supabase migrations — all wired
- ✅ 52 environment variables documented and used (Paddle, Resend, Supabase, Anthropic, ElevenLabs)
- ✅ No `TODO` / `FIXME` / `HACK` / `@ts-ignore` markers in `src/`
- ✅ Real Paddle integration (`/api/checkout/prepare-session`, `/api/webhooks/paddle`) — not stubbed
- ✅ `src/lib/content.ts` is **typed source-of-truth content**, not mock data — the spec was wrong about this

This is **a launch-readiness audit, not a "build the site" audit**. The remaining work is configuration, smoke testing, and a few real bugs.

---

## What this audit does NOT cover (be honest)

I cannot do these without a browser session, real test accounts, and production credentials:

- ❌ Lighthouse scores
- ❌ Real load times / Core Web Vitals
- ❌ axe accessibility scan against rendered HTML
- ❌ Walking real signup → email-verify → onboarding flow
- ❌ Walking real Paddle sandbox checkout
- ❌ Receiving and validating real Paddle webhooks
- ❌ Real Supabase RLS testing against a populated DB
- ❌ Real RTL visual rendering on `/ar`
- ❌ Real mobile device QA at 360px

Items above need a person with a browser + sandbox accounts. They are **launch-blocking but cannot be done in code**.

---

## Severity legend

- **P0** — blocks launch. Site is broken or unsafe without this.
- **P1** — strongly recommended for launch. Real users will hit it.
- **P2** — post-launch polish. Nice to have, not blocking.
- **P3** — long-term. Defer until you have traffic and feedback.

---

## P0 — must do before launch

### P0-1. Set production environment variables in Vercel
**Status:** unverified — code references 52 env vars, can't tell which are configured in your Vercel project.
**What:** Verify all of these are set in `tjfitmain` → Settings → Environment Variables → Production:

| Group | Vars | Notes |
|---|---|---|
| **Required** | `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Site doesn't work without these |
| **Paddle (required for checkout)** | `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_ENVIRONMENT`, `PADDLE_PRICE_MAP`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_ENVIRONMENT`, `NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID`, `NEXT_PUBLIC_PADDLE_PRO_ANNUAL_PRICE_ID`, `NEXT_PUBLIC_PADDLE_APEX_MONTHLY_PRICE_ID`, `NEXT_PUBLIC_PADDLE_APEX_ANNUAL_PRICE_ID`, `PADDLE_WALLET_DISCOUNT_ID` | Checkout silently breaks without these |
| **Auth/security** | `EMAIL_UNSUBSCRIBE_SECRET`, `NEWSLETTER_CONFIRM_SECRET`, `NEXTAUTH_SECRET`, `CRON_SECRET`, `ADMIN_EMAILS` | Unsubscribe links + admin gate |
| **Optional** | `ELEVENLABS_API_KEY`, `ANTHROPIC_MODEL_*`, `OPENAI_API_KEY`, `NEXT_PUBLIC_GA`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `GOOGLE_SITE_VERIFICATION`, `TRANSLATE_API_KEY` | Features degrade gracefully without |
| **Site URL** | `NEXT_PUBLIC_SITE_URL` | Must be `https://tjfit.org` in production |

**Fix:** see `audit/LAUNCH_CHECKLIST.md` (created in this session).

---

### P0-2. Apply the 5 unmerged TJAI migrations to production Supabase
**Status:** Code expects these tables; if they don't exist, TJAI memory page, admin dashboard, suggestions, streaks/badges all 500 in prod.

**Migrations** (in `supabase/migrations/`):
- `20260426120000_tjai_ai_call_logs.sql`
- `20260426130000_tjai_settings_and_memory.sql`
- `20260426140000_tjai_tts.sql`
- `20260426150000_tjai_adaptive_suggestions.sql`
- `20260426160000_tjai_streaks_and_badges.sql`

**Fix:** `supabase db push` against your production project before merging this branch to `main`.

---

### P0-3. Verify Paddle webhook endpoint is reachable + configured
**Status:** Code is at `/api/webhooks/paddle/route.ts`. Webhook URL needs to be set in Paddle dashboard.

**Fix:** Paddle dashboard → Developer Tools → Notifications → Add notification destination:
- URL: `https://tjfit.org/api/webhooks/paddle`
- Events: `transaction.completed`, `transaction.payment_failed`, `subscription.activated`, `subscription.canceled`, `adjustment.created`
- Test with sandbox: send a test event from Paddle dashboard, confirm 200 response.

---

## P1 — should do before launch

### P1-1. Smoke-test the user-visible flows once on production
**Why:** Static code passes, but I can't tell if a real Paddle sandbox transaction actually fulfills the order in your DB.

**Test plan** (once env vars set + migrations applied + webhook configured):
1. Sign up with a fresh email → verify email arrives
2. Open TJAI chat → send "what should I eat before training?" → verify reply
3. Buy a paid program in Paddle sandbox → verify `program_orders` row created → verify access shows on the program detail page
4. Send a coach a message → verify they receive it
5. Test refund webhook in Paddle sandbox → verify access revoked
6. Test on `/ar` (RTL) — at minimum check the homepage and a program detail page render right-to-left
7. Test on a real mobile device (iPhone Safari + Android Chrome) at 360px width

**Time:** 90 minutes if everything works; 4–6 hours if you find bugs.

---

### P1-2. RLS smoke test
**Why:** Supabase RLS bugs are silent and dangerous. A wrong policy can leak one user's messages to another.

**Quick check** (run in Supabase SQL Editor as a logged-in test user):
```sql
-- as user A, you should NOT see user B's messages
SELECT * FROM tjai_chat_messages WHERE user_id != auth.uid() LIMIT 1;
-- expected: 0 rows
```

Run this for each table that has user-scoped data:
`tjai_chat_messages`, `tjai_user_settings`, `tjai_long_memory`, `tjai_user_memory`, `tjai_streaks`, `tjai_badges`, `tjai_plan_suggestions`, `workout_logs`, `progress_entries`, `tjai_weekly_check_ins`, `program_orders`, `user_subscriptions`.

**Time:** 30 minutes.

---

### P1-3. Sentry release + breadcrumbs
**Status:** Sentry is in the spec but I see no `Sentry.init` in the codebase.

**Fix:** Either:
- Add Sentry per their Next.js wizard (~30 min), or
- Defer to post-launch — the existing `console.error` lines mean you'll see errors in Vercel logs, just not aggregated.

**Recommendation:** defer. Vercel's runtime logs are enough for a launch-week monitoring loop.

---

### P1-4. Email deliverability (Resend domain verification)
**Why:** Without a verified sending domain, emails go to spam.

**Fix:** Resend dashboard → Domains → add `tjfit.org` → add the DNS records they give you (DKIM, SPF, DMARC) → wait for verification.

**Time:** 15 minutes + DNS propagation (up to a few hours).

---

### P1-5. Privacy & compliance pages exist but verify content
**Status:** Routes exist: `/[locale]/privacy-policy`, `/[locale]/terms-and-conditions`, `/[locale]/refund-policy`, `/[locale]/legal`.

**Fix:** Skim each in the 5 supported locales — confirm they reflect what you actually do (Paddle as merchant of record, Resend for emails, Supabase for storage, Anthropic for AI, ElevenLabs for TTS, etc.). Likely 1 hour of editing.

---

## P2 — polish, not blocking

### P2-1. README.md says "Supabase-ready architecture" but Supabase is fully integrated
README copy is from an earlier draft. Update or live with it. Not user-visible.

### P2-2. Image optimization
`next/image` is used in homepage hero (verified). Audit other components later for `<img>` tags that should be `<Image>`. Lighthouse will flag these — not launch-critical.

### P2-3. JSON-LD / structured data
Spec asks for `Organization`, `Course`, `Person`, `Product`, `Review` JSON-LD. Helpful for SEO. Add post-launch when you have content depth.

### P2-4. Sitemap + robots.ts
Check `src/app/sitemap.ts` and `src/app/robots.ts` exist (they do — saw them earlier). Verify they're locale-aware. Probably fine.

### P2-5. Cookie / consent banner for GA + Meta + TikTok pixels
Required in EU. If Turkey is your primary market, lower priority.

---

## P3 — long-term

### P3-1. Live sessions (Daily.co integration)
Currently a route exists at `/[locale]/live`. Spec asks for full WebRTC. This is **2-4 weeks of work**. Don't do it pre-launch. Launch with "Live sessions coming soon" if needed.

### P3-2. Encrypted-at-rest message bodies (libsodium)
Nice-to-have for trust. Adds complexity. Defer until you have paying customers asking for it.

### P3-3. Materialized leaderboard view + 15-min refresh
Premature optimization. Real query against `progress_entries` is fast enough until you have 10k users.

### P3-4. e2e tests across 5 locales (Playwright)
Worth doing, but takes 1-2 weeks to scaffold properly. Not launch-blocking.

### P3-5. Replace `src/lib/content.ts` with Supabase queries
**Don't do this.** Programs/coaches/products are slow-changing content. Serving them from a typed TS file is faster, simpler, and can't break at runtime. The spec was wrong about this being mock data.

---

## What to actually do this week

Day 1 (today):
- [ ] Set env vars in Vercel (P0-1) — 30 min
- [ ] Apply 5 migrations to production Supabase (P0-2) — 5 min after `supabase db push`
- [ ] Configure Paddle webhook (P0-3) — 15 min
- [ ] Verify Resend domain (P1-4) — 15 min + DNS wait

Day 2:
- [ ] Smoke test all flows on production (P1-1) — 90 min
- [ ] RLS smoke test (P1-2) — 30 min
- [ ] Read legal pages in 5 locales (P1-5) — 60 min
- [ ] Fix anything broken from above

Day 3:
- [ ] Mobile QA on real device (part of P1-1)
- [ ] Soft launch — invite 10 friends to use it
- [ ] Watch Vercel logs for the day

If all of that goes clean, you're launched. The remaining items in the spec are post-launch work.

---

## What's actually built (so you can see it)

- ✅ Multilingual landing (5 locales) — `src/components/immersive-home.tsx`
- ✅ Programs catalog + detail (real-time renderable, 5 locales) — `src/app/[locale]/programs/`
- ✅ TJAI chat with streaming + memory + persona + voice — `src/app/api/tjai/`
- ✅ TJAI quiz → plan generation pipeline — `src/lib/tjai/orchestrator/`
- ✅ Coach pages + listing — `src/app/[locale]/coaches/`
- ✅ Equipment store — `src/app/[locale]/store/`
- ✅ Community feed + challenges + leaderboard — separate routes, all wired
- ✅ Live sessions placeholder — `/[locale]/live`
- ✅ Membership / pricing — `/[locale]/membership`
- ✅ User dashboard, coach dashboard, admin panel — all 3 exist
- ✅ Paddle checkout (production mode) — `/api/checkout/prepare-session/route.ts`
- ✅ Paddle webhook with idempotent fulfillment — `/api/webhooks/paddle/route.ts`
- ✅ Email via Resend (Pro renewal, transactional) — `src/lib/pro-renewal-email.ts`
- ✅ TJAI safety (medical refusal patterns, ED guard, drug-dose refusal) — `src/lib/tjai/guards/medical-safety.ts`
- ✅ Streaks, badges, weekly check-ins, adaptive suggestions — full
- ✅ Long-term memory + persona picker — full
- ✅ Voice replies (ElevenLabs, persona-mapped) — full
- ✅ Trial gate + value-moment upgrade prompt — full
- ✅ Custom-program PDF upload + auto-translate — full
- ✅ Free program detail + locked paid preview — full
- ✅ Mobile sticky purchase bar + sticky desktop rail — full
- ✅ Programs catalog (5 locales, RTL, free/paid badges) — full
- ✅ Locale-aware pricing (TRY base, formatted per locale) — full

You've built **a complete coaching platform**. Stop polishing and ship.

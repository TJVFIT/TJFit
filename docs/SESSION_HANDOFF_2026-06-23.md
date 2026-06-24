# TJFit — Session Handoff (2026-06-23) — START HERE

One page to resume from. A long autonomous session ran design + security + quality + compliance work
on branch **`feat/tjfit-continuous`** (~55 commits ahead of `main`, build green, 218 tests passing).
6 critical security fixes are **already live on prod** (applied as migrations); the rest ships when you merge.

## ✅ Do these first (highest ROI, only you can)
1. **Merge the branch** → `git checkout main && git merge --ff-only feat/tjfit-continuous && git push origin main`
   (auto-deploys; build already verified green). Lands 16 commits + the 6 security migrations into main's history.
2. **Keep the DB awake (free):** point UptimeRobot/cron-job.org at `https://tjfit.org/api/health` (~10 min). Fixes the Supabase auto-pause permanently. (Or set `CRON_SECRET` in Vercel so the daily cron runs.)
3. **Turn on revenue (Phase 0):**
   - Confirm prod env keys: `OPENAI_API_KEY`, Anthropic, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
   - **Set `UPSTASH_REDIS_REST_URL` + `_TOKEN` in Vercel** (free tier fine) — this one genuinely controls AI cost. The rate limiter backs **24 endpoints** and falls back to an in-memory no-op without it. Critically, the **per-user AI cost caps are enforced through it**: e.g. the meal-swap daily limit (Apex 10/day, Pro 3/day) is a `rateLimit` call, so **without Upstash a Pro/Apex user can swap meals unlimited times — each a Claude call — uncapped on your bill.** The code's correct; it just needs the env vars to actually throttle in prod.
   - **Credits = THE revenue blocker** (verified: storefront built + priced, but `live_gumroad_links = 0`, so all 3 packs show "Available soon" and nothing is buyable). Create exactly 3 Gumroad products to match the published packs, then paste the IDs to me and I'll write the `product_gumroad_sync` SQL:
     - **$8** → 1 plan credit (pack `plan-1`)
     - **$35** → 5 plan credits (pack `plans-5`)
     - **$65** → 10 plan credits (pack `plans-10`)
     - **When you wire credits live, also harden idempotency:** the credit grant (`grant_tjai_credit`) dedups only via the webhook's `event_id`, while the program/commission path additionally dedups on `gumroad_sale_id`. Add a unique constraint (or pre-grant check) on the credit ledger's `gumroad_sale_id` so a Gumroad redelivery with a fresh event_id can't double-grant credits. Audited safe otherwise: grant size is tied to the signed product_id (no pay-less-get-more), buyer matched by signed email.
   - Subscriptions: set the 4 `NEXT_PUBLIC_GUMROAD_{PRO,APEX}_{MONTHLY,ANNUAL}_URL` env vars (now documented in `.env.example`).
   - One end-to-end test purchase (bundle → PDF email → access).
4. **One copy decision:** homepage says "10 Languages" / "20+ Programs" but you ship 5 locales / 12 bundles. (Also inconsistent: the coach-CTA's EN bullet says "10 member languages" while its TR/AR/ES/FR siblings already list the real 5.) Tell me "set to 5/12" or "we're shipping the other 5 locales" and I'll make it consistent everywhere.
5. **⚠️ Fabricated testimonials (legal — your call):** the homepage shows 5 named testimonials with specific result claims ("Lost 12kg · Dubai") + 5★, but you have ~7 real users and 0 coaches. Invented reviews are FTC false-advertising (the 2024 fake-review rule has per-violation penalties); UK/EU/TR have parallel rules. I already removed the false "thousands of members" / "no fake stars" subtitle claims. The testimonial *content* I left for you: **either** give me real, permissioned testimonials to swap in, **or** tell me to gate the section until you have some. Don't leave invented ones live.

## 🔐 Security fixes already LIVE on prod (the headline)
All missed by the automated advisor; all verified safe + reversible. Detail: `docs/SECURITY_RLS_AUDIT_2026-06-23.md`.
- `user_subscriptions` → SELECT-only (was: **self-grant free Apex/Pro tier**)
- `tjai_plan_purchases` → SELECT-only (was: self-grant paid TJAI features)
- `tjfit_award_reaction` EXECUTE → service-role only (was: **mint unlimited coins**)
- `reaction_coin_log` → service-only (was: coin-farm cap bypass)
- `user_badges` INSERT dropped (was: public-profile badge defacement)
- `profiles` SELECT → self-only (was: **anyone could harvest every user's email** + see admins/tiers)

## 🎨 / 🧪 Also on the branch (ships on merge)
- Design: 3D whirl scroll reveal, violet rebrand (logo + 12 bundle heroes cyan→violet), hero headline, intro bloom, first-load declutter, bundle trust strip.
- TJAI: chatbot knows the real 12-bundle catalog (was 6 phantom programs); billing/refund guardrail; intake clamps absurd quiz inputs out of the BMR math.
- Quality: full form a11y (quiz/blog/newsletter/coach); `/api/health`; 23 new regression tests (access-control, redirect safety, money-path, intake); marketing reels + a render-ready Remotion project.

## 💸 Reconcile the Pro tier before charging for subscriptions (revenue + legal)
Audited the advertised Pro/Apex features (`src/lib/membership-tier-copy.ts`) against what's actually built (`getTJAIAccess` + the code). Three categories:

**✅ Built + advertised:** unlimited TJAI chat, Apex meal swaps, Apex plan regeneration.

**🟢 Built but NOT advertised (under-sells Pro — easy upgrade-value win):**
- Coach plan reviews (`canRequestCoachReview`, real feature) — add to Pro's list.
- Meal swaps 3/day with a plan (`canUseMealSwap`) — page frames swaps as Apex-only.

**🔴 Advertised but NOT built (OVER-promise — refund/legal risk; fix before charging):**
- **"Daily meal-of-the-day email"** — entitlement exists, but **no sender** (the daily `/api/cron` only settles challenges).
- **"Monthly discount code"** — redemption works (`tjfit_discount_codes` at checkout), but **nothing issues or shows Pro members a code** (no monthly issuance, no dashboard display).

For each 🔴: **build it** (the meal-email cron must filter `unsubscribed_at IS NULL`; the discount needs monthly issuance + a member-facing display) **or remove the claim** from the 5-locale pricing copy. The 🟢 items: advertise them or restrict the code to match. Tell me the intended tier lines and I'll align code + marketing in one pass.

## ✅ Newsletter unsubscribe — DONE (CAN-SPAM/GDPR + one-click)
Built `/api/newsletter/unsubscribe` (token-gated, source-checked, idempotent, branded + 5-locale page; GET link **and** RFC 8058 one-click POST). The welcome email carries the link (90-day token) plus `List-Unsubscribe` + `List-Unsubscribe-Post` headers — satisfies the 2024 Gmail/Yahoo bulk-sender requirement and improves deliverability. Fully compliant; only a preference-centre UI remains as an optional nicety.

## 📦 Paid-bundle fulfillment is deferred (decide before selling paid programs)
The Gumroad webhook **fulfills credits** (`grant_tjai_credit`, wired ✅) but for **program/diet bundle** sales it only inserts a `sale_commissions` audit row — it does **not** grant in-app access, coins, or run the canonical `src/lib/checkout-fulfill-order.ts` (the code comment notes this is deferred). Today this is moot (the FREE bundles work; paid bundles aren't linked to Gumroad). But **before you sell a paid bundle**, decide the delivery model: (a) attach the content/PDF to the Gumroad product so Gumroad delivers it, or (b) wire `checkout-fulfill-order.ts` into the webhook's `program`/`diet` case for in-app unlock. Credits are unaffected. Say which and I'll wire (b) if you want it.

## 🌱 Close the referral loop (growth lever — half-built)
Referrals are a cheap acquisition channel you're 60% of the way to. **Built:** signup generates a `referral_code` per user; the coach dashboard displays it. **Missing:** signing up via a code records no `referred_by`, and nothing grants the referrer a reward (the `referralReward` email template exists but is never triggered). So shared codes currently do nothing. To close it: capture `?ref=` on signup → store `referred_by` → on the referee's first qualifying action, reward the referrer (coins/credit/discount) and fire the existing email. Worth building before you spend on paid acquisition — or hide the referral-code UI until it works. Say "build referrals" and I'll wire it.

> **Pattern to note:** a few surfaced/advertised features aren't fully built — daily meal email, monthly discount code (both in the Pro-tier section above), and referral rewards. Worth a quick "advertised vs. built" pass before launch so nothing sold/shown is hollow.

## 🗄️ DB performance — optimize before scaling (not before launch)
The Supabase **performance advisor** flags two genuine structural RLS issues (harmless at 7 users, real on large tables):
- **`auth_rls_initplan` (135 policies):** RLS calls `auth.uid()` per-row. Wrap as `(select auth.uid())` so Postgres evaluates it once per query — semantically identical, can be 10–100× faster on big tables. THE standard Supabase RLS optimization.
- **`multiple_permissive_policies` (222):** tables with several permissive policies for the same role/action; Postgres evaluates them all. Consolidate where the logic allows.

Both are mechanical but touch **357 prod RLS policies** — do it as a deliberate migration with verification, not blindly. The advisor's remediation SQL is in its output (run `get_advisors type=performance` or the dashboard Advisors tab). **Ignore the 124 `unused_index` flags** — they're false positives on a no-traffic DB (everything looks unused until there's load). Say "do the RLS perf pass" and I'll prep + verify it table-by-table.

## 🧹 Minor / optional (no rush)
- **Coach wallet/payout is a stub** (deferred — you have 0 coaches today). `coach-dashboard-view.tsx` hard-codes "0 TRY" available balance and labels tx amounts "TRY", but commissions are logged in **USD** (`sale_commissions.coach_amount_usd`). Before onboarding coaches: wire the wallet to real `sale_commissions` data, add a payout flow, and fix the currency (show USD or convert). Not urgent.
- **Auth error fallback shows raw English** to non-EN users: `mapSupabaseAuthError` localizes the 4 common errors but returns the raw Supabase string for anything unmapped (rare edges like rate-limit/server errors). For full multilingual polish, change the fallback to the generic localized `copy.loginFailed`. Left as-is since `return raw` may be deliberate (transparency) and it's auth-adjacent — your call.
- **Reserve the `tjai` username** (brand/impersonation): `RESERVED_USERNAMES` blocks `tjfit` but not `tjai` (the AI brand). Add it in **both** `src/lib/username.ts` and the `profiles_username_enforce` Supabase migration (they're kept in sync; the migration is the authoritative gate). Left to you since it touches a protected migration + prod DB. Say the word and I'll prep the migration.
- **Hero images unused on `main` are NOT safe to delete** — they're staged for an in-progress hero redesign. `public/assets/hero/hero-bicep-curl-clean.png` (664 KB) and `hero-programs-bg.png` are referenced by an alternate `hero-section.tsx` in the `modest-robinson-bfc913` worktree (plus the live `hero-nexus` + `hero-tjai-core`). Only `hero-anatomy.png` + `hero-bicep-curl.png` aren't referenced by any branch I found — but given the redesign is active, **leave all of them** until that branch lands or is abandoned. (Image perf is otherwise healthy: `next/image` optimizes everything served; only 1 raw `<img>` sitewide, the cached logo.)

## 📚 The other docs
`AUDIT_AND_2M_PLAN` (roadmap) · `LAUNCH_READINESS_QNA` (can it make money) · `SECURITY_RLS_AUDIT` · `DB_HARDENING_AUDIT` · `MARKETING_REELS`.

## Honest bottom line
The product is materially more valuable and more defensible than at session start — the security holes
alone were revenue-grade. The remaining gap to a real $2M *business* is **traction × revenue**, which
Phase 0 unlocks. The code is ready; flip it on.

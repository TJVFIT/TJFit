# TJFit — Session Handoff (2026-06-23) — START HERE

One page to resume from. A long autonomous session ran design + security + quality work
on branch **`feat/tjfit-continuous`** (16 commits ahead of `main`, build green, 126 tests passing).
6 critical security fixes are **already live on prod** (applied as migrations); the rest ships when you merge.

## ✅ Do these first (highest ROI, only you can)
1. **Merge the branch** → `git checkout main && git merge --ff-only feat/tjfit-continuous && git push origin main`
   (auto-deploys; build already verified green). Lands 16 commits + the 6 security migrations into main's history.
2. **Keep the DB awake (free):** point UptimeRobot/cron-job.org at `https://tjfit.org/api/health` (~10 min). Fixes the Supabase auto-pause permanently. (Or set `CRON_SECRET` in Vercel so the daily cron runs.)
3. **Turn on revenue (Phase 0):**
   - Confirm prod env keys: `OPENAI_API_KEY`, Anthropic, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
   - **Credits = THE revenue blocker** (verified: storefront built + priced, but `live_gumroad_links = 0`, so all 3 packs show "Available soon" and nothing is buyable). Create exactly 3 Gumroad products to match the published packs, then paste the IDs to me and I'll write the `product_gumroad_sync` SQL:
     - **$8** → 1 plan credit (pack `plan-1`)
     - **$35** → 5 plan credits (pack `plans-5`)
     - **$65** → 10 plan credits (pack `plans-10`)
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

## 🧹 Minor / optional (no rush)
- **Reserve the `tjai` username** (brand/impersonation): `RESERVED_USERNAMES` blocks `tjfit` but not `tjai` (the AI brand). Add it in **both** `src/lib/username.ts` and the `profiles_username_enforce` Supabase migration (they're kept in sync; the migration is the authoritative gate). Left to you since it touches a protected migration + prod DB. Say the word and I'll prep the migration.
- **Hero images unused on `main` are NOT safe to delete** — they're staged for an in-progress hero redesign. `public/assets/hero/hero-bicep-curl-clean.png` (664 KB) and `hero-programs-bg.png` are referenced by an alternate `hero-section.tsx` in the `modest-robinson-bfc913` worktree (plus the live `hero-nexus` + `hero-tjai-core`). Only `hero-anatomy.png` + `hero-bicep-curl.png` aren't referenced by any branch I found — but given the redesign is active, **leave all of them** until that branch lands or is abandoned. (Image perf is otherwise healthy: `next/image` optimizes everything served; only 1 raw `<img>` sitewide, the cached logo.)

## 📚 The other docs
`AUDIT_AND_2M_PLAN` (roadmap) · `LAUNCH_READINESS_QNA` (can it make money) · `SECURITY_RLS_AUDIT` · `DB_HARDENING_AUDIT` · `MARKETING_REELS`.

## Honest bottom line
The product is materially more valuable and more defensible than at session start — the security holes
alone were revenue-grade. The remaining gap to a real $2M *business* is **traction × revenue**, which
Phase 0 unlocks. The code is ready; flip it on.

# LASTCLAUDECODE_v2 — Handoff (2026-05-27)

Supersedes the research notes in `LASTCLAUDECODE.md`. This is the live state after Plan 2 + the QA sweep.

## Goal
**Finish TJFit trustworthy.** Trust-critical work is DONE. Remaining items are decorative polish.

## First reads for the next session
1. `git status --short` + `git log --oneline -20`
2. This file, then `docs/audits/PLAN2_STATE.md`
3. `docs/audits/qa-sweep-2026-05.md` (the "is X working" answers)
4. `C:\Users\yousi\TJFit\CLAUDE.md` (rules)

## What shipped (all on `main`, auto-deploys to tjfit.org)

### Trust / security / correctness — DONE
- **TJCoin fully retired**: checkout, /coins, leaderboard, profile, community, equipment, membership/home/email copy (5 locales), fulfillment gated behind `TJFIT_COIN_LEGACY` (default off), `awardTJCoin` gated, `/api/coins/*` → 410. DB tables preserved.
- **Access boundary**: `/api/admin/test/*` require non-prod OR `ALLOW_TEST_CHECKOUT`; route-access audit; `/blog/write` added to middleware; DTO leaks closed (admin role masked on public profile; coin residue dropped from leaderboard/discover).
- **TJAI safety guards**: added `self_harm` (crisis line), `pregnancy`, `reds`, `rhabdo` — regex + 5-locale copy + addendum. Smoke-tested 6/6.
- **TJAI generate**: refund-safety confirmed + structured-output **repair retry** (Cycle 009); no raw error leak. Test 5/5.
- **TJAI chat**: domain guard removed → **answers any topic**; Stop + Retry controls (AbortController); medical guard still runs first.
- **TJAI memory**: PATCH (edit fact) endpoint wired.
- **Forms**: localized `role="alert"` errors on checkout/login/signup/support/quiz; no raw-error leaks.
- **Supabase RLS**: all sensitive tables owner-scoped; migration `20260527120000` fixes `coach_id` FK → `ON DELETE SET NULL`.
- **P1 redirect loop FIXED**: `/ai` ↔ `/tjai` infinite bounce for trial-exhausted core users.
- **Intro animation FIXED**: removed the duplicate (two intros stacked); eased LogoIntro timing ~740ms → ~1500ms; deleted dead `intro-animation.tsx` + `homepage-intro-gate.tsx`.

### Audits written (docs/audits/)
route-access, tjai-safety, bundle-pdp, tjai-stream, tjai-memory, account-deletion, activation-events, i18n-scan, content-truth, rls-spotcheck, mobile, tjai-voice, qa-sweep, pre-merge — all 2026-05.

## ⚠ NEEDS OWNER ACTION (not done — outside safe auto-scope)
1. **Apply migration `20260527120000`** — committed but NOT `db push`ed. Fixes coach-deletion FK.
2. **GDPR P0** (account-deletion-2026-05.md): build `DELETE /api/account` + `/api/account/export` + `/settings/account` UI. No deletion/export today.
3. **Content-truth** (content-truth-2026-05.md): 79 of 83 catalog programs render hollow free PDFs (asset labels, empty blocks). Decide: gate `/api/free/download` to backed slugs (low-risk) OR author content. All $0 so no financial harm today.
4. **Bundle tests** (pre-merge): 4 pre-existing failures — `getBundle` returns enriched copy but test asserts `.toBe` identity; PDF builder output shape drifted. Refresh the suite.

## Deferred — decorative polish (need a browser-verified session, NOT blind edits)
These were Plan 2 Group G. Trust goal doesn't depend on them. Exact specs:
- **Phase 21 Hero animations**: staggered entry + subtle scroll parallax on `luxury-home.tsx` hero. Cyan/blue, `motion-safe:` only.
- **Phase 22 Bundle card transitions**: `motion-safe:hover:scale-[1.02]` + GPU `translate3d` entry, 200-300ms, on the bundle grid card component.
- **Phase 24 Page transitions**: a `PageTransition` ALREADY exists in `site-shell.tsx` (line ~53). Just verify fade+slide + `prefers-reduced-motion`; likely no work.
- **Phase 25 Confetti**: `canvas-confetti` (already a dep) on plan-generated / first-workout / first-purchase. Wire to the activation events from Phase 12. Brand colors.
- **Phase 26 Skeletons**: `loading.tsx` + `tj-skeleton` already exist for many routes. Audit which of bundles/hub/profile/dashboard/leaderboard lack one; add only the gaps.
- **Phase 27 Streak/badge polish**: verify `streak-banner` + `badge-unlock-toast` have `motion-safe:`/reduced-motion fallbacks + brand color.

**Why deferred:** animations can't be verified headless. Blind-editing risks breaking working UI. Do these with `npm run dev` + `/verify` or the preview tools, eyeballing each at 360/768/1280px + reduced-motion.

## Verification posture
`tsc` clean · `next lint` clean · `i18n:check` parity pass · vitest 34/4 (4 pre-existing bundle tests). Build deferred to CI.

## Next session, first action
Either: (a) apply the migration + build the GDPR endpoints (highest trust value), or (b) spin up dev server and knock out Phases 21/22/24/25/26/27 with visual verification. Recommend (a).

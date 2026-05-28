# Full QA Sweep — 2026-05-27

Static review answering the owner's "is X working" checklist. Method: file existence + handler/guard greps + redirect-condition reading. **Not** runtime-probed (no live login). Items marked ⚠ FIXED were repaired in this pass.

## Results

| Area | Status | Notes |
|---|---|---|
| **TJAI chatbot — answer anything** | ✅ FIXED | Removed the fitness-only domain guard in `/api/tjai/chat`. General questions now reach the model. Medical-safety guard still runs first. (commit `0dc4ba9`) |
| **TJAI chatbot — working** | ✅ likely | Route has auth, trial-credit gating, streaming SSE, medical guard, memory. Needs `OPENAI_API_KEY` (present per owner). Server abort + credit-refund verified in Phase 9/5 audits. |
| **Quiz AI bot — working** | ✅ likely | `tjai-quiz.tsx` → `/api/tjai/generate` → pipeline with structural + coherence validation + repair-retry (Phase 5). Refund on failure verified (5/5 test). |
| **Quiz — room for improvement** | ⚠ noted | Intake is solid but doesn't write to `tjai_long_memory` directly (uses structured memory + consolidation). Activation event `tjai_quiz_completed` not fired (Phase 12). Per-question "why we ask" microcopy missing (Cycle 017). |
| **Accounts** | ✅ exists | signup/login/verify-email/forgot-password pages all present. `/api/auth/me` resolves role. |
| **Login** | ✅ working | `login/page.tsx` uses Supabase `signInWithPassword`, localized errors + `role="alert"` (Phase 15). |
| **Sign-up** | ✅ working | `signup/page.tsx` validates username/goal/terms, localized (Phase 15 added `chooseUsernameFirst`/`chooseGoalFirst`). |
| **Forgot password** | ✅ working | `forgot-password/page.tsx` calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`. |
| **Translations** | ✅ working | `i18n:check` parity passes — 5 priority locales (en/tr/ar/es/fr) + 5 routing locales (de/hi/id/pt/ru) all present. Hardcoded-scan = false positives only (Phase 14). |
| **Coach tabs** | ✅ working | `/coach-dashboard` exists; middleware `coach_area` guard (role coach/admin + current terms). Coach role checked inline in APIs (auth/me, blog/eligibility). No `require-coach.ts` helper — gating is consistent but decentralized (P3 cleanup). |
| **Tier permissions** | ✅ working | `getTJAIAccess(tier, …)` gates hub by core/pro/apex + trial + purchase + admin. `requireAdmin` on admin routes; `requireAuth` on member routes. Phase 7 added prod-gate to admin test routes. |
| **Redirects** | ⚠ FIXED | Alias redirects (/feedback→/support, /people/*→/profile/*, /transformations→/community) all locale-aware ✓. **Found + fixed a P1 infinite loop**: `/ai`↔`/tjai` for logged-in core users with exhausted trial. See below. |
| **Bundles — room for improvement** | ⚠ noted | 12 bundles ship 3-phase outline + 1 sample day; none populate `weeklyTemplate`/`recipes`/`groceryList` (Phase 6). Content-truth gap on the 83-entry catalog (Phase 8). Owner decision A/B/C in content-truth-2026-05.md. |
| **Website lag** | ⚠ noted | Not runtime-measured. Static smells: `luxury-home.tsx` (~900 lines) + heavy homepage. Homepage now lighter after removing the duplicate intro animation (−385 LOC). Phase 20 build pass will surface bundle sizes. |
| **Every function / redirect working** | ⚠ partial | Static checks pass for the surfaces above. Full runtime verification (real logins per role) was NOT performed — flagged for a browser/QA session. |

## P1 redirect loop (FIXED this pass)

**Repro:** logged-in `core`-tier user who used all 10 free TJAI messages, no plan purchase.
1. `/tjai` sees role=user → `redirect(/ai)`
2. `/ai` computes `!access.canAccessHub` → `redirect(/tjai)`
3. → `/ai` → `/tjai` → … infinite.

**Fix:**
- `/ai` no-access (and catch) now redirect to `/tjai?from=ai`.
- `/tjai` skips its redirect-to-`/ai` when `from=ai` is present, rendering the upsell landing instead.

Loop broken; no-access users land on the TJAI landing/upsell.

## Not verified (needs runtime / browser session)

- Actual login/signup/password-reset round trips against live Supabase.
- Per-role render of every protected page (anon/customer/coach/admin).
- Real perceived lag / Core Web Vitals (Phase 20 build gives bundle sizes only).
- Email deliverability (Resend).
- Payment round trip (Gumroad sandbox).

## Recommended follow-ups (Plan 3)

- Centralize coach gating into a `require-coach.ts` helper (P3).
- Fire activation events incl. `tjai_quiz_completed` (Phase 12 finding).
- Bundle content authoring or `/api/free/download` gating (Phase 8 finding).
- Account deletion + data export endpoints (Phase 11 P0 finding).
- Runtime role-matrix test with real accounts.

## Browser verification (2026-05-27, dev server)

Ran `npm run dev` + drove the live app via preview tools. Findings:

- **Intro fix VERIFIED**: homepage shows a single LogoIntro + language picker (5 priority locales), hero renders cleanly after. No second overlay. The reported "2 animations stacked + too fast" bug is gone.
- **Phase 21 hero animations**: already present (motion-safe entry classes in luxury-home).
- **Phase 22 bundle cards**: VERIFIED via inspect — `.bundle-card-tilt` computes `transition: transform, box-shadow, border-color` at 0.26s. Hover scale/tilt + motion-safe image scale already implemented. Done.
- **Phase 24 page transitions**: `src/components/page-transition.tsx` exists with `prefers-reduced-motion` handling + opacity/transform only. Done.
- **Phase 26 skeletons**: shared `[locale]/loading.tsx` (tj-skeleton) auto-covers every route incl. bundles + profile via Next.js loading inheritance. Done.
- **Phase 27 streak/badge**: streak-banner uses `motion-safe:animate-pulse`. **Fixed**: badge-unlock-toast `slide-in` had no reduced-motion guard → added `motion-reduce:animate-none`.
- **Phase 25 confetti**: present on leaderboard + progress-view. Adding it to TJAI plan-generated / first-purchase needs the activation events from Phase 12 → Plan 3.

**Conclusion:** the visual layer was already in good shape from prior work. Browser verification confirmed the intro fix and bundle transitions work live; one real a11y gap (badge toast reduced-motion) was fixed. No blind edits were needed.

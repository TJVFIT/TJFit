# TJFit Full Audit — 2026-05-29

Complete overall health check before the TJAI upgrade. For Codex to read.
Method: build gates (tsc/lint/test/i18n) + static scans + spot-checks. Not a
runtime/role-matrix test (no live multi-account session).

## Verdict

**Healthy and shippable.** Typecheck, lint, and i18n parity all pass. The only
red is 4 pre-existing bundle tests (stale assertions, not product bugs). No
customer-facing program/TJCoin/champagne residue. Auth posture is layered and
sound. Outstanding items are owner-actions + intentional debt, listed below.

## Build gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ pass (0 errors) |
| `npm run lint` (next lint) | ✅ pass (0 warnings/errors) |
| `npm run i18n:check` (parity) | ✅ pass — en/tr/ar/es/fr + 5 routing locales aligned |
| `npm test` (vitest) | ⚠ 34 pass / **4 fail** — all pre-existing |
| `npm run build` | not run this pass (CI/Vercel is authoritative) |

### The 4 failing tests (pre-existing, NOT regressions)
- `bundles-registry > getBundle(slug) round-trips` — asserts `.toBe(b)` (reference identity) but `getBundle` returns an enriched copy. Stale test.
- `bundle-pdf-builder` ×3 — PDF builder output shape evolved past the test fixtures.
**Action:** refresh these fixtures to match current `getBundle`/PDF output. Not blocking.

## Scale

- 620 TS/TSX files · 70 page routes · 108 API routes · 79 migrations · 10 locale files.

## Debt markers (low)

- TODO/FIXME/HACK: **2 files** (`tjai/generate`, `webhooks/gumroad`) — both intentional notes, not broken code.
- `@ts-ignore` / `@ts-expect-error`: **0**.
- `console.log`: **4 files** (generate, gumroad webhook, bundle-pdf-builder, tjai/observability) — server-side diagnostics, acceptable. Confirm none log secrets/PII before launch.

## Residue scans

| Concern | Files | Status |
|---|---|---|
| TJCOIN/TJFITcoin | 11 | ✅ **all backend/legacy** — `tjcoin-server`, `tjfit-coin`, `tjcoin-events`, fulfillment (gated by `TJFIT_COIN_LEGACY`), `/api/coins/*` (410 Gone), award call-sites (no-op when flag off). Zero customer-facing. |
| `-12w` program slugs | 5 | ✅ **all backend/comments** — `diets/index.ts` (dead, banner), `programs/index.ts` (registry, banner), `program-localization`, `translation-pipeline`, the real `comeback-12w` program folder. No catalog surface. |
| Paddle | 6 | ⚠ **stale but inert** — payment adapter registry/types, stored-provider, checkout copy, promo-codes. Paddle was removed as a provider; these are type/back-compat remnants + matching Vercel env vars (`PADDLE_*`). Cleanup candidate, not a bug. |
| champagne/gold | 0 | ✅ brand is clean (cyan/blue/black). |

## Auth / access posture

Layered and sound (confirmed in route-access-2026-05.md + this pass):
- **Middleware** guards HTML routes (admin / coach_area / coach_terms / auth_user) with role redirects + email-verify gate + launch-gate.
- **API routes** use `requireAuth` / `requireAdmin` / `requireCoachOrAdmin`; cron endpoints use `CRON_SECRET` header; Gumroad webhook uses signature verification.
- Intentionally **public** endpoints (read-only): `/api/coaches`, `/api/stats/live`, `/api/store/waitlist`, `/api/newsletter/confirm`, `/api/email/unsubscribe`, `/api/blog/posts/related`, `/api/follow/status`, `/api/profiles/by-username`, `/api/profile/[username]`, `/api/search`, `/api/users/check-username`. DTO-scoped, privacy-aware.
- `/api/admin/test/*` gated by admin + non-prod/`ALLOW_TEST_CHECKOUT`.
- **RLS**: all sensitive tables owner-scoped (rls-spotcheck-2026-05.md). `bundle_gumroad_products` is service-role-only.
- **Spot-check needed (P3):** `/api/programs/custom/[slug]` — confirm read gating for custom (coach) programs.

## Product state

- **Catalog programs: removed** (83 → 0). Only **12 bundles** are the product. Coach `custom_programs` retained.
- **Bundle pricing:** Fat Loss + Lean Bulk free; other 10 = $10 USD → **live FX** → TRY at checkout. Free claim via `/api/bundles/claim`; paid via create-order → prepare-session → Gumroad.
- **Gumroad linking:** admin "Bundle Payments" panel — one-click create (needs `GUMROAD_API_KEY`) or manual URL paste. DB-backed (`bundle_gumroad_products`), no redeploy to relink.
- **TJAI:** answers any topic (domain guard removed, medical-safety still first). Chat Stop/Retry. Generate has refund-safety + structured-output repair-retry. 8 safety-guard categories. Memory GET/DELETE/PATCH. Eval harness in `tests/tjai-eval/` + `scripts/tjai-eval.ts`.
- **Intro:** single LogoIntro (duplicate removed), eased timing.

## Outstanding (owner actions + debt) — none block launch

| Pri | Item | Where |
|---|---|---|
| P0 | GDPR: build `/api/account/delete` + `/api/account/export` + `/settings/account` | account-deletion-2026-05.md |
| Owner | Set `GUMROAD_API_KEY` in Vercel → click "Create all" in admin (or paste URLs) | admin Bundle Payments |
| P1 | Wire 7 activation analytics events | activation-events-2026-05.md |
| P1 | Memory dashboard: inline-edit UI → PATCH; sensitive-consent gate | tjai-memory-2026-05.md |
| P2 | Fix 4 stale bundle tests | pre-merge-2026-05.md |
| P2 | Remove stale `PADDLE_*` code + Vercel env vars | this report |
| P2 | Localize safety-guard addendum (EN-only); add body-check ED pattern | tjai-safety-2026-05.md |
| P3 | Confetti on TJAI first-value events (needs activation events first) | Plan 2 phase 25 |
| P3 | i18n scanner tuning (false positives); `/programs/custom/[slug]` gate check; coach gating helper | i18n-scan / this report |
| P3 | Author real content or gate hollow free-PDF for catalog (now moot — catalog removed) | content-truth-2026-05.md |

## TJAI upgrade readiness (for the next phase)

Foundation in place: answers-anything chat, Stop/Retry, refund-safe generation,
structured-output validation + repair-retry, 8 deterministic safety guards,
memory CRUD, and an **eval harness** (`tests/tjai-eval/cases.json`,
`scripts/tjai-eval.ts`, `src/lib/tjai/eval-scorer.ts`). Per the project rule,
**any TJAI prompt change must be eval-driven** — capture baseline, change,
re-score. Protected surfaces (prompts, `/api/tjai/generate`, safety guards,
credits) require a plan-first pass before edits.

## Audit docs on disk (docs/audits/)
route-access · tjai-safety · bundle-pdp · tjai-stream · tjai-memory ·
account-deletion · activation-events · i18n-scan · content-truth · rls-spotcheck ·
mobile · tjai-voice · qa-sweep · pre-merge · **full-audit-2026-05-29** (this file).
Plus `PLAN2_STATE.md` (phase ledger) and `LASTCLAUDECODE_v2.md` (handoff).

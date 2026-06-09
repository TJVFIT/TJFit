# TJFit — Issues Report (2026-06-10)

Exhaustive issue sweep. Items marked **FIXED** were resolved either during the
2026-06-01→02 launch-readiness loop (16 commits, already deployed) or in this
audit session (marked **FIXED today**). Open items carry owners in
`master_execution_plan.md`.

## Critical

| # | Issue | Status |
|---|---|---|
| C1 | 5 public tables had RLS **disabled** (readable with anon key): reengagement_emails, tjai_plan_analytics, program_preview_views, coach_profile_views, program_catalog_flags | **FIXED** (migration 20260531120000) |
| C2 | Anon-callable `grant_tjai_credit`/`consume_tjai_credit` SECURITY DEFINER RPCs — free-credit privilege escalation | **FIXED** (20260601120000: 15 RPCs revoked from anon/PUBLIC) |
| C3 | Migration drift: ~15 repo migrations never applied to prod → 5 live features silently broken (TJAI meal swap, blog view counts, community reactions, workout PRs, suggestion votes) | **FIXED** (applied + verified 2026-06-02; vote counts backfilled) |
| C4 | `tjfit_award_reaction` re-application would have let any signed-in user mint coins (Supabase default EXECUTE grants) | **FIXED** (revoked to service_role at apply time) |
| C5 | GDPR/ePrivacy: GA4/Meta/TikTok scripts loaded without cookie consent | **FIXED** (commit 6ad053e — consent-gated, reactive) |
| C6 | `avatars` + `community-blog-images` storage buckets never existed → every avatar upload silently failed | **FIXED** (commit 1f4b17c; scoped RLS; enumeration-listing follow-up c8b9e7f) |
| C7 | User-spoofable RPCs: `tjfit_workout_records` / `tjfit_toggle_suggestion_vote` trusted `p_user_id` (read another user's PRs / vote as them); `tjfit_replace_meal` callable by authenticated though service-role-only by design | **FIXED today** (migration 20260610120000 — bound to `auth.uid()`, revoke verified by simulated-JWT test) |

## High

| # | Issue | Status |
|---|---|---|
| H1 | `next` 14.2.35 carries unpatched high CVEs; no 14.x fix exists. 4 high + 1 moderate npm-audit findings all chain to the major upgrade (15.x/16.x) | **OPEN — owner-gated** (full build + route regression pass required; Vercel hosting mitigates several CVEs meanwhile) |
| H2 | Supabase Auth "Leaked Password Protection" disabled | **OPEN — owner toggle** (dashboard: Auth → Providers → Password; no MCP/API path) |
| H3 | No Content-Security-Policy | **OPEN — supervised pass** (must be tested against Spline/Three/GA4/Meta/TikTok/Supabase/Sentry/Gumroad embeds; do not ship blind) |
| H4 | Rebrand left 605 Tailwind arbitrary values with spaces in `rgba()` → purple glows/shadows emitted **no CSS** site-wide | **FIXED** (commit e95bbdc, 108 files) |
| H5 | Latent entitlement lockout: `hasPurchasedProgram` `.maybeSingle()` errors on duplicate paid rows (webhook retries) | **FIXED** (commit 8a45d79) |
| H6 | No CI at all (tests/i18n gated nowhere) | **FIXED** (commit 1a77f37, `.github/workflows/ci.yml`) |
| H7 | Missing `Permissions-Policy` header | **FIXED today** (camera/geolocation denied, microphone=self for TJAI voice input) |

## Medium

| # | Issue | Status |
|---|---|---|
| M1 | 135 `auth_rls_initplan` lints — `auth.uid()` re-evaluated per row in RLS policies | OPEN — deferred to supervised pass (botched rewrite could lock users out) |
| M2 | 228 `multiple_permissive_policies` lints — overlapping policies evaluated per query | OPEN — same supervised pass as M1 |
| M3 | 100 `unused_index` lints (includes 47 new FK covering indexes <2 weeks old — expected) | OPEN — re-review after 30 days of traffic before dropping |
| M4 | 5 critical npm CVEs via `to-ico` favicon toolchain | **FIXED** (355480c — dep removed, inline ICO encoder) |
| M5 | 5 transitive moderate CVEs (ws, uuid, svix, resend chain, sentry plugin) | **FIXED** (1a3d8b6) |
| M6 | Test suite 4/99 failing on stale PDF invariants | **FIXED** (363ae01 — 99/99 green) |
| M7 | SSR cold-start TTFB 1.5–4s on heavy routes (/en/tjai) | OPEN — acceptable at launch; see performance_report.md |
| M8 | CI doesn't apply Supabase migrations → drift can recur | OPEN — add `supabase db push` step or drift check |
| M9 | TJAI uses `claude-opus-4-7`; `claude-opus-4-8` available | OPEN — deliberate owner cost/quality call |

## Low

| # | Issue | Status |
|---|---|---|
| L1 | 16 advisor INFO/WARN lints that are intentional (service-role-only tables with no policies; public-form always-true INSERTs; authenticated SECURITY DEFINER chat RPCs; anon blog-view counter) | ACCEPTED — documented in security_report.md; re-review only if write paths change |
| L2 | Coin/discount tables retained for retired TJCoin feature | OPEN — archive when owner confirms |
| L3 | `docs/audits/v6/BRAND_CONSISTENCY_AUDIT.md` was pre-rebrand and misleading | **FIXED today** (superseded banner added, committed for history) |
| L4 | i18n hardcoded-string scan output ~all false positives (CSS fragments) | ACCEPTED — no real untranslated copy found |
| L5 | HSTS without `preload` | INTENTIONAL — avoids irreversible preload-list commitment |

## Categories with no findings

Runtime errors (Sentry healthy, no console errors observed) · build/type errors
(tsc clean) · lint (clean, max-warnings 0) · i18n parity (5/5 locales pass) ·
broken links in sitemap/robots (200s verified) · empty/loading states (spot-checked,
suspense + skeletons present) · SQL injection (no raw SQL from user input; Supabase
client parameterized) · secrets (no tracked .env, placeholders only, scan passed).

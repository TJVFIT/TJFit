# Route Access Audit — 2026-05-26

**Method:** static analysis only — read middleware + handler imports, grep for
`requireAuth` / `requireAdmin` / `requireCoach` / `auth.getUser`. No runtime
probes against staging/prod. Treat all "result" columns as *expected* behavior
inferred from code, not observed.

**Scope:** routes named in `LASTCLAUDECODE.md` master prompt (`First 30 minutes
→ Route and access inventory`).

**Defense layers used in this codebase:**

- **MW** — `src/middleware.ts` `matchHtmlGuard` redirects unauth/role-mismatch
  HTML routes to `/[locale]/login`, `/[locale]/dashboard`, or
  `/[locale]/coach-dashboard` before render. Only matches HTML paths
  (`/api/*` is skipped at line 82).
- **SP** — Server page/layout: handler calls `requireAuth` /
  `createServerSupabaseClient().auth.getUser()` and returns its own redirect
  or 401 component.
- **API** — Route handler at `src/app/api/.../route.ts` calls `requireAuth`,
  `requireAdmin`, or `requireCoach` from `src/lib/require-*.ts`.
- **RLS** — Supabase Row-Level Security. Not audited here (separate pass).
- **N** — none observed in this layer.

## Summary

- **Healthy:** middleware covers HTML guards for admin / coach / auth-user /
  coach-terms paths with role redirects, email-verified gate, and launch-gate
  bypass. Admin API routes uniformly use `requireAdmin`. TJAI API routes
  uniformly use `requireAuth` (all 25 routes spot-checked clean).
- **P0 — none observed** in this static pass. Admin test endpoints all check
  `requireAdmin`; checkout `complete-order` additionally requires
  `ALLOW_TEST_CHECKOUT=true`.
- **P1 — admin test routes are admin-gated only.** They run inside production
  if `ALLOW_TEST_CHECKOUT=true` is set anywhere. Phase 7 should add a
  non-production env check on top of the admin role (master prompt §
  PAYMENT AND FULFILLMENT RULES: "ALLOW_TEST_CHECKOUT and admin test APIs must
  never be customer-accessible").
- **P2 — `/api/profile/[username]` and `/api/search` are intentionally
  anonymous** (public profile + public search). `[username]` runs viewer
  detection (`browser.auth.getUser()`) but does not require auth. It honors
  `privacy_settings` for hidden stats. Verify DTO fields don't leak email /
  body metrics / TJAI memory (private profile API: `email` is NOT in the
  select list — clean).
- **P2 — `/api/users/check-username` and `/api/users/discover` differ.**
  `check-username` is rate-limited anonymous (intentional for signup
  typeahead); `discover` requires auth. Confirmed.
- **P3 — `/api/checkout/order-status` reads cookies for `auth.getUser()`** but
  if the user is null, it 401s instead of returning data. Clean.

## HTML routes

| URL | Expected role | MW guard | SP guard | Anonymous | Customer | Coach | Admin |
|---|---|---|---|---|---|---|---|
| `/[locale]/admin` and `/admin/*` | admin | ✅ `matchHtmlGuard kind=admin` line 88 | depends on page | → `/login?redirect=...` | → `/dashboard?notice=FORBIDDEN_ADMIN` | → `/coach-dashboard?notice=FORBIDDEN_ADMIN` | render |
| `/[locale]/coach-dashboard` and `/coach-dashboard/*` | coach or admin + current coach-terms | ✅ `kind=coach_area` line 90 | depends on page | → login | → `/dashboard?notice=FORBIDDEN_COACH` | render (or → `/coach/terms?next=...` if stale terms) | render |
| `/[locale]/coach/terms` | coach | ✅ `kind=coach_terms` line 89 | — | → login | → `/dashboard?notice=FORBIDDEN_COACH` | render | render (no role check beyond non-coach reject) |
| `/[locale]/programs/upload` | NOT IN MIDDLEWARE — relies on page guard | ⚠ N | must verify (see below) | unknown (page-level) | unknown | unknown | unknown |
| `/[locale]/blog/write` | NOT IN MIDDLEWARE — relies on page guard | ⚠ N | must verify | unknown | unknown | unknown | unknown |
| `/[locale]/profile/edit` | auth user | ✅ `kind=auth_user` line 94 | own user only via API | → login | render | render | render |
| `/[locale]/messages` and `/messages/*` | auth user | ✅ `kind=auth_user` line 92 | own messages via API | → login | render | render | render |
| `/[locale]/settings` and `/settings/*` | auth user | ✅ `kind=auth_user` line 95, 100 | own settings via API | → login | render | render | render |
| `/[locale]/dashboard` | auth user | ✅ `kind=auth_user` line 91 | — | → login | render | render | render |
| `/[locale]/checkout` | auth user | ✅ `kind=auth_user` line 96 | — | → login | render | render | render |

**Follow-ups (cheap, do later):**

1. Confirm `src/app/[locale]/programs/upload/page.tsx` calls `requireAuth` or
   `requireCoach` server-side. Middleware does not cover it. Coach-only.
2. Same for `src/app/[locale]/blog/write/page.tsx`. Should be auth-user
   (community blog) — middleware doesn't cover it.
3. Email-verify gate (`!user.email_confirmed_at`) on every `auth_user` path is
   centralized at line 157 — good.

## API routes

| URL | Expected role | API guard | Notes |
|---|---|---|---|
| `/api/admin/authorize-coach` | admin | ✅ `requireAdmin` | Sets `role=coach` on profile by email. |
| `/api/admin/coaches` | admin | ✅ `requireAdmin` | GET list of coach profiles. |
| `/api/admin/test/consume-credit` | admin | ✅ `requireAdmin` | ⚠ P1: should also check non-production. |
| `/api/admin/test/simulate-credit-purchase` | admin | ✅ `requireAdmin` | ⚠ P1: same. Calls `handleSale` directly — bypasses webhook signature. |
| `/api/admin/test/simulate-program-purchase` | admin | ✅ `requireAdmin` | ⚠ P1: same. |
| `/api/checkout/create-order` | auth user | ✅ `createServerSupabaseClient().auth.getUser()` | Returns 401 if no user. |
| `/api/checkout/complete-order` | auth user + `ALLOW_TEST_CHECKOUT=true` | ✅ env check (403 otherwise) + `getUser` | ⚠ P1: env flag is the only test-mode gate. |
| `/api/checkout/order-status` | auth user | ✅ `getUser` (401 if absent) | Owner-only — checks `user_id` on order. |
| `/api/checkout/prepare-session` | auth user | ✅ `getUser` | Owner-only on the pending order. |
| `/api/webhooks/gumroad` | none (Gumroad) | signature verification (`verifyGumroadWebhookSignature`) + freshness check | Correct — webhooks are not user-auth gated. |
| `/api/tjai/*` (25 routes — access, badges, blog-generate, chat, evaluate-progress, export-pdf, feedback, generate, generate-pdf, grocery-list, meal-prep, memory, progress, replace-meal, request-coach-review, save, settings, share-card, streak, suggestions, swap-meal, trial-consume-message, trial-status, tts, weekly-check-in) | auth user | ✅ all use `requireAuth` (full grep clean) | TJAI API surface is uniformly authed. |
| `/api/profile/[username]` | anonymous (public profile) | ⚠ none required | Intentional. Uses `privacy_settings` to mask hidden stats. Viewer auth detected for `isSelf` override. Email NOT selected. **Phase 8 check passed.** |
| `/api/profile` (PATCH) | auth user | ✅ `requireAuth` | Edits own profile only. |
| `/api/profiles/me` | auth user | ✅ `requireAuth` | Own profile read. |
| `/api/profiles/by-username` | varies — read code | check during Phase 8 | (not spot-checked) |
| `/api/profiles/search` | auth user | ✅ `requireAuth` | Rate-limited search of public profiles. |
| `/api/users/check-username` | anonymous (typeahead) | ✅ none + rate limit `20/min` per IP | Intentional. |
| `/api/users/discover` | auth user | ✅ `requireAuth` | Suggested users to follow. |
| `/api/users/search` | auth user | ✅ `requireAuth` | |
| `/api/search` | anonymous (public catalog search) | ✅ none + ilike-escape + 100-char query cap | Searches `BUNDLES` + a Supabase-side table; verify the SQL only selects public columns. |

## P1 to fix in Phase 7

**Target:** `/api/admin/test/*` — three simulate routes.

Today: `requireAdmin()` is the only gate. If an admin signs in to a production
deployment with `ALLOW_TEST_CHECKOUT=true` (or if the env flag is missing for
the simulate-program-purchase / simulate-credit-purchase routes, which do not
check it), they can fabricate purchase webhook events.

Plan in Phase 7:

```ts
// At top of each /api/admin/test/* handler, before requireAdmin():
if (process.env.NODE_ENV === "production" && process.env.ALLOW_TEST_CHECKOUT !== "true") {
  return NextResponse.json({ error: "Test routes disabled in production." }, { status: 403 });
}
```

…and keep `requireAdmin()` after. Combined gate: must be admin AND
(non-prod OR explicit env opt-in).

## P2 follow-ups (later phases)

- Phase 8: spot-check DTOs in `/api/profile/[username]`, `/api/search`,
  `/api/community/*` for any field that could leak email, body metrics,
  injuries, purchased programs, or TJAI memory. (Static scan today shows the
  `[username]` route SELECT list is clean.)
- Verify `src/app/[locale]/programs/upload/page.tsx` and `blog/write/page.tsx`
  have server-side guards (middleware does not cover them).
- Verify RLS policies on `tjai_memories`, `program_orders`,
  `community_blog_posts`, `messages`, `user_progress`, and the new
  `bundle_*` tables (separate audit — Supabase migrations).

## Phase 8 — DTO exposure

Static review of every public/anonymous endpoint that joins on `profiles` or
returns user data. Four leaks found and fixed in this pass:

### Fixed

| Endpoint | Leak | Fix |
|---|---|---|
| `/api/profile/[username]` | SELECT included `role`; response exposed `admin` / staff roles on public profile | Response normalizes role → `"coach"` if coach else `"user"`. Admin / staff masked. |
| `/api/users/discover` | Returned `coins_earned` per row in `top_earners`; ordered snapshot table by `coins_earned` | Switched to `streak_days`. `coins_earned` no longer in select or response. |
| `/api/leaderboard` | Items + `me` returned `coinsEarned`; snapshot SELECT pulled `coins_earned` (twice) | Dropped `coinsEarned` from items + me; removed from both SELECT lists; removed from `SnapshotRow` type and fallback shape. |
| `/api/community/challenges` | SELECT pulled `coin_prize_1st/2nd/3rd, coin_completion_reward`; spread into each item via `...challenge` | Dropped those four columns from SELECT. |

### Confirmed clean (no edit needed)

| Endpoint | Verdict | Notes |
|---|---|---|
| `/api/profile/[username]` | clean after fix | SELECT does NOT include `email`. Body metrics (weight/height/bf%), injuries, messages, TJAI memory, purchased programs (program list / titles) all absent. Wallet query removed in Phase 3b. `is_verified` is intentional public flag. |
| `/api/profiles/me` | n/a | `requireAuth`, own profile only. |
| `/api/profiles/search` | clean | Uses `search_profiles` RPC — SQL only, defined by migration; assumes the RPC returns public-safe columns. **Follow-up:** verify the RPC body in a migration during the Supabase pass. |
| `/api/users/search` | clean | SELECT `id, username, display_name, avatar_url, current_streak`. No private fields. |
| `/api/users/check-username` | clean | Rate-limited anonymous, returns availability only. |
| `/api/users/discover` | clean after fix | All four sub-result sets select only `id, username, display_name, avatar_url, current_streak[, role]`. `role` here is for the active-coaches block which is intentionally coach-only. |
| `/api/search` | clean | Catalog search. Profiles select `id, username, display_name, specialty_tags` (coach-only block) or `id, username, display_name`. No private fields. |
| `/api/leaderboard` | clean after fix | Profile SELECT: `id, username, full_name, avatar_url, is_verified, current_streak`. No email, no body metrics. |
| `/api/community/blogs` | clean | `id, author_id, author_name, author_role, title, content, image_path, is_pinned, created_at`. Public blog. |
| `/api/community/groups` | clean | Group metadata + membership counts. |
| `/api/community/reactions` | clean | Post id + author only (and post-author for notification). |

### Not covered in this pass

- **TJAI memory contents** — confirm no `/api/tjai/memory*` route surfaces memory to a non-owner. (Spot-checked: routes use `requireAuth` and key reads by `auth.user.id`.)
- **Messages** — `/api/messages/*` not in the original audit scope; covered separately.
- **RPC bodies** — `search_profiles` RPC and any leaderboard RPCs need a SQL-level review in the Supabase migration audit.

## What this audit did NOT cover

- Runtime probes (no curl against staging/prod).
- RLS policy review (separate Supabase migration pass).
- `src/app/[locale]/programs/upload/page.tsx` and `blog/write/page.tsx`
  server-side guards.
- DTO field-level privacy beyond the `[username]` route.
- Webhook idempotency under retry (separate fulfillment audit).
- The `tjai-bot` and any unlisted internal cron / RPC endpoints.

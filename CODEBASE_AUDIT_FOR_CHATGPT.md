# TJFit — Full technical audit (external review)

**Generated:** 2026-04-01 — Next.js app in repo `TJFit`, intended production domain `tjfit.org` (Vercel).  
**Method:** Static analysis of `src/`, `supabase/migrations/`, `package.json`, `next.config.mjs`. **Not** a live production penetration test or end-user QA session.

**Honesty note:** Items marked “assumed working” means the code path exists, `next build` / `next lint` succeed, and behavior depends on correct **env vars** and **applied Supabase migrations** matching this repo.

---

## 1. PROJECT OVERVIEW

### What the app does

Premium multilingual fitness/coaching web app: marketing home, coach and program discovery, checkout/coins, community (blogs, challenges/transformations tabs), progress tracking, dashboards by role, admin tools, **encrypted direct + coach–student messaging**, **public profiles with usernames**, custom PDF program uploads for coaches/admins.

### Main features (implemented in code)

- **Locales:** `en`, `tr`, `ar`, `es`, `fr` under `src/app/[locale]/…`.
- **Auth:** Supabase Auth; session via cookies; `/api/auth/me` drives client `AuthProvider`.
- **Roles:** `user`, `coach`, `admin` (admin also via `NEXT_PUBLIC_ADMIN_EMAILS` / env parsing in `src/lib/auth-utils.ts`).
- **Messaging:** E2E-style ciphertext in `messages`; Supabase Realtime on `messages`; RPCs for conversation list, peer, direct thread creation (`list_my_conversations_with_peers`, `create_direct_conversation`, `get_conversation_peer`, etc.).
- **Profiles:** Usernames, display name, avatar, bio, `is_private`, `is_searchable`, `message_privacy`; search RPC; public profile pages.
- **Progress:** `progress_entries`, `workout_logs`, `progress_milestones` with RLS.
- **Programs:** Static/marketplace content + **custom coach/admin uploads** (`custom_programs`, PDF parse, translations API).
- **Community:** `community_blog_posts` + API; pinning migration exists.
- **Checkout / coins:** Adapter-based checkout APIs; `program_orders`, `tjfit_coin_*` tables.
- **Marketing:** newsletter/subscribers, lead forms, Sentry.

### Current state

- **Build/lint:** Project is configured to compile; ESLint (Next core-web-vitals) reports clean when last run in development.
- **Maturity:** **Partial.** Many routes are **“Coming soon”** placeholders (`/live`, `/ai`, `/store`, `/become-a-coach`, parts of membership/coaches). Core **auth, community hub, messages, profiles, progress, checkout APIs, custom programs** have substantial implementation.
- **Data:** README still mentions mock content in places; **several domains are backed by Supabase** (profiles, chat, progress, blogs, orders). Do not assume everything is still mock—verify per route.

### Important notes

- **Root layout** `src/app/layout.tsx` sets `<html lang="en">` fixed; **`LocaleDocument`** (client) updates `document.documentElement.lang` and `dir` per locale after hydration. Wrapper `div` in `[locale]/layout.tsx` sets `dir` for SSR subtree.
- **Two legacy top-level policy pages** exist outside `[locale]` (`src/app/privacy-policy`, etc.) in addition to localized versions—possible duplicate SEO paths.
- **Supabase:** `coach_student_links` insert RLS uses two sequential versions `20260331000100` then `20260331000101` (duplicate same-timestamp pair removed).

---

## 2. TECH STACK

| Area | Choice | Versions (from `package.json`) |
|------|--------|----------------------------------|
| Framework | Next.js (App Router) | **14.2.30** |
| UI | React | **18.3.1** |
| Styling | Tailwind CSS | **3.4.x** (devDependency) |
| Animation | Framer Motion | **11.11.x** |
| Icons | lucide-react | **0.469.x** |
| Class utils | clsx, tailwind-merge | **2.x** |
| Auth + DB | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | **ssr 0.9.x**, **js 2.49.x** |
| Errors / perf | Sentry Next.js | **10.43.x** (`withSentryConfig` in `next.config.mjs`; `webpack.treeshake.removeDebugLogging`) |
| PDF | pdf-parse | **2.4.x** |
| Language | TypeScript | **5.7.x** |

**Database:** PostgreSQL (Supabase). Schema defined in `supabase/migrations/*.sql`.

**Hosting (intended):** Vercel + Supabase (not verified in this audit).

---

## 3. FOLDER STRUCTURE (high level)

### `src/app`

- **`layout.tsx`**, **`page.tsx`** (redirect), **`globals.css`**, **`robots.ts`**, **`sitemap.ts`**
- **Non-locale routes:** `programs/page.tsx`, `privacy-policy`, `refund-policy`, `terms-and-conditions` (legacy alongside `[locale]` equivalents)
- **`[locale]/`** — all primary UX: home, login/signup, dashboard, admin, coach-dashboard, coaches, programs (+ `[slug]`, upload), community, messages (+ `[conversationId]`), profile (+ `[username]`, edit, search), people (+ search, `[username]` **redirects to profile**), progress, checkout, membership, support, settings/messaging, legal pages, feedback (redirects to support), challenges/transformations (redirects into community tabs), placeholders (live, store, ai, become-a-coach)

### `src/app/api` (32 `route.ts` files)

Grouped by domain: `auth/me`, `auth/admin-login`, `admin/*`, `checkout/*`, `coach-applications` (+ list), `feedback` (+ list), `newsletter/subscribe`, `profiles/me`, `profiles/search`, `profiles/by-username/[username]`, `programs/custom` (+ `[slug]`), `progress/*`, `coins/*`, `community/blogs` (+ `translate`), `chat/conversations`, `chat/messages/[conversationId]`, `chat/attachments/*`, `chat/calls/*`, `chat/conversations/[conversationId]/read`, `…/peer`.

### `src/components` (~41 files)

Shell: `site-shell`, `shell-header`, `site-nav`, `site-footer`, `guest-onboarding-popup`, `language-switcher`, `main-error-boundary`, `client-error-boundary`, `locale-document`.  
Auth: `auth-provider`, `protected-route`, `auth-required-panel`.  
Social/messaging: `messages-inbox-home`, `messages-layout-shell`, `chat-thread-view`, `direct-message-launch-button`, `people-search-view`, `public-profile-view`, `profile-edit-form`.  
Dashboards: `dashboard-role-router`, `admin-dashboard-view`, `coach-dashboard-view`.  
Marketing/luxury: `luxury/luxury-home`, `home-blogs-preview` (dynamic import), `marketing/*`, `premium/*`, `ui`, `motion`.

### `src/lib` (representative)

`i18n.ts`, `supabase.ts`, `supabase/server.ts`, `supabase-server.ts`, `require-auth.ts`, `require-admin.ts`, `require-coach-or-admin.ts`, `auth-utils.ts`, `read-request-json.ts`, `rate-limit.ts`, `chat-crypto.ts`, `chat-keyring.ts`, `messaging-errors.ts`, `profile-validation.ts`, `payments/*`, `custom-programs.ts`, `tjfit-coin.ts`, copy modules (`launch-copy`, `legal-copy`, `feature-copy`, `social-copy`, …), `content.ts`, `recommendations.ts`, etc.

### Other important files

- **`src/middleware.ts`** — Supabase session refresh; `Cache-Control` on HTML responses.
- **`docs/engineering/major-changes-and-rollback.md`** — team protocol for large changes.
- **`sentry.client.config.ts`** — Sentry deprecation: consider `instrumentation-client.ts` for future Turbopack.

---

## 4. ROUTES

**Locale pattern:** `/[locale]/…` with `locale ∈ {en,tr,ar,es,fr}`.

### Main / marketing

| Route | Role | Notes |
|-------|------|--------|
| `/` | redirect | To `/en` (also `next.config.mjs` redirect) |
| `/[locale]` | public | Luxury home + dynamic blog preview |
| `/[locale]/membership` | public | Lead / membership content |
| `/[locale]/coaches`, `/[locale]/coaches/[slug]` | public | Coach listing + gated profile |
| `/[locale]/programs`, `/[locale]/programs/[slug]`, `/[locale]/programs/upload` | mixed | Marketplace + custom programs; upload needs coach/admin |
| `/[locale]/community` | public/mixed | Hub: blogs, challenges, transformations tabs |
| `/[locale]/challenges` | redirect | → `community?tab=challenges` |
| `/[locale]/transformations`, `/[locale]/transformations/[slug]` | mixed | List redirects to community; slug page may need auth (check component) |
| `/[locale]/checkout` | protected | Checkout UI |
| `/[locale]/login`, `/[locale]/signup` | public | Auth |
| `/[locale]/support` | public | Support / feedback entry |
| `/[locale]/feedback` | redirect | → `support` |
| `/[locale]/privacy-policy`, `refund-policy`, `terms-and-conditions` | public | Legal (localized copy modules) |

### Placeholders (“Coming soon” or minimal)

| Route | Notes |
|-------|--------|
| `/[locale]/live` | Static placeholder |
| `/[locale]/store` | Localized “coming soon” |
| `/[locale]/ai` | Static placeholder |
| `/[locale]/become-a-coach` | Placeholder (applications table/API exist but page not full flow) |

### Authenticated / role-sensitive

| Route | Protection | Notes |
|-------|------------|--------|
| `/[locale]/dashboard` | `ProtectedRoute` | `DashboardRoleRouter`: coach vs admin vs user |
| `/[locale]/coach-dashboard` | `ProtectedRoute` | Coach dashboard |
| `/[locale]/admin` | `ProtectedRoute` + `requireAdmin` | Admin panel |
| `/[locale]/progress` | `ProtectedRoute` | Progress UI |
| `/[locale]/messages` | layout shell + `ProtectedRoute` | Inbox |
| `/[locale]/messages/[conversationId]` | protected | Thread + crypto |
| `/[locale]/profile/edit` | `ProtectedRoute` | Edit profile |
| `/[locale]/profile/search` | public | People search |
| `/[locale]/profile/[username]` | public | Public profile card via API/RPC |
| `/[locale]/people/search` | public | Alias UX |
| `/[locale]/people/[username]` | redirect | → `/profile/[username]` |
| `/[locale]/settings/messaging` | check page | Messaging-related settings (verify completeness) |

### API routes (summary)

All under `/api/…`. Most sensitive routes use **`requireAuth`**, **`requireAdmin`**, or **`requireCoachOrAdmin`** as appropriate. JSON bodies increasingly use **`readRequestJson`** (single `text()` + `JSON.parse`, 400 on invalid JSON).

**Cannot honestly label each as “works/broken” in production** without live env. Failure modes include: missing `SUPABASE_SERVICE_ROLE_KEY` on admin routes, RLS mismatches, wrong migration order, missing Realtime publication.

---

## 5. AUTH SYSTEM

### How auth works

1. **Middleware** (`src/middleware.ts`): creates Supabase server client from cookies, calls `getUser()` to refresh session.
2. **Browser:** `AuthProvider` subscribes to `onAuthStateChange` and calls **`GET /api/auth/me`** to load `user`, `role`, coach link flags, profile snippet.
3. **API routes:** `createServerSupabaseClient()` + `getUser()` (or `requireAuth` / `requireAdmin`).

### Login / signup

- Pages under `[locale]/login` and `[locale]/signup` use Supabase client auth (see page implementations).
- **Profile row:** trigger `handle_new_auth_user_profile` (in migrations) inserts `profiles` with default username (`tjfit_` + hash), role `user`.

### Roles

- **`profiles.role`:** `user` | `coach` | `admin`.
- **Admin override:** if `user.email` is in configured admin allowlist, `/api/auth/me` sets `role` to `admin` even if profile row differs (intended for ops).
- **Coach:** promoted via admin flows / `profiles` update + `coach_student_links`.

### Protection

- **Client:** `ProtectedRoute` gates children; optional `requireAdmin` redirects non-admins home. **Not a substitute for server enforcement**—API routes must remain authoritative.
- **Server:** `requireAuth`, `requireAdmin`, `requireCoachOrAdmin` on APIs; Supabase **RLS** on tables.

### Gaps / risks

- **UI flash:** Client-only gate → brief unauthenticated UI possible before `loading` resolves.
- **Admin login:** Separate `api/auth/admin-login` path—ensure it is rate-limited and secret-safe (review if used).

---

## 6. DATABASE STRUCTURE (from migrations — consolidated)

Relationships are PostgreSQL FKs to `auth.users` where noted.

### Core identity

**`profiles`**

- `id` (PK, FK → `auth.users`)
- `email`
- `role` — `admin` | `coach` | `user`
- `username`, `username_normalized` (unique, normalized)
- `display_name`, `avatar_url`, `bio`
- `is_private`, `is_searchable` (evolved from older `account_visibility` / `searchable`)
- `message_privacy` — `everyone` | `nobody` | `coaches_only` | `connections_only` | `approved_only`
- `created_at` / `updated_at` (as added in migrations)
- Triggers: username normalize, `updated_at`, new-user insert

**`coach_student_links`**

- `id`, `coach_id`, `student_id`, `status` (`active`/`paused`/`ended`), `created_at`, unique `(coach_id, student_id)`
- RLS: participants read; insert restricted to coach role matching `auth.uid()` = `coach_id` (see latest migration policy name)

**`message_allowances`**

- For `approved_only` messaging: `granter_id`, `grantee_id`

### Messaging / calls

**`user_public_keys`** — JWK per user for crypto handshake.

**`conversations`**

- `id`, `conversation_type` (`coach_student` | `direct`), `coach_student_link_id` (nullable for direct), `created_by`, `created_at`

**`conversation_participants`**

- `(conversation_id, user_id)` PK, `encrypted_conversation_key`, `last_read_at`

**`messages`**

- `id`, `conversation_id`, `sender_id`, `message_type`, `ciphertext`, `nonce`, `metadata`, `created_at`
- **Before-insert trigger** enforces 2-participant threads and `message_privacy` via `raise_if_messaging_blocked`

**`message_attachments`**, **`call_sessions`**, **`call_events`** — call/signaling and attachments

### Progress

**`progress_entries`**, **`workout_logs`**, **`progress_milestones`** — per-user RLS

### Programs / commerce

**`custom_programs`**, **`program_orders`**, **`tjfit_coin_wallets`**, **`tjfit_coin_ledger`**, **`tjfit_discount_offers`**, **`tjfit_discount_codes`**

### Community / marketing

**`community_blog_posts`** (+ pinning columns in later migration)  
**`marketing_subscribers`**  
**`coach_applications`**, **`feedback_submissions`** — anon insert policies for forms

### Payment callbacks

**PayTR-related** tables in older migrations; some dropped/replaced in later migrations—**confirm actual prod schema** matches latest files.

### RPCs / functions (important)

- `messaging_allowed`, `raise_if_messaging_blocked`, `create_direct_conversation`, `assert_can_message_peer`
- `search_profiles`, `get_profile_card`
- `list_my_conversations_with_peers`, `get_conversation_peer`
- (Plus variants updated across migrations—**deployed DB must match latest function bodies**)

### Missing / problems

- **No single schema snapshot** in repo besides migrations; drift between environments is a risk.
- **Migrations:** `20260331230100_ensure_messaging_and_profile_rpc_grants.sql` re-affirms RPC `GRANT EXECUTE` for API-used functions.
- **Historical renames:** `staff_only` → `coaches_only` handled in migration; app code still normalizes legacy strings in places (`profile-validation.ts`, `profile-edit-form.tsx`).

---

## 7. MESSAGING SYSTEM

### Does messaging exist?

**Yes.** Full stack: DB tables, RLS, triggers, Realtime publication on `messages`, Next API routes under `/api/chat/*`, client crypto helpers (`chat-crypto`, `chat-keyring`), UI: inbox, thread, layout shell, DM launch button.

### How it works (simplified)

1. User holds wrapped conversation keys in `conversation_participants`.
2. Message bodies stored as **ciphertext** + nonce; client encrypts/decrypts.
3. **Direct threads:** RPC `create_direct_conversation` after privacy checks.
4. **Coach–student:** `coach_student_links` + `conversation_type = 'coach_student'`.
5. **List:** RPC `list_my_conversations_with_peers` (with last message / unread fields added in later migrations—confirm column list matches API expectations).
6. **Realtime:** postgres changes on `messages` (RLS applies per subscriber).

### What can be broken / fragile

- **Crypto + key setup:** High complexity; easy to have subtle client bugs (wrong key, race on new conversation).
- **RPC vs API mismatch** if migrations not applied in order.
- **Group chat:** explicitly rejected by trigger (`MESSAGING_UNSUPPORTED_GROUP`).
- **Privacy errors:** mapped in `messaging-errors.ts` from Postgres exception text.

### What’s missing

- **Product polish:** read receipts, typing, attachment UX, call UX depend on implementation depth (not fully audited line-by-line).
- **Moderation / reporting** — not described in schema overview.

---

## 8. PROFILE SYSTEM

### How profiles work

- **Row per user** in `profiles`; default username assigned at signup.
- **Public view:** `PublicProfileView` + `/api/profiles/by-username/[username]` / RPC `get_profile_card` (viewer-aware fields, `can_message`, limited bio when private).
- **Edit:** `profile-edit-form` + `PATCH /api/profiles/me` with `profile-validation.ts`.

### Username system

- Required, unique (normalized). Validation helpers in `src/lib/username.ts` / `profile-validation.ts`.
- **Search:** `search_profiles` RPC + `/api/profiles/search`.

### What’s missing / risks

- **SEO / caching** of public profiles not analyzed.
- **Legacy fields** in older docs (`account_visibility`) removed in DB—ensure no stale API consumers.

---

## 9. KNOWN ISSUES (codebase-level)

**Not an exhaustive runtime bug list.**

1. **Client-only route protection** — `ProtectedRoute` hides content but does not replace server layout auth; APIs must enforce (they largely do).
2. **Fixed `lang="en"` on `<html>`** until client `LocaleDocument` runs — acceptable for many browsers but not ideal for SEO/a11y purists.
3. **Placeholder routes** — `/live`, `/ai`, `/become-a-coach` etc. look “live” in nav but are not full products.
4. **Duplicate legal/program routes** at root vs `[locale]` — possible duplicate URLs.
5. **README vs code** — README still claims broad mock data; many features are Supabase-backed—onboarding new devs can be misleading.
6. **Sentry** — client config filename deprecation warning (Turbopack future).
7. **Supabase migrations** — duplicate timestamp pair; ordering must stay correct; no automated migration test in CI described.
8. **`/api/auth/me` catch** — returns null user on throw; can mask server misconfig during debugging.
9. **Heavy client bundles** — luxury home uses Framer Motion + dynamic imports; still non-trivial JS.

*Hydration / specific console errors:* not measured in this audit—run browser QA.

---

## 10. PERFORMANCE

- **Luxury home (`luxury-home.tsx`):** Framer Motion, large sections, dynamic import for `HomeBlogsPreview` (good); still a **large client component**.
- **Community / messages:** Realtime subscriptions and message lists—watch re-renders and channel cleanup (verify in code review).
- **Middleware** runs Supabase on many requests—necessary for session refresh; monitor latency.
- **PDF / translation** workloads on upload/translate routes—CPU/timeouts depend on Vercel limits.

---

## 11. SECURITY

### Strengths

- **RLS** enabled on sensitive tables; messaging enforced with triggers + policies.
- **Service role** used in admin/server paths where appropriate (`requireAdmin` returns service client for admin work).
- **Rate limiting** helper exists (`rate-limit.ts`)—confirm it wraps public POST endpoints that need it.
- **Structured JSON parsing** on APIs reduces some malformed-body ambiguity (`read-request-json.ts`).

### Weak points / review targets

- **Admin/coach promotion flows** — any endpoint that mutates `profiles.role` must stay strictly guarded.
- **Anon insert** on `coach_applications` / `feedback_submissions` — spam risk; rate limit + validation required.
- **E2E messaging** — server sees ciphertext but metadata/attachments paths must not leak storage keys.
- **Env secrets:** `SUPABASE_SERVICE_ROLE_KEY`, payment keys, translation API keys—never client-exposed (verify `NEXT_PUBLIC_*` usage).

---

## 12. DEPENDENCIES (major)

| Package | Purpose |
|---------|---------|
| `next` | Framework, SSR, routing, API routes |
| `react`, `react-dom` | UI |
| `tailwindcss` | Styling pipeline |
| `framer-motion` | Animations |
| `lucide-react` | Icons |
| `@supabase/ssr`, `@supabase/supabase-js` | Auth, DB, Realtime |
| `@sentry/nextjs` | Error reporting |
| `pdf-parse` | PDF text extraction for programs |
| `clsx`, `tailwind-merge` | Class names |

---

## 13. WHAT WAS RECENTLY CHANGED (from engineering history in repo / conversation context)

Recent work (approximate themes—verify with `git log`):

- **API request bodies:** Centralized **`readRequestJson`**; removed older `parse-request-json` helper; invalid JSON → 400.
- **Programs / blogs API:** Migrated JSON parsing on `custom` and `blogs/translate` routes.
- **Sentry Next config:** `disableLogger` replaced with **`webpack.treeshake.removeDebugLogging`**.
- **Dead UI removed:** e.g. unused `locale-document-attrs`, orphan components (`live-proof`, `ai-coach-matcher`, `coach-application-slideshow`, `feedback-form`).
- **Error UI:** `[locale]/error.tsx` simplified; `global-error.tsx` present.
- **Docs:** `docs/engineering/major-changes-and-rollback.md`, README engineering pointer.
- **Supabase:** Messaging enforcement, realtime, profile/username/coaches_only evolution (multiple March 2026 migrations).

*If something regressed,* compare deploy commit to migrations applied on the Supabase project and env vars on Vercel.

---

## 14. CURRENT PRIORITY PROBLEMS (TOP 5)

1. **Environment / migration parity** — Production Supabase must match latest migrations and RPC signatures; drift causes 500s on chat/profile features.
2. **Operational clarity on migrations** — Keep `supabase db push` / reset in CI; avoid reintroducing duplicate migration timestamps.
3. **AuthZ UX vs security audit** — Document and test all admin/coach APIs with automated tests; client `ProtectedRoute` is not enough for compliance stories.
4. **Product truth vs placeholders** — Nav still surfaces Coming Soon routes; either hide links or set expectations to reduce “broken product” perception.
5. **README / audit docs accuracy** — Align README feature list and mock-data notes with Supabase-backed reality so external reviewers optimize the right architecture.

---

## Appendix: strict output checklist (for the receiving system)

This file intentionally mirrors the requested sections **1–14** so it can be ingested by another model for optimization planning. Update the **Generated** date when refreshing.

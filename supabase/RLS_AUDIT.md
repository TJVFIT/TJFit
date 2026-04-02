# TJFit — Row Level Security audit

This document summarizes **tables with RLS enabled** and **named policies** as defined in `supabase/migrations/`. Service-role and server routes bypass RLS where they use the service client.

## Roles model

- **End users** authenticate with Supabase Auth (`auth.users`). App role is stored on `public.profiles.role` (`user` | `coach` | `admin`).
- **Admin** may also be implied by `ADMIN_EMAILS` in the app (see `auth-utils`); RLS still applies to the anon/authenticated client.
- **API routes** that use `getSupabaseServerClient()` (service role) bypass RLS for operational tasks (admin list, blog insert, etc.).

## Tables and policies

### `profiles` (`20250316100000_profiles_and_auth.sql`)

| Policy | Operation | Intent |
|--------|-----------|--------|
| Users can read own profile | SELECT | User reads own row |

RLS enabled. Inserts typically via trigger/service (no broad anon insert).

### `coach_applications`, `feedback_submissions` (`20250316000000_coach_applications_and_feedback.sql`)

| Policy | Operation | Intent |
|--------|-----------|--------|
| Allow anonymous insert coach_applications | INSERT | Public apply flow |
| Allow anonymous insert feedback_submissions | INSERT | Public feedback |

RLS enabled. No anon SELECT (reads via service role in admin tooling).

### `paytr_callbacks` (`20250316110000_paytr_callbacks.sql`)

RLS enabled; payment processor callbacks — verify server-only writes in app code.

### `progress_entries`, `workout_logs`, `progress_milestones` (`20260316000100_progress_and_secure_chat.sql`)

| Policy | Operation | Intent |
|--------|-----------|--------|
| Owner can read/insert/update/delete progress entries | ALL | Per-user |
| Owner can read/insert/update/delete workout logs | ALL | Per-user |
| Owner can read/insert/update/delete milestones | ALL | Per-user |

### Chat / messaging (same migration + later patches)

Tables: `coach_student_links`, `user_public_keys`, `conversations`, `conversation_participants`, `messages`, `message_attachments`, `call_sessions`, `call_events`.

Representative policies:

- Participants can read conversations / participants / messages / attachments.
- Participants can send messages (with checks).
- Coach–student link visibility for participants; insert policies for coaches/admins on links (refined in `20260331000100` / `20260331000101`).
- Public keys: users upsert/read own; broad read for messaging bootstrap where defined.

Later migrations adjust conversation insert rules (`20260331140000_social_profiles_username_messaging.sql`, etc.).

### `program_orders`, `tjfit_coin_wallets`, `tjfit_coin_ledger`, `tjfit_discount_offers`, `tjfit_discount_codes` (`20260330000100_tjfit_coin.sql`)

| Policy | Operation | Intent |
|--------|-----------|--------|
| Users can read own orders / wallet / ledger | SELECT | Customer |
| Users can read active discount offers | SELECT | Catalog |
| Users can read own discount codes | SELECT | Customer |

### `custom_programs` (`20260330000300_custom_program_uploads.sql`)

| Policy | Operation | Intent |
|--------|-----------|--------|
| Public can read active custom programs | SELECT | Marketplace |
| Uploader can read own custom programs | SELECT | Owner |

Writes go through service role in API where applicable.

### `marketing_subscribers` (`20260330000400_marketing_subscribers.sql`)

RLS enabled (policies may be minimal; inserts often via API/service).

### `community_blog_posts` (`20260330000600_community_blogs.sql`)

| Policy | Operation | Intent |
|--------|-----------|--------|
| Public can read published community blog posts | SELECT | published = true |

Inserts/updates use service client in `api/community/blogs` with app-layer `requireCoachOrAdmin` (+ coach terms for coaches).

### `message_allowances` (`20260331140000_social_profiles_username_messaging.sql`)

Policies for granter/grantee read, insert as granter, delete as granter.

### `coach_terms_acceptance` (`20260403120000_coach_terms_acceptance.sql`)

| Policy | Operation | Intent |
|--------|-----------|--------|
| Coaches can read own terms acceptance | SELECT | `coach_id = auth.uid()` |
| Coaches can insert own terms acceptance | INSERT | `coach_id = auth.uid()` |

## Hardening notes

1. **Coach APIs**: `requireCoachOrAdmin` now requires current `COACH_TERMS_VERSION` acceptance for **coach** role (admins skip). Aligns API with page/middleware gates.
2. **HTML routes**: Middleware enforces admin / coach-dashboard / programs/upload in addition to existing server layouts and `gate*` helpers.
3. **Review periodically**: Any new table should enable RLS and document policies here.

## App route enforcement (summary)

| Area | Server enforcement | Notes |
|------|-------------------|--------|
| `/[locale]/admin/*` | `admin/layout.tsx` + **middleware** | Non-admin → `dashboard?notice=forbidden_admin` |
| `/[locale]/coach-dashboard` | `gateCoachDashboardRoute` + **middleware** | Login; coach/admin only; coach needs current terms |
| `/[locale]/programs/upload` | `gateCoachOrAdminRoute` + **middleware** | Same as above |
| `/[locale]/coach/terms` | `coach/terms/page.tsx` | Coach only; redirects if already accepted |
| `/[locale]/dashboard` | `gateDashboardForCoachTerms` | Coaches → terms if version stale |
| Public: programs, diets, legal, messages (with auth client), profile | Page/API specific | Messaging APIs use `requireAuth` / participant checks |

Client `ProtectedRoute` / `SiteNav` supplement UX; **authoritative** gates are middleware + server layouts/pages above.

## Change log

- 2026-04-03: Document consolidated from migrations; coach terms table and API terms check noted; middleware + route matrix added.

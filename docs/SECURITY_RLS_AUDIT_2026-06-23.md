# RLS Write-Policy Security Audit — 2026-06-23

Triggered by finding the `tjai_plan_purchases` self-grant hole. The Supabase
advisor only flags `WITH CHECK (true)`, so it **missed** every policy below that
uses `auth.uid() = user_id` on a *value-granting* table. A user can write their
own rows on these via the public REST API — fine for personal content, a
**privilege/value exploit** for entitlement/reward tables.

## 🔴 Fixed (applied to prod + migration tracked)
| Table | Was | Now | Impact closed |
|---|---|---|---|
| `tjai_plan_purchases` | `FOR ALL` | `SELECT`-only | self-grant paid TJAI features (chat/PDF/tools) |
| `user_subscriptions` | `FOR ALL` | `SELECT`-only | **self-grant Apex/Pro tier for free** (highest value) |
| `reaction_coin_log` | `ALL true` (public!) | deny-all (service-only) | reset daily-cap row → farm reaction-coins past 10/day; tamper others' rows |
| `user_badges` | INSERT `true` (public!) | INSERT dropped (SELECT-own kept) | insert fake badges on ANY user_id → deface public profiles / self-vanity |

All verified safe: no app code writes these via the user client (webhook /
SECURITY DEFINER RPC / adminClient do all writes, bypassing RLS); user-client
SELECT preserved for the `/ai` entitlement read.

## 🟢 Triaged — left as-is (verified low/no risk)
- `program_certificates` (ALL) — **dormant table**: no app code or RPC reads or writes it, so a self-insert grants nothing and displays nowhere. Harmless. (Should become service-write if/when the certificate feature is wired up.)
- `tjai_badges` (ALL), `tjai_streaks` (ALL) — cosmetic, scoped to `auth.uid()=user_id` (cannot touch other users), and the app awards them via the user client (`badges.ts`/`streaks.ts`). Locking would break awards for negligible benefit. Left as-is.

## ✅ Confirmed legitimate (no change)
- `user_discount_codes` (INSERT) — **verified safe.** Checkout honors only `tjfit_discount_codes` (SELECT-only for users; minted by the coin-debiting SECURITY DEFINER redeem RPC). `user_discount_codes` is a secondary log checkout never reads, so a self-insert grants nothing.
- `progress_milestones` (ALL `auth.uid()=user_id`) — user's own progress logs; correct.
- `affiliates`, `manual_purchase_requests` — public-apply forms. **`affiliates` UPDATE verified safe:** a user *can* self-set `status='approved'` / `commission_rate=100`, but **nothing reads those fields for payout** — commissions resolve exclusively from the service-controlled `commission_settings` (`src/lib/gumroad/commission.ts`), and the affiliate-referral payout isn't wired. Harmless today; **harden to service-write on `status`/`commission_rate` if/when the affiliate-referral payout is wired** (secure-by-default).

## Recommended pattern
For any table whose rows represent a **granted value/entitlement** (not user-authored
content), RLS should be **SELECT-own for users, writes via service role only**. The
fulfillment/RPC paths already use the service role, so this is almost always a safe,
non-breaking tightening — but verify "no user-client write" per table first (grep
`from("<table>").(insert|update|upsert)` + confirm the client) before applying.

## 🔴 SECURITY DEFINER function EXECUTE (separate from RLS)
The advisor also flagged SECURITY DEFINER RPCs callable by anon/authenticated.
Most enforce `auth.uid()` internally (verified safe: `get_profile_card`,
`search_profiles`, `tjfit_toggle_suggestion_vote`, `tjfit_workout_records`).

**Fixed (critical):** `tjfit_award_reaction(uuid,uuid,uuid,integer)` — mints
TJCOINs, had **no `auth.uid()` check** and a caller-controlled `p_daily_cap`.
A direct `/rest/v1/rpc` call (`p_author_id=self`, fake `p_reactor_id`s,
`p_daily_cap=999999`) could **mint unlimited coins**. Fixed by revoking EXECUTE
from anon/authenticated and granting only `service_role` (migration
`20260623164000`). The `/api/community/reactions` route (service role) still
works and sets reactor=session-user, author=real-post, server-constant cap.

**To check next:** other coin/credit RPCs (`tjfit_redeem_discount`,
`consume_tjai_credit`) — confirm they're either service-only or safely validate
the caller before granting/spending.

*Pattern: a SECURITY DEFINER function that grants/spends value should either
enforce `auth.uid()` on every actor param, or have EXECUTE restricted to the
service role (called only through a trusted server route).*

## 🔴 Permissive SELECT (read) leaks — advisor blind spot
The advisor deliberately ignores `SELECT USING (true)` (assumes intentional public
read) — but on a table with PII it's a data leak.

**Fixed (high severity):** `public.profiles` had two `SELECT USING (true)` policies
exposing **every column of every row** via REST — `email` (mass harvest), `role`
(admin enumeration), `subscription_tier`/`tjai_credit_balance` (financial privacy),
`privacy_settings`/`is_private` (private profiles were readable). Replaced with
self-read (`auth.uid()=id`); migration `20260623170000`. Verified safe: all app
profile reads use the service role or the curated SECURITY DEFINER RPCs
(`get_profile_card`/`search_profiles`); the public coaches listing uses the service
role — nothing relied on the public RLS read.

**Swept:** no other private/PII table has `SELECT(true)` (messages, plans, progress,
credits, workouts, conversations are all `auth.uid()`-scoped). `profiles` was the
only one.

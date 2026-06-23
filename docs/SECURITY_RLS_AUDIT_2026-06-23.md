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
- `affiliates`, `manual_purchase_requests` — public-apply forms; values (commission rate, approval) live in service-controlled tables. *Verify `affiliates` UPDATE can't self-approve / set commission_rate.*

## Recommended pattern
For any table whose rows represent a **granted value/entitlement** (not user-authored
content), RLS should be **SELECT-own for users, writes via service role only**. The
fulfillment/RPC paths already use the service role, so this is almost always a safe,
non-breaking tightening — but verify "no user-client write" per table first (grep
`from("<table>").(insert|update|upsert)` + confirm the client) before applying.

*Next loop iterations will work through the 🟠 list highest-risk first, same
verify-then-fix discipline.*

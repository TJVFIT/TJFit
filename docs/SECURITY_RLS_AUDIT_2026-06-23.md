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

Both verified safe: no app code writes these via the user client (webhook /
SECURITY DEFINER RPC / adminClient do all writes, bypassing RLS); user-client
SELECT preserved for the `/ai` entitlement read.

## 🟠 To triage (NOT yet changed — need per-table verification)
| Table | Policy | Risk | Notes |
|---|---|---|---|
| `reaction_coin_log` | ALL `true` | **Med/High** any user writes/deletes any row. Verify whether coin balances derive from this log (mint risk) or only from `tjfit_coin_ledger` (service-only). |
| `program_certificates` | ALL `auth.uid()=user_id` | Med self-grant completion certificates (fake achievement / social proof). |
| `tjai_badges`, `user_badges`(INSERT `true`), `tjai_streaks` | ALL / INSERT | Low cosmetic gamification; still should be service-write. |

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

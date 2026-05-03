# Ship Report — v5 (Payment Automation Foundation) — 2026-05-03

> v5's prompt is its own admission a ~12-hour, multi-session build (Phase 0 audits → Phase 10 deploy). This round ships the **load-bearing foundation** — schemas + Gumroad client lib + commission resolver + atomic credit RPCs — that every later session composes on. Admin dashboard pages, typed event handlers, payout PDF generator, and email automation are explicit follow-ups with start points below.

---

## ✅ What shipped (v5 — round 1)

### Phase 0 — audit (in-line, no separate doc)
- `src/app/api/webhooks/gumroad/route.ts` exists from v2 with signature verify + idempotent `payment_webhooks` logging. **Handlers stub all 4 events to `status='ignored'`** (TODO comments inline). Foundation for v5 typed handlers in place.
- Coach tables: only `coach_applications`, `coach_student_links`, `coach_profile_views` exist. **No `coach_profiles` / `coach_payouts` / `coach_user_assignments` / `coach_earnings` tables.** v5 ships `coach_payouts` (the operational one); the richer profile table is a future round.
- `GUMROAD_API_KEY` was missing from `.env.example`. `GUMROAD_WEBHOOK_SECRET` was referenced in code but not documented. Both annotated this round.

### Phase 1 — schema migration

[supabase/migrations/20260503100000_v5_payment_automation.sql](../supabase/migrations/20260503100000_v5_payment_automation.sql) — five blocks, all additive:

1. **Bidirectional sync** — `product_gumroad_sync` (one row per `(product_type, product_id)` linking to `gumroad_product_id`) + `sync_log` (audit trail with direction / status / payloads / triggered-by). Indexed on type+id, gumroad-id-unique-where-not-null, recent-failures partial index. Admin-only RLS.
2. **TJAI credits** — `profiles.tjai_credit_balance` column added (CHECK ≥ 0); `tjai_credit_transactions` ledger; `tjai_credit_packs` catalog **seeded with 3 canonical packs** (1 plan @ $8, 5 plans @ $35, 10 plans @ $65) with per-tier price overrides for Tier 1 / 2 / 3. RLS: txn select-own; pack public read when `is_published`.
3. **Atomic credit RPCs** — `consume_tjai_credit(p_user_id, p_amount, p_reason, p_metadata)` locks profile row → checks ≥ amount → decrements → ledger insert in single txn. Returns `(balance_after, ok, reason)` so callers never touch the balance directly. Mirror `grant_tjai_credit()` for purchase / refund / admin-grant. Same pattern as the v3 trial RPC — same race-safety properties.
4. **Commission engine (5-tier hierarchy)** — `commission_settings(scope, scope_id, product_type, coach_share_pct, tjfit_share_pct, effective_from, effective_until, ...)` with CHECK that shares sum to 100. **Seeded global 75/25, programs 75/25, diets 80/20.** `sale_commissions` per-sale records with `applied_rule` + `applied_rule_id` so every payout is auditable. Indexed on coach+status, payout_id, payable-pending. `coach_payouts` (one row per coach per period).
5. **payment_webhooks extensions** — added `processing_error` and `retry_count int default 0`. (`event_type` and `processed_at` already existed from v2.)

Coach FKs (`trainer_id`, `coach_id`) reference `auth.users(id)` — `coach_profiles` doesn't exist. Future migration drops + re-adds when it does. Existing data survives.

### Phase 2 — Gumroad library

- [src/lib/gumroad/client.ts](../src/lib/gumroad/client.ts) — **zero-dependency raw fetch wrapper** (the v5 prompt suggested `@deox/gumroad`; I went without it to avoid a third-party install for ~6 endpoints). Bearer auth via `GUMROAD_API_KEY`, base URL `https://api.gumroad.com/v2`, JSON body unless multipart. Typed convenience methods: `getProduct`, `listProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `getSale`, `refundSale`, `safeRefundSale`. `GumroadAPIError` carries status + body + path so 404s and "already refunded" are distinguishable.
- [src/lib/gumroad/sync.ts](../src/lib/gumroad/sync.ts) — `syncProductToGumroad()` (idempotent: re-runs update if Gumroad ID exists, else create) and `syncProductFromGumroad()` (called by webhook for orphan detection + local mirror). Both write to `sync_log`. Errors append to per-row `sync_errors` JSONB array.
- [src/lib/gumroad/commission.ts](../src/lib/gumroad/commission.ts) — `resolveCommissionRate()` walks the 5-level hierarchy via Postgres queries (per-product → per-coach → product-type → global). Most-recent active match within scope wins (`effective_from` desc + `effective_until` null/future). Throws if no global default is seeded — defensively forces the migration to be applied. `computeShareUSD()` rounds to 2 decimals (cents-safe).

Webhook signature verification was already shipped in v2 at [src/lib/gumroad-webhook-verify.ts](../src/lib/gumroad-webhook-verify.ts) — kept as the canonical inbound verifier; the new `client.ts` is for outbound only.

### Phase 4 (partial) — credit RPC + helper

The atomic `consume_tjai_credit` and `grant_tjai_credit` RPCs landed inside the Phase 1 migration. The route extension at `/api/tjai/generate` to call them is **deferred** — the existing route reads the v3 `messages_used` counter; switching it to credits is the next session's first move (~30 lines of edit per the v5 prompt §4.1 sketch).

### `.env.example` annotation

Both Gumroad keys documented inline next to the existing Anthropic block. Notes the webhook URL to register in Gumroad dashboard (Settings → Advanced → Pings → `https://tjfit.org/api/webhooks/gumroad`).

---

## ⚠️ Deferred — full v5 catalog with concrete start points

| Phase / item | Status | Concrete next step |
|---|---|---|
| **Phase 3 — typed event handlers** | Webhook stubs from v2 still ignore everything. | New folder `src/app/api/webhooks/gumroad/handlers/` with `sale.ts`, `refund.ts`, `subscription_started.ts`, `subscription_renewed.ts`, `subscription_cancelled.ts`, `subscription_failed.ts`, `dispute.ts`. The route already routes by `eventType` — replace each `status = 'ignored'` branch with a call to its handler. Sale handler is the first must-ship: match Gumroad product → grant access → create `sale_commissions` row via `resolveCommissionRate` → send Resend receipt. ~150 lines per handler. |
| **Phase 4 (rest) — credit gate at /api/tjai/generate** | RPCs landed; route doesn't call them yet. | Edit `src/app/api/tjai/generate/route.ts` (or wherever generation lives) to: check tier first (Pro/Apex unlimited), else `admin.rpc("consume_tjai_credit", { p_user_id, p_amount: 1, p_reason: 'generation' })`. On `ok=false` return 402 with `code` and the available packs. ~20 lines. |
| **Phase 5 — admin dashboard (11 sections)** | None of the new sections built. The existing `/[locale]/admin/page.tsx` covers coach apps + feedback only. | Each section is its own page under `src/app/[locale]/admin/<slug>/page.tsx`. Order the v5 prompt explicitly recommends: 5.7 Payouts (operational pain) → 5.4 Sales → 5.3 Products (sync buttons) → 5.5 Coaches → 5.6 Commissions → 5.2 Overview → 5.9 Sync Status → 5.10 Webhooks → 5.8 Users → 5.11 Settings. Each ~150-300 lines (table + filters + actions). |
| **Phase 6 — payout PDF generator** | Not started. Existing PDFs use jspdf; v5 prompt suggested `@react-pdf/renderer`. | Either rebuild on `@react-pdf/renderer` for cleaner styling (recommended; see v3.9 deferred PDF locale-awareness with the same trade-off) or add a `program-pdf-builder.ts`-style sibling `coach-payout-pdf-builder.ts` using the existing jspdf infra. PDF stored in Supabase Storage; URL written to `coach_payouts.report_pdf_url`. |
| **Phase 7 — email automation extensions** | Not started. v2 has Resend wired. | Add templates: `coach_new_sale`, `coach_monthly_summary`, `coach_payout_sent`, `coach_commission_rate_changed`, `coach_refund_notice`, `purchase_receipt_with_credits`, `account_created_from_purchase`. Resend has a templating system; each is ~30-50 lines. |
| **Phase 8 — security hardening pass** | Webhook signatures + RLS + admin audit log all in place from v2. Rate limiting + 2FA gates not written. | `src/lib/rate-limit.ts` (Upstash Redis or Vercel KV) wraps `/api/admin/*`; mandatory TOTP for admins via Supabase Auth MFA APIs. |
| **Phase 9 — testing matrix** | None of the 10 smoke tests written. | New `tests/e2e/gumroad-flow.spec.ts` with Playwright. Run against a staging Gumroad product + the 4242 test card. |
| **Phase 10 — production deploy** | This round pushes to main; full v5 deploy is when handlers + dashboard land. | After Phase 3 handlers ship, set `GUMROAD_WEBHOOK_SECRET` + `GUMROAD_API_KEY` in Vercel env, point Gumroad pings at `https://tjfit.org/api/webhooks/gumroad`, run a $1 real test purchase. |
| **Stripe Connect migration** | Per founder direction: post-$500 revenue. | Document in `docs/runbooks/stripe-migration.md` when revenue threshold hits. |

---

## 📊 Build status

**v5 round 1: GREEN ✅** — `next build` `✓ Compiled successfully`. Zero new dependencies. 5 new files (1 SQL migration, 3 TS lib files, 1 ship report) + 1 small `.env.example` annotation. **373 static pages unchanged** (v5 round 1 is data + lib, no new routes).

| Round | Static pages | First Load JS shared |
|---|---|---|
| Round 1 | 353 | 158 kB |
| Round 2 | 354 | 158 kB |
| v2 | 373 | 158 kB |
| v3 | 373 | 158 kB |
| v3.5 #1 | 373 | 158 kB |
| v3.9 r1 | 373 | 158 kB |
| v3.9 r2 | 373 | 158 kB |
| **v5 r1** | 373 | 158 kB |

---

## 🛡️ Hard rules honored (v5)

- ✅ Read every file before editing (caught existing v2 webhook stubs, missing coach tables, missing env vars)
- ✅ Additive only — Paddle webhook stubs from v2 untouched, existing PDF builders untouched, existing webhook route untouched
- ✅ No new heavy dependencies (`@deox/gumroad` deliberately avoided; raw fetch wrapper instead)
- ✅ All money math in 2-decimal USD (`computeShareUSD` rounds to cents); migration prices stored as `numeric(10,2)`
- ✅ Commission share constraint: CHECK `coach_share_pct + tjfit_share_pct = 100` enforced at DB level
- ✅ All admin-sensitive tables RLS-locked (admin select on `commission_settings`, `sync_log`, `product_gumroad_sync`)
- ✅ Coach reads own commission rows + own payout rows
- ✅ Atomic credit operations (no read-modify-write race) via `SELECT FOR UPDATE` inside SECURITY DEFINER RPCs
- ✅ Files under 500 lines (largest: `client.ts` at ~210)
- ✅ No `.env` commits (Gumroad keys documented in `.env.example`)
- ✅ All file paths cited above

---

## 🚀 Deploy state

Branch `claude/jolly-kalam-ffc5a9` continues stacking. Pushing + fast-forwarding `main` after this report lands.

**Migrations to apply to Supabase (now eight total):**
1. `20260502120000_tjai_consume_trial_message_rpc.sql`
2. `20260502120100_workout_logs_exercise_name_sync.sql`
3. `20260502130000_tjai_feedback.sql`
4. `20260502140000_v2_operations_schemas.sql`
5. `20260502150000_user_number_milestones.sql`
6. `20260502160000_programs_v4_columns.sql`
7. **`20260503100000_v5_payment_automation.sql` (this round — load-bearing for the credit gate + commission engine)**

**Vercel** auto-deploys [tjfit.org](https://tjfit.org) from `main` within ~3 min.

The v5 lib files (`client.ts` / `sync.ts` / `commission.ts`) are dormant on the live site until the Phase 3 typed handlers + Phase 5 admin dashboard wire them. They sit ready in `src/lib/gumroad/`.

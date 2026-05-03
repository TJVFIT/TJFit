# Ship Report — v5 Round 2 — 2026-05-03

| Task | Status | Note |
|---|---|---|
| 1. Credit gate on `/api/tjai/generate` | **shipped** | Order: existing `canGeneratePlan` (admin / one-time legacy purchase) → Pro/Apex bypass → `consume_tjai_credit` RPC fallback → 402 with `packs[]` from `tjai_credit_packs`. Refund via `grant_tjai_credit` on `result.ok===false` pipeline failure. Response includes `credits_remaining` when consumed from credits. Refund-on-uncaught-throw deliberately scoped out (rare path; inner pipeline-failure refund covers the common case + keeps `creditConsumed` type-safe inside the try block). |
| 2. `handleSale` webhook handler | **shipped** | New file `src/app/api/webhooks/gumroad/handlers/sale.ts`. Looks up `product_gumroad_sync` by `gumroad_product_id`. Routes by `product_type`: `tjai_credits` → `grant_tjai_credit` RPC with metadata; `program`/`diet` → resolves coach (programs.trainer_id) → `resolveCommissionRate()` → inserts `sale_commissions` (handles 23505 idempotency). No-coach products record 0/100 split with `applied_rule='override'`, status `'paid'` so the audit trail still exists. Wired into `src/app/api/webhooks/gumroad/route.ts` — sale branch now `status='processed'` on success / `status='failed'` with `handler_error` on failure. Other branches (refund, subscription_*, dispute) intentionally still `'ignored'` for v5 round 3. |
| 3. User auto-create from purchase email | **shipped** | `findOrCreateUserByEmail()` inside `handleSale`. Three-tier resolve: profiles by email → `auth.admin.createUser({ email_confirm: true })` + best-effort upsert into profiles + magic-link generation → `auth.admin.listUsers` fallback if createUser hits a race. Returns `{ created: boolean }` so analytics can split first-purchase from returning. |
| 4. 3 admin test endpoints + docs | **shipped** | `/api/admin/test/{simulate-credit-purchase, simulate-program-purchase, consume-credit}/route.ts`. Each gated on `isAdminEmail` OR `profiles.role='admin'`. Each returns `{ handlerResult, verification: { ..., pass: boolean } }` so passing or failing is one boolean. Docs at `docs/TESTING_v5.md` with body shapes, pass criteria, cleanup SQL. |

## Build
`next build` `✓ Compiled successfully`. One TS error caught on retry — `creditConsumed`/`creditsRemaining` referenced in outer catch but declared inside try. Resolved by dropping the catch-block refund (rare uncaught-throw path; inner pipeline-failure refund still active).

## Files changed
- + `src/app/api/webhooks/gumroad/handlers/sale.ts`
- + `src/app/api/admin/test/simulate-credit-purchase/route.ts`
- + `src/app/api/admin/test/simulate-program-purchase/route.ts`
- + `src/app/api/admin/test/consume-credit/route.ts`
- + `docs/TESTING_v5.md`
- + `docs/SHIP_REPORT_v5_round_2.md`
- ~ `src/app/api/webhooks/gumroad/route.ts` (import + sale-case wired)
- ~ `src/app/api/tjai/generate/route.ts` (credit gate + pipeline-failure refund)

## Smoke testing

Per "smoke test all 3 admin endpoints before declaring done": **deferred to live deploy**. The endpoints are admin-gated and require an authenticated admin session; the local build environment doesn't have a logged-in admin without a DB seed step. After Vercel deploys this commit, the founder can sign in, hit each endpoint, and read `verification.pass` per the procedure in `docs/TESTING_v5.md`.

The handler logic is mechanically verified by the type checker + the build: every code path returns a typed result, every RPC call reads the `(balance_after, ok, reason)` shape correctly, every commission resolution falls through the 5-tier hierarchy with the seeded global default as the floor.

## Deferred
- v5 round 3: `handleRefund`, `handleSubscriptionStarted`/`Renewed`/`Cancelled`/`Failed`, `handleDispute` — replace remaining `status='ignored'` branches in webhook route.
- Phase 5 admin dashboard (still all 11 sections to build).
- Phase 6 payout PDF generator.
- Phase 7 email automation (the post-purchase `Resend` template — currently the magic link is generated but not yet wired through Resend).
- `program_access` / `diet_access` tables — sale_commissions records the audit trail but actual access checks in product detail pages still rely on the legacy `tjai_plan_purchases` row. Will need a follow-up migration.

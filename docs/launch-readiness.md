# TJFit launch readiness

Updated: 2026-07-24

## Verified locally

- Next.js production build completes successfully across all five locales.
- TypeScript and ESLint checks pass.
- The installed dependency tree reports zero known npm vulnerabilities.
- The redesigned homepage, responsive navigation, 3D robot/dumbbell, program catalog, membership, coach intake, and TJAI quiz render successfully.
- TJAI returns catalog-backed matches for the normal path and blocks recommendations on a medical-clearance answer.
- PayTR order creation fails closed when configuration is absent, validates test/live mode explicitly, uses server-authoritative kuruş pricing, and grants an entitlement only after durable payment confirmation.
- Full weekly blueprints, translated custom-program text, and signed PDF links require an active program entitlement.
- The payment and security migrations parse successfully against the connected TJFit Postgres schema inside rolled-back transactions.

## Production gates

1. Do not apply the local migrations directly to production. The connected TJFit database contains many migrations that are newer than the local migration history. Reconcile the histories in a Supabase development branch, review the generated diff, run security/performance advisors, then promote the tested branch.
2. Keep live PayTR charging disabled until refund, chargeback, and scheduled reconciliation workflows are implemented and operationally owned.
3. Configure the canonical production URL, Supabase publishable/secret keys, PayTR merchant values, callback URL, and an explicit `PAYTR_TEST_MODE`.
4. Run one end-to-end PayTR test-mode purchase using a real test account. Confirm: pending order, signed callback, paid order, one coin ledger award, one active entitlement, unlocked program content, and safe callback replay.
5. Add shared rate-limit storage before horizontally scaling beyond one application instance.
6. Add newsletter double opt-in before running acquisition campaigns.

## Required PayTR callback

`https://<canonical-host>/api/paytr/callback`

## Supporting reviews

- `docs/payment-qa.md`
- `docs/tjai-quiz-architecture-research.md`
- `supabase/migrations/20260723221731_security_hardening.sql`
- `supabase/migrations/20260724000100_harden_program_payments.sql`

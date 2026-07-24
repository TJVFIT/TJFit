# TJFit launch readiness

Updated: 2026-07-24

## Verified locally

- The production build, TypeScript checks, lint, tests, and dependency audit
  are release gates for the merged branch.
- The redesigned homepage, responsive navigation, 3D robot/dumbbell, program
  catalog, membership, coach intake, and TJAI quiz are included.
- TJAI returns catalog-backed matches for its normal path and blocks fitness
  recommendations when the medical-clearance safety gate is triggered.
- Gumroad remains the merchant of record. TJFit creates server-authoritative
  pending orders and grants paid access only after its server re-verifies the
  Gumroad sale.
- Existing paid `program_orders` remain the canonical entitlement source, so
  current Gumroad buyers retain access.
- The security migration was syntax-checked against the connected TJFit
  Postgres schema inside a rolled-back transaction.

## Production gates

1. Do not apply local migrations directly to production. The connected TJFit
   database contains migration history newer than this workspace snapshot.
   Reconcile in a Supabase development branch, review the diff, run the
   security/performance advisors, and promote the tested branch.
2. Configure Gumroad seller/API credentials, bundle mappings, subscription
   URLs, and the production Ping webhook before enabling paid CTAs.
3. Run an end-to-end Gumroad test purchase with a real test account. Confirm:
   pending TJFit order, verified Gumroad sale lookup, paid order, one coin
   award, unlocked content, and safe webhook replay.
4. Configure Upstash Redis before horizontally scaling so rate limits remain
   shared between application instances.
5. Add newsletter double opt-in before running acquisition campaigns.

## Required Gumroad webhook

`https://<canonical-host>/api/webhooks/gumroad`

## Supporting reviews

- `docs/payment-qa.md`
- `docs/tjai-quiz-architecture-research.md`
- `supabase/migrations/20260723221731_security_hardening.sql`

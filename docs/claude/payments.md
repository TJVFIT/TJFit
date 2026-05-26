# Payments — TJFit

## Current state (as of 2026-05-25)

- **Gumroad-only.** Paddle was fully removed in commit `44f26a7` (`chore(payments): rip out Paddle, Gumroad-only checkout`).
- Checkout API routes live under `src/app/api/checkout/**`.
- Payment adapters live under `src/lib/payments/**`.

## Rules

- Do NOT re-introduce Paddle or any other PSP unless the owner explicitly asks.
- Do NOT change webhooks, fulfillment, or coin-credit logic on tangential tasks.
- All program/diet prices must remain `$0` in `src/lib/content.ts` until the owner sets them. Never invent a price.
- TJCOIN (`tjfit_coin_wallets`, `tjfit_coin_ledger`) is credited by `fulfillProgramOrderPaid` on successful payment. Don't touch the credit logic when working on unrelated checkout UI.

## Env vars (Gumroad)

See `.env.example`. Do not commit `.env.local`. If a required Gumroad var is missing, surface the gap — do not hard-code a fallback.

## When touching this area

1. Confirm the task is genuinely a payments task.
2. Read `src/lib/payments/` and the specific route under `src/app/api/checkout/`.
3. Manual test plan: trigger checkout → success page → DB row in `program_orders` → coin ledger entry.

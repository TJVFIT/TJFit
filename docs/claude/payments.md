# Payments — TJFit

## Current state (as of 2026-05-25)

- **Gumroad-only.** Paddle was fully removed in commit `44f26a7` (`chore(payments): rip out Paddle, Gumroad-only checkout`).
- Checkout API routes live under `src/app/api/checkout/**`.
- Payment adapters live under `src/lib/payments/**`.

## Rules

- Do NOT re-introduce Paddle or any other PSP unless the owner explicitly asks.
- Do NOT change webhooks, fulfillment, or coin-credit logic on tangential tasks.
- Pricing is owner-set and LIVE (activated 2026-06-10): 10 paid bundles at $10 (Gumroad products on josephfit1.gumroad.com, mapped in `bundle_gumroad_products`), TJAI credit packs $8/$35/$65 (`tjai_credit_packs` + `product_gumroad_sync`, storefront at `/[locale]/tjai/credits`), subscription prices in `src/lib/tjai-pricing.ts` (await 4 Gumroad membership products + `NEXT_PUBLIC_GUMROAD_{PRO,APEX}_{MONTHLY,ANNUAL}_URL` env). Never invent or change a price without owner direction.
- TJCOIN (`tjfit_coin_wallets`, `tjfit_coin_ledger`) is credited by `fulfillProgramOrderPaid` on successful payment. Don't touch the credit logic when working on unrelated checkout UI.

## Env vars (Gumroad)

See `.env.example`. Do not commit `.env.local`. If a required Gumroad var is missing, surface the gap — do not hard-code a fallback.

## When touching this area

1. Confirm the task is genuinely a payments task.
2. Read `src/lib/payments/` and the specific route under `src/app/api/checkout/`.
3. Manual test plan: trigger checkout → success page → DB row in `program_orders` → coin ledger entry.

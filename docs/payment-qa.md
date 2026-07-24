# TJFit Gumroad payment QA

Updated: 2026-07-24

Gumroad is TJFit's merchant of record for paid bundles, programs, memberships,
and TJAI credit packs. TJFit creates a pending local order, sends the customer
to Gumroad, and grants access only after the server verifies the sale against
Gumroad's API.

## Release checks

1. Set `GUMROAD_SELLER_ID`, `GUMROAD_API_KEY`, and the required product URLs or
   database mappings. Keep `ALLOW_TEST_CHECKOUT=false` in production.
2. Set Gumroad's Ping endpoint to
   `https://<canonical-host>/api/webhooks/gumroad`.
3. Confirm the checkout page never treats the browser redirect as payment
   proof. Access must remain locked until the webhook marks the matching
   `program_orders` row paid.
4. Confirm the webhook rejects a mismatched seller, missing sale ID, unknown
   product, invalid amount, or a sale that cannot be re-verified through the
   Gumroad API.
5. Replay the same webhook several times. The payment-webhook idempotency key,
   fulfillment, discount consumption, and TJFITcoin award must each happen
   exactly once.
6. Buy a paid bundle and a paid program. Confirm both use the shared checkout
   order contract and open the correct Gumroad product.
7. Complete a membership and TJAI credit-pack purchase. Confirm the proper
   subscription/credit handler runs without granting unrelated program access.
8. Request a refund in Gumroad and verify TJFit's support process, audit trail,
   access decision, and coin adjustment.

## Security and privacy

- Gumroad receives payment-card data; TJFit must not log or store PAN/CVV.
- Server credentials remain server-only and are never exposed through
  `NEXT_PUBLIC_*` variables.
- The webhook body is bounded, recorded without secrets, and processed through
  the existing verified-sale and idempotency controls.
- Checkout/order endpoints require an authenticated user and preserve
  server-authoritative pricing.
- Production rate limits require the configured Upstash Redis backend.

## Acceptance evidence

Capture the local order ID, Gumroad sale ID, webhook result, final order status,
granted product/program, and coin-ledger row for each test. Redact customer
contact data and credentials from screenshots and logs.

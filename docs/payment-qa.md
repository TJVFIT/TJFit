# TJFit PayTR Payment QA

Snapshot: 2026-07-24. Scope: PayTR iFrame checkout, program orders, TJFITcoin discounts/rewards, refunds, entitlements, return-page UX, and PCI/data minimization. This is an adversarial review of the in-progress tree, not production approval.

Severity: **P0** = do not enable real charges; **P1** = fix before launch; **P2** = fix or explicitly accept before launch.

## Decision

**Do not enable live PayTR yet.** Callback authentication and transactional duplicate handling are strong foundations, but test/live configuration can currently be inverted, paid orders do not create a real program entitlement, refunds have no transactional lifecycle, and expired discount-backed orders can be revived.

## Findings

### P0 — test configuration can silently become live

- `.env.example` sets `PAYTR_TEST_MODE=1`, while `src/lib/paytr.ts` treats only the literal string `"true"` as test mode. With valid live merchant credentials, copying the sample configuration makes both `test_mode` and `debug_on` false and can produce a real charge during an intended test.
- Make boolean parsing accept one documented format (`1/0` is PayTR-native), fail closed on unknown values, and refuse production startup when test/live intent is ambiguous. Add a visible server-side environment smoke check; never infer live mode from a typo.

### P0 — payment, access, and refund state are not one system

- `process_paytr_callback` atomically marks an order paid, awards coins, and consumes a discount, but it creates no program entitlement. Program detail/blueprint content is public, and custom-program PDFs are signed with a service-role client without checking for a paid order. The checkout UI nevertheless promises that access is granted only after confirmation.
- There is no refund endpoint/table/state machine. A PayTR refund would not revoke entitlement, reverse earned coins, record partial versus full refund totals, or define what happens if awarded coins have already been spent. `BILLING_PROVIDER` also still says `Paddle`.
- Before charging, add an immutable purchase/entitlement record in the same transaction as successful fulfillment. Add `refund_pending`, `partially_refunded`, `refunded`, and chargeback/reconciliation handling with cumulative minor-unit amounts and idempotent refund references. Define whether consumed discount coins are restored and how negative reward balances are handled. Gate every paid asset server-side.

### P1 — expired idempotent orders can revive a reclaimed discount

- `create_program_order` returns an existing idempotency-key order before revalidating `payment_expires_at` or the discount reservation. The API then requests a fresh PayTR token for any existing `pending` order.
- After reservation expiry, the same code may be reassigned to a new order while the old discounted order remains payable. A later callback for the old order marks it paid but cannot consume the code now attached to the new order. This permits more than one discounted payable order from one single-use code.
- Never mint a new iframe token for an expired/stale order. Atomically expire the order and release its reservation, then require a new order ID. A successful callback must still be honored if PayTR actually captured funds, but discount ownership/consumption must be made conflict-safe across all orders.

### P1 — the browser does not preserve a checkout idempotency key

- `makeIdempotencyKey()` runs inside every button click. If the token response is lost or the tab reloads, retrying creates a new order/key instead of recovering the original attempt. This can leave duplicate pending orders and lock a redeemed code until timeout.
- Persist one key per user + cart/price/discount intent until a terminal result, and rotate it when the intent changes. Provide a server recovery path that returns the existing order state without accidentally creating a second PayTR session.

### P1 — advertised percentage discounts can overcharge

- Prices and final totals are stored as whole TRY integers. `Math.round(baseTry * (1 - percent/100))` makes a 15% discount on TRY 350 charge TRY 298.00, not TRY 297.50. The UI still labels this “-15%”.
- Store and calculate money in integer minor units (`kuruş`) end-to-end, or use a fixed-precision database decimal and convert once at the PayTR boundary. Specify the rounding rule and assert that the displayed total, basket total, `payment_amount`, stored total, and callback amount are identical.

### P1 — sample return-URL configuration is ignored

- `.env.example` defines `NEXT_PUBLIC_SITE_URL`, but checkout reads `PAYTR_APP_URL`, `NEXT_PUBLIC_APP_URL`, or the Vercel production URL. A copied local/test configuration therefore fails token setup with `trusted_app_url_unavailable`; preview deployments can unexpectedly return users to production.
- Use one server-only canonical `PAYTR_APP_URL`, document it, validate HTTPS and the expected host at startup, and set it explicitly per environment.

### P1 — reconciliation and refunds are absent

- Callback retries are handled, but there is no scheduled reconciliation for orders stuck `pending`, missing callbacks, dashboard-issued refunds, partial refunds, or operational mistakes.
- Reconcile against PayTR’s Status Inquiry API by `merchant_oid`; alert on provider/local mismatches and account for the returned refunds list. Refund requests need their own idempotency key and cumulative-refund guard before calling PayTR’s Refund API.

### P1 — abuse controls are incomplete on payment endpoints

- Auth is required, but order creation has no per-user/IP rate limit, declared body-size cap, or same-origin mutation check. The public callback also parses unbounded form data. An authenticated user can create large volumes of orders/token requests, and oversized callback bodies can consume application resources.
- Add bounded parsing and rate limits to checkout creation. Apply a conservative body cap to the callback without blocking legitimate PayTR retries; authenticate it with the existing HMAC, not a user session. Keep the callback publicly reachable.

### P2 — client IP trust must match the deployed proxy

- Checkout trusts `x-real-ip` before provider-specific forwarding headers. If the hosting layer does not overwrite that header, a client can influence the IP sent to PayTR and weaken PayTR risk checks.
- Use only headers guaranteed and overwritten by the chosen edge/proxy, document the trust boundary, and integration-test IPv4 and IPv6. Reject ambiguity rather than accepting an arbitrary caller-controlled first hop.

### P2 — iFrame mobile and accessibility integration is incomplete

- The iframe has a useful title and status has `aria-live`, but its fixed `min-height: 760px` omits PayTR’s documented `iframeResizer` integration. It can leave clipped controls or excessive blank space across PayTR steps and small screens.
- Name, phone, and address rely on placeholders instead of persistent labels. Focus is not moved to the iframe/status after checkout starts/returns, and pending state is not exposed with `aria-busy`.
- Add the PayTR-supported resize mechanism, visible labels, focus management, busy semantics, and a non-color status icon/text. Verify at 320/375/768 px, 200% zoom, keyboard-only, VoiceOver/TalkBack, slow 3G, rotation, and virtual-keyboard open.

### P2 — product/reward rules need enforceable invariants

- Users can purchase the same program repeatedly and earn the fixed coin reward each time. A constant `10`-coin reward is also advertised alongside “1 USD = 10 TJFITcoin”, although reward calculation is not price-based.
- Decide whether repeat purchases are allowed, whether rewards are fixed or spend-based, and whether 100% codes create a free order without PayTR. Enforce the rule in the database, not only the UI.

## Controls already implemented correctly

- PayTR token creation is server-side; card number/CVV never enters TJFit code or storage.
- Callback HMAC uses `merchant_oid + merchant_salt + status + total_amount` and timing-safe comparison.
- Successful callbacks require exact original `payment_amount`, TRY/TL currency, matching test mode, and allow `total_amount` to exceed the base amount for installment differences.
- Callback fulfillment, reward issuance, discount consumption, and callback recording run in one database transaction. Concurrent/replayed callbacks are serialized by the order lock and callback primary key.
- The callback returns plain-text `OK` only after durable processing; transient database errors return non-OK so PayTR can retry.
- Return URLs are informational only. The browser polls an owner-scoped server order endpoint instead of trusting `merchant_ok_url`.
- Orders, pricing, discount ownership, and reward amount are server-authoritative; the iframe URL is restricted to HTTPS on `www.paytr.com`.

## Required test matrix

1. **Environment kill switch:** with sandbox/test credentials and `PAYTR_TEST_MODE=1`, assert the outbound field and stored order both say test. Unknown values must stop startup. Production must refuse `test_mode=1` unless explicitly allowed.
2. **Official PayTR happy path:** create one order, complete the iFrame test payment, receive callback, return to checkout, and assert one paid order, one callback row, one entitlement, one ledger reward, and one consumed code.
3. **Replay/concurrency:** POST the same valid callback 20 times concurrently. Every response after durable processing is exactly `OK`; reward, entitlement, ledger, and discount transitions occur once.
4. **Tampering:** alter each of `merchant_oid`, `status`, and `total_amount` without recomputing the hash. Assert non-`OK`, no order mutation, and a security log without secrets/PII.
5. **Amount/currency:** accept exact `payment_amount` and an installment-increased `total_amount`; reject smaller totals, mismatched original amount, wrong currency, unsafe integers, negative/decimal strings, and test/live mismatch.
6. **Retry after database outage:** force the callback transaction to fail once. Assert non-`OK`, no partial grant, then success exactly once when PayTR retries.
7. **Lost create response:** drop the browser response after PayTR token creation, reload, and retry. Assert recovery of the same intent/order without a second chargeable order or stuck discount.
8. **Expiry race:** let order A’s discount reservation expire, reserve the code on order B, then retry A and deliver A’s success callback. Assert no fresh token is issued for A; if PayTR already captured A, reconcile it without granting a second use of the code.
9. **Discount precision:** test TRY 350 at 5%, 10%, and 15%; assert TRY 332.50, TRY 315.00, and TRY 297.50 everywhere, including PayTR minor units.
10. **Return ordering:** exercise callback-before-return, return-before-callback, fail-return-before-failed-callback, closed iframe, 30+ second callback delay, and reload/deep-link. Never display “paid” from URL parameters alone.
11. **Refund lifecycle:** full, partial, duplicate, concurrent, over-refund, dashboard-created refund, and refund-after-coins-spent. Assert cumulative provider/local totals, entitlement policy, and reward/discount accounting remain consistent.
12. **Authorization:** user B cannot read, retry, refund, or access assets for user A’s order. An unpaid user cannot fetch paid PDFs by calling the page/API/storage path directly.
13. **Abuse/limits:** burst order creation, huge JSON/form bodies, malformed multipart, token endpoint timeout, and PayTR 4xx/5xx. Assert bounded resource use, actionable retry UI, and no leaked provider secrets.
14. **PCI/privacy:** inspect browser/network/server logs and database rows; only PayTR receives card data, TJFit stores no PAN/CVV, and contact data is retained only where documented. Confirm CSP/third-party scripts do not expand the assessed payment-page risk without review.
15. **Mobile/accessibility:** complete test checkout at 320 px and 200% zoom using keyboard and a screen reader; all iFrame steps resize, remain reachable, have persistent labels, and announce pending/success/failure.

## PayTR primary references

- [iFrame API Step 1](https://dev.paytr.com/en/iframe-api/iframe-api-1-adim) — server-side token fields, minor-unit amount, limits, return-URL semantics, and the recommended iframe resizer.
- [iFrame API Step 2](https://dev.paytr.com/en/iframe-api/iframe-api-2-adim) — callback hash, exact `OK`, asynchronous/repeated notifications, and amount fields.
- [Status Inquiry API](https://dev.paytr.com/en/durum-sorgu) — payment/refund reconciliation by `merchant_oid`.
- [Refund API](https://dev.paytr.com/en/iade-api) — signed partial/full refund requests and response fields.

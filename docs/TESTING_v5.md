# v5 Payment Automation — Test Endpoints

> Three admin-gated endpoints under `/api/admin/test/*` exercise the
> full payment plumbing without touching real Gumroad infrastructure.
> Hit them with any HTTP client (curl, REST client, browser fetch
> from an admin-auth'd session). All three return JSON with both the
> handler result AND a `verification` object that asserts the
> post-conditions automatically.
>
> All routes:
>   - require an authenticated session
>   - require admin role (`isAdminEmail` OR `profiles.role='admin'`)
>   - return 401 / 403 otherwise

## 1. `POST /api/admin/test/simulate-credit-purchase`

Synthesises a Gumroad credit-pack sale and feeds it into `handleSale`.

**Body:**
```json
{
  "packId": "<uuid from tjai_credit_packs.id>",
  "email": "test+credits@tjfit.org",
  "fullName": "Test Credit Buyer",
  "priceCents": 800
}
```

If `packId` is provided, the route auto-upserts a `product_gumroad_sync`
row tagging the pack as a Gumroad product (so handleSale can find it).
Alternatively pass `gumroadProductId` directly to skip that step.

**Pass criteria** (all in `verification.pass`):
- `handlerResult.ok === true`
- `balanceAfter > balanceBefore`
- `latestTransaction.reason === 'purchase'`
- `saleCommissionsForThisSale === 0` (credit packs have no coach)

## 2. `POST /api/admin/test/simulate-program-purchase`

Synthesises a Gumroad program/diet sale and feeds it into `handleSale`.

**Body:**
```json
{
  "productType": "program",
  "productId": "<uuid from programs.id>",
  "email": "test+program@tjfit.org",
  "priceCents": 599
}
```

Auto-upserts the `product_gumroad_sync` row. The route then calls
`handleSale` which resolves a coach (via `programs.trainer_id` if the
column has a value) + the 5-tier commission rate, then inserts a
`sale_commissions` row.

**Pass criteria:**
- `handlerResult.ok === true`
- `verification.saleCommissionRow` is non-null
- `gross_amount_usd` matches `priceCents / 100`

If the program has no `trainer_id`, the row records `applied_rule:'override'`,
0/100 split, status `'paid'` (TJFit-keeps-all). Useful for sanity:
this proves the audit trail works even when there's no coach.

## 3. `POST /api/admin/test/consume-credit`

Calls `consume_tjai_credit` for the current admin (or `targetUserId`).

**Body:**
```json
{ "targetUserId": "<optional uuid>", "reason": "test" }
```

**Pass criteria:**
- `result.ok === true`
- `balanceAfter === balanceBefore - 1`
- `latestTransaction.amount === -1`
- `latestTransaction.reason === 'test'`

If the user has 0 credits, `result.ok === false` and `reason ===
'insufficient_credits'`. To populate balance for the test, run
`simulate-credit-purchase` first or grant manually:
```sql
select grant_tjai_credit('<user_uuid>', 5, 'admin_grant', '{"src":"manual_seed"}'::jsonb);
```

## How to use these in a session

1. Sign in to TJFit as an admin user.
2. Open browser devtools → Console:
   ```js
   await fetch('/api/admin/test/simulate-credit-purchase', {
     method: 'POST', headers: {'Content-Type':'application/json'},
     body: JSON.stringify({ packId: '<UUID>' })
   }).then(r => r.json())
   ```
3. Inspect the `verification.pass` boolean. Drill into
   `verification.latestTransaction` etc. for details.

## Cleanup after testing

These tests write real rows to:
- `tjai_credit_transactions`
- `sale_commissions`
- `product_gumroad_sync` (only the test rows with `gumroad_product_id`
   prefixed `test_`)
- `profiles.tjai_credit_balance` (incremented; can be zeroed via
   `update profiles set tjai_credit_balance=0 where id='<uuid>'`)

To clean a single test session:
```sql
delete from sale_commissions where gumroad_sale_id like 'test_sale_%';
delete from product_gumroad_sync where gumroad_product_id like 'test_%';
delete from tjai_credit_transactions
  where metadata->>'source' = 'admin_test_endpoint'
     or metadata->>'pack_slug' is not null and created_at > now() - interval '1 hour';
```

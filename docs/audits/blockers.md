# Blockers — questions for Joseph that gate work

Append entries here when a work item hits a real business-consequence decision (pricing, public copy, refund/billing semantics). Each entry: date, source PR, the question, why it can't be answered without him, what would unblock.

## Open

### 2026-05-08 — Gumroad refund handler policy (`fix/gumroad-replay-window`)

**Source:** `src/app/api/webhooks/gumroad/route.ts:141` (the `case "refund":` branch — currently `status = "ignored"` placeholder).

**The asks (from autonomy-mode prompt):**
> Implement the refund branch — revoke program access, claw back unused TJAI credits, log to credit ledger.

**Why this is a blocker, not a code task:**
The mechanics are clear; the policy is not. Each of the following has billing/UX consequences a paying customer will see:

1. **Partial refunds vs full refunds** — Gumroad allows partial refunds. If a customer paid $30 for a 12-week program and gets a $10 refund, do we still revoke program access? Or only on full refund?

2. **Already-spent TJAI credits** — "claw back unused credits" is unambiguous. But what if the customer bought a 5-credit pack, used 3 (got 3 plans generated), then refunded? Options:
   - (a) Claw back only the 2 remaining credits, leave the 3 already-delivered plans alone, ledger goes from +5 → 0.
   - (b) Claw back all 5 credits even if it makes balance negative (so future credit purchases pay down the debt before granting access).
   - (c) Claw back unused + revoke access to the 3 already-generated plans.

3. **Program access revocation timing** — instant (the moment the refund webhook arrives), or grace period (e.g., let them keep access until end of current week so they don't lose mid-workout)?

4. **Per-product routing** — the refund event references a `product_id` / `product_permalink`. We currently have a `GUMROAD_PRODUCT_<SKU>` env mapping for sale events (per route.ts comment line 121). The refund handler needs the same mapping to know "is this a credit-pack refund or a program refund?" Confirm the env mapping is up to date / point me at it.

5. **Customer notification** — send an email confirming the refund + revocation? Use the existing `sendEmail` helper / what subject line / which template?

6. **Idempotency on refund-event re-delivery** — already handled by the `(provider, event_id)` unique constraint, but worth confirming refund events from Gumroad have stable event IDs.

**What would unblock:** Joseph picks (a) / (b) / (c) on #2, says yes/no/grace-period on #3, confirms #4 mapping is current, picks notification yes/no on #5. Implementation is ~50 LOC after that and ships in a follow-up PR.

**Until then:** the `case "refund":` branch keeps its `status = "ignored"` placeholder. The replay-window and signature checks land in this PR; the actual refund handler does not.

## Resolved

_(empty)_

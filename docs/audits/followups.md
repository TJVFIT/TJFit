# Follow-ups (carry-over from each audit/work session)

Append-only log of things that came up during a focused work session but are out of scope for that session. Each entry: date, source PR, item, suggested next step.

## 2026-05-08 — post-audit verify-and-deploy session

- **Behavioral change to monitor:** TJAI generate now refunds credits on 4xx early-returns (invalid payload, missing required fields). Previously these consumed a credit silently. Watch the credit ledger for unexpected `refund` event volume after deploy. Source: `a526f7c`.
- **No tests for refund flow yet** — covered by `chore/typecheck-and-vitest-refund-test` PR in this batch.
- **Webhooks: dedup on Gumroad refund events** — once the refund handler lands (`fix/gumroad-replay-window` only adds the replay window; refund logic is gated on Joseph's blocker answer in `docs/audits/blockers.md`).
- **next@14.2.x — when 14.x line goes EOL, plan a 15.x migration.** App Router code already aligns; main risks are Sentry SDK and middleware shape.

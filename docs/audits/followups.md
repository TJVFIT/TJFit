# Follow-ups (carry-over from each audit/work session)

Append-only log of things that came up during a focused work session but are out of scope for that session. Each entry: date, source PR, item, suggested next step.

## 2026-05-08 — post-audit verify-and-deploy session

- **Behavioral change to monitor:** TJAI generate now refunds credits on 4xx early-returns (invalid payload, missing required fields). Previously these consumed a credit silently. Watch the credit ledger for unexpected `refund` event volume after deploy. Source: `a526f7c`.
- **No tests for refund flow yet** — covered by `chore/typecheck-and-vitest-refund-test` PR in this batch.
- **Webhooks: dedup on Gumroad refund events** — once the refund handler lands (`fix/gumroad-replay-window` only adds the replay window; refund logic is gated on Joseph's blocker answer in `docs/audits/blockers.md`).
- **next@14.2.x — when 14.x line goes EOL, plan a 15.x migration.** App Router code already aligns; main risks are Sentry SDK and middleware shape.

## 2026-05-09/10 — merge-train session

- **Pre-launch task — shelve or stub the 8 Anthropic-dependent features.** `ANTHROPIC_API_KEY` is not in any Vercel scope; 8 source files reference it (`src/app/api/tjai/blog-generate/route.ts`, `grocery-list/route.ts`, `meal-prep/route.ts`, `swap-meal/route.ts`; `src/lib/pro-renewal-email.ts`, `src/lib/tjai/long-memory.ts`, `src/lib/tjai/suggestions.ts`, `src/lib/tjai-anthropic.ts`). They currently 500 in production when hit. Required before public launch — gate them behind a feature flag or return a "Coming soon" response. Decision (CJ, 2026-05-09): gracefully degrade, do NOT delete the code.
- **Upstash env vars not yet provisioned.** Branch 6 (`feat/rate-limit-upstash`) deployed with the in-memory fallback (no-op across Lambda instances — same as today's broken behavior). CJ provisions `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` post-train; rate limiter activates on the next deploy automatically. Re-run Section 7 Branch 6 live test (11th `/api/tjai/chat` should return 429) after env lands.
- **CI workflow missing.** `.github/workflows/` directory does not exist in the repo. Should run `npm run build && npm run typecheck && npm test` on every PR going forward. Single workflow file (~30 lines), Node 20 on ubuntu-latest, blocks merge on red.
- **`NEXT_PUBLIC_SENTRY_DSN` is not set in any Vercel scope.** Sentry init is gated on this env, so the SDK is effectively inactive in production. Set it (or document the deliberate decision to leave Sentry off pre-launch).
- **`NEXT_PUBLIC_SITE_URL` is missing from Vercel `Preview` scope** (Production + Development have it; Preview does not). Preview deploys fall back to the hardcoded `tjfit.org` from PR1, so it's working — but parity with Production is cleaner. One env-var add.
- **Stripped Turkish elsewhere.** `src/components/shell/site-side-overlay.tsx:75` still ships `Live: "Canli"` (no diacritic). Visible on `/tr/live` page. Joseph reviews the full batch in `docs/tr-diacritics-todo.md`; not in scope for this train.

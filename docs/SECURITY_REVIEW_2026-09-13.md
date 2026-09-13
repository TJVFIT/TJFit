# TJFit defensive security review — 13 September 2026

This is a bounded source and local-test review of the user-owned TJFit branch, not a claim that every security flaw has been eliminated. No production attack, load test, customer-data retrieval, charge, database mutation or external provider attack was performed. Supabase currently returns 402 because of its organization egress restriction; production RLS and authenticated end-to-end behavior therefore remain unverified.

## Confirmed source findings and fixes

| Priority | Finding and prerequisite | Implemented correction |
| --- | --- | --- |
| P1 | A caller knowing a username could retrieve a private profile's biography and activity through `/api/profile/[username]`. This legacy route used a service client and omitted `is_private`, bypassing the limited-card behavior in the existing profile RPC. | `src/app/api/profile/[username]/route.ts:52` returns only a limited identity card for private non-owner requests and does not query orders, progress, badges or posts. Owners retain their complete view. Responses are private/no-store. |
| P1 | An authenticated member could infer other members' fitness goals through `/api/users/discover`, which read their saved-plan answers with a service client and grouped matching owners without privacy checks. | `src/app/api/users/discover/route.ts:16` limits discovery to public, searchable accounts. It no longer reads any saved plans; `similar_goal` is empty. Hidden streaks are not returned. |
| P1 | A coach with accepted terms and a review UUID could overwrite or reassign another coach's review. The role helper returns a service client, while PATCH only filtered on the UUID. GET also included already-assigned pending requests. | `src/app/api/coach/review-requests/route.ts:68` adds an atomic UPDATE predicate: already assigned to this coach, or both unassigned and pending. GET uses the same visibility rule. An unmatched update returns 404, not success. Administrators retain access. |
| P1 | `/api/leaderboard` attached the viewer-specific `me` object to a response explicitly marked for shared CDN caching. If cached by the hosting layer, a later visitor could receive the previous visitor's personal result. | `src/app/api/leaderboard/route.ts:155` now emits private/no-store. The local test uses different viewers and verifies distinct bodies and headers. Actual CDN reuse was not attempted. |
| P2 | Global search ignored `is_searchable`; leaderboards exposed private/non-searchable accounts, their real names and hidden activity metrics. | Global search applies `is_searchable=true`, preserving limited identity search for searchable private accounts as the existing RPC permits. Leaderboards exclude private/non-searchable accounts, rank only visible metrics, redact other hidden metrics, and use `display_name` rather than `full_name`. |
| P2 | Any signed-in member could enumerate a private account's followers/following through the service-client list APIs. | `src/lib/follow-list.ts:22` makes a private account's relationship lists owner-only; public account lists remain available to authenticated members. Identifiers and page bounds are validated; results are private/no-store. |
| P2 | The raw PostgREST OR search expression interpolated a term with only LIKE wildcards escaped. Reserved characters could change parsing or cause malformed expressions. | `src/app/api/search/route.ts:18` quotes the filter value and escapes backslashes/quotes. This is a grammar hardening finding, not evidence of SQL execution. |

PostgREST documents the reserved-character quoting requirement in its [URL grammar](https://docs.postgrest.org/en/v16/references/api/url_grammar.html). The Supabase client handles URL encoding; values are quoted before it encodes the complete expression.

## Payment and private API review

- Lemon checkout creation/prepare/status use the verified session owner. Prices and provider product mappings come from server configuration. TJAI checkout rechecks the owned adult intake.
- Lemon webhook verifies raw-body HMAC before parsing, separates test/live secrets and store IDs, and rejects malformed money/product/account bindings. Its prepared SQL transaction serializes provider-order handling, records duplicate hashes, binds ownership to a durable intent and retains refund tombstones. SQL execution and production grants were not exercised during this review.
- Current test receipts do not grant live bundle or TJAI entitlements. Browser completion is test-gated and rejects real stored providers. Legacy Gumroad handling does not grant new purchases from unsigned callbacks.
- Bundle downloads, saved plans, generation jobs and nutrition paths reviewed include session-derived ownership scopes. The relevant local tests passed; this does not replace a two-account test after Supabase recovery.
- No executable user-HTML rendering was found in the inspected paths; the `dangerouslySetInnerHTML` instances located were structured data built from source-owned content. No exhaustive XSS/browser penetration test was performed.

## Verification

- Before changes: 12 scoped payment/auth/download/job/security suites, **133 tests passed**.
- After changes: `tests/privacy-authorization.test.ts`, **19 tests passed**, covering private owner/non-owner views, search visibility and grammar, no saved-plan discovery queries, coach ownership guards, claim exclusion, private leaderboard caching, hidden metrics, and relationship access.
- Scoped ESLint: passed on all changed TypeScript files.
- New tests exercise route behavior with a deterministic in-memory query model. They verify the mutation predicate is on the UPDATE and that a later claim cannot overwrite the first. They are not proof of live database concurrency or currently applied RLS.
- Full typecheck, full suite, production adapter build, preview deployment and runtime verification are coordinated by the root task after these commits. No root/www routing or purchasing flags were changed by this workstream.

## Remaining verification limits

Production schema/RLS must be checked after the 16 September Supabase reset. Authenticated checkout-to-access, two-account ownership tests, webhook database transactions, provider approval and real payment eligibility remain separate gates. Several older endpoints use an in-memory/fail-open rate limiter when shared Redis is unavailable; distributed abuse resistance was not proven here. This review made no claim of a full dependency, infrastructure, browser or denial-of-service audit.

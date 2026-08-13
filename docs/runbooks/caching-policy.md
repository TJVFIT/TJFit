# Caching / revalidation policy (WP-INFRA-07)

The default in this codebase is **correctness over cache hits**: anything
per-user, entitlement-bearing, or money-adjacent renders dynamically, every
request. Caching is opted into per route, and this file is the ledger of who
opted in and why.

## Page-level policy

| Route | Mode | Why |
|---|---|---|
| `[locale]/blog/[slug]` | **ISR, `revalidate = 3600`** | Article body/related posts change rarely; view count may read ≤1h stale. The view increment moved to `POST /api/blog/posts/[id]/view` (client beacon, IP-rate-limited) precisely so this page could stop calling `headers()` and cache. |
| `[locale]/bundles/[slug]` | static-per-build + per-request auth block | Page is `generateStaticParams`-driven for content, but renders the ownership gate server-side (`auth.getUser()`) — Next keeps it dynamic. Do NOT add `revalidate` here without first extracting the ownership check. |
| `[locale]/bundles/[slug]/program` | **force-dynamic — never cache** | Entitlement-gated, per-user enrollment/logs. Caching = serving one user's program state to another. |
| `[locale]/tjai/credits` | force-dynamic | Per-user credit balance. |
| `[locale]/ai`, `[locale]/ai/memory` | force-dynamic | Per-user TJAI state. |
| `[locale]/admin/**` | force-dynamic | Admin views must be live. |

The WP-INFRA-07 spec originally listed `bundles/[slug]/program` as an ISR
candidate — that baseline predates the entitlement gate. It is recorded here
as a **do-not-cache** so nobody "finishes" the WP by caching it.

## API-level policy

- `api/coaches` — `Cache-Control: s-maxage=300` (public listing).
- `api/leaderboard` — `Cache-Control: s-maxage=120` (public, mild staleness fine).
- Everything under `api/checkout/**`, `api/webhooks/**`, `api/bundles/download/**`,
  `api/tjai/**`, `api/user/**` — no cache headers, `force-dynamic` where
  declared. **Never add caching to these.**

## Rules when touching caching

1. Never cache a response that read `auth.getUser()`, entitlements, wallets,
   credits, or anything keyed by the requesting user.
2. A page that needs `headers()`/`cookies()` cannot ISR — move the per-request
   side effect to an API route first (the blog view beacon is the pattern).
3. Public content pages default to `revalidate = 3600`; pick shorter only with
   a reason written here.
4. Verify after deploy: `curl -sI https://tjfit.org/en/blog/<id>` twice —
   second response should show `x-vercel-cache: HIT` (locally:
   `x-nextjs-cache: HIT` via `next start`).
5. Any new cache opt-in gets a row in this file in the same PR.

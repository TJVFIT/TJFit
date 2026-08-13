# CSP rollout log (WP-SEC-03 — staged: Report-Only → nonce → enforcing)

Prod ships `Content-Security-Policy-Report-Only` (next.config.mjs, prod
builds only). Nothing is blocked today; `script-src` still carries
`'unsafe-inline'` pending Next nonce wiring. This file is the running log of
the three-stage tightening. **Each stage lands as its own commit.**

## Stage 1 — violation collection (SHIPPED — this commit)

- `report-uri /api/csp-report` + `report-to csp` added to the Report-Only
  policy; `Reporting-Endpoints` header added so modern Chromium uses the
  same endpoint via the Reporting API.
- New `POST /api/csp-report`: unauthenticated by nature, so it is
  IP-rate-limited, caps the body at 16 KB, accepts both
  `application/csp-report` (report-uri) and `application/reports+json`
  (report-to), and logs one compact line per violation
  (`[csp-report] directive=… blocked=… doc=…`) — visible in Vercel function
  logs today, and mirrored to Sentry (`surface:csp-report`) once the owner
  sets `NEXT_PUBLIC_SENTRY_DSN`.
- Responds 204 to everything (400 for oversize/garbage) — never a signal to
  probes.

**Watch period: 2 weeks from the stage-1 deploy.** Check Vercel function
logs for `[csp-report]` lines (or the Sentry `csp-report` surface tag)
weekly. Expected noise to IGNORE: browser extensions (`blocked=extension://`,
`moz-extension://`), ISP injectors. Expected REAL entries to fix: any
first-party inline script the nonce work must cover, any legit third-party
host missing from the allowlist.

## Stage 2 — per-request nonce (NOT STARTED)

Middleware-injected nonce: generate in `src/middleware.ts`, pass via request
header, `script-src 'nonce-<val>' 'strict-dynamic'` replaces
`'unsafe-inline'`. Requires moving the CSP header from next.config.mjs into
middleware (config headers can't vary per request). Gate: zero console CSP
violations on home, login, checkout, TJAI chat, R3F pages (dev-server
browser check, port 3020).

## Stage 3 — enforce (NOT STARTED)

Flip `Content-Security-Policy-Report-Only` → `Content-Security-Policy` once
the stage-1 log shows **zero non-noise violations for 7 consecutive days**
after stage 2 ships. Keep the report endpoint — enforced CSP still reports.

| Date | Stage | Note |
|---|---|---|
| 2026-08-14 | 1 shipped | collection live, watch period starts at deploy |

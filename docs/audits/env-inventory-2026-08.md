# Env inventory audit — 2026-08-13 (WP-SEC-08)

Method: grep of `process.env.` across `src/` + `scripts/` + root config files,
diffed against `.env.example`. Scout pass by Sonnet agent; root-level Sentry
consumption verified separately by the orchestrator (the scout's first pass
missed root files — recorded here so nobody re-flags Sentry as stale).

## Verdicts

**Undocumented but load-bearing (FIXED in this commit — added to .env.example):**
- `TJAI_LLM_PRESET`, `TJAI_LLM_BASE_URL`, `TJAI_LLM_API_KEY`, `TJAI_LLM_MODEL`
  (`src/lib/tjai/llm-gateway.ts:95-104`) — the entire open-gateway
  configuration, i.e. the no-OpenAI direction's main switch, was invisible to
  anyone reading .env.example.
- `TJAI_PLAN_REFINE` (`src/lib/tjai/orchestrator/plan-generation-pipeline.ts:213`)
  — critique-and-refine pass toggle.

**Not stale despite no src/ read (leave documented):**
- `NEXT_PUBLIC_SENTRY_DSN` — read by root `sentry.server.config.ts:3`,
  `sentry.edge.config.ts:3`, `instrumentation-client.ts:3`.
- `SENTRY_ORG` / `SENTRY_PROJECT` — consumed implicitly by the
  `@sentry/nextjs` build plugin (withSentryConfig sourcemap upload), not via
  repo `process.env` reads.

**Vercel builtins (no doc needed):** `VERCEL_ENV`, `VERCEL_URL`,
`VERCEL_PROJECT_PRODUCTION_URL`, `NODE_ENV`, `NEXT_RUNTIME`.

**Dead reads (commented-out code, no action):** `DEEPL_API_KEY`,
`AZURE_TRANSLATOR_*` in `scripts/translate-content.ts` (inert scaffold).

**Secret-exposure check: CLEAN.** No `NEXT_PUBLIC_` var carries a secret
(anon key is client-safe by design). No server secret (`RESEND_API_KEY`,
`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GUMROAD_API_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `ELEVENLABS_API_KEY`,
`UPSTASH_REDIS_REST_TOKEN`, `TJAI_LLM_API_KEY`) is read inside a
`"use client"` file — all live in `src/lib/*` or `src/app/api/*`.

## Standing rule

New env vars land in `.env.example` in the same commit that reads them —
this audit exists because the gateway vars (July) didn't.

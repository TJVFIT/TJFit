# TJFit — Performance Report (2026-06-10)

## Measured today (production, cold-ish cache, single-region probe)

| Endpoint | Status | Response time |
|---|---|---|
| `/robots.txt` | 200 | 421 ms |
| `/sitemap.xml` | 200 | 193 ms |
| `/en/bundles` | 200 | 525 ms |
| `/en/tjai` | 200 | 1,538 ms |
| `/en` (HEAD, Vercel cache HIT) | 200 | sub-second |

Earlier loop probes saw 2–4 s SSR cold starts on first hit. Interpretation:
static/cached pages are fast; heavy SSR routes (TJAI hub) pay a cold-start +
data-fetch cost. Acceptable for launch, worth improving after.

**Core Web Vitals (LCP/CLS/INP):** require field data (CrUX) or a browser lab
run; neither is available from this CLI session. The structural signals are
good — Next/Image everywhere (no raw `<img>` except a local blob preview),
font loading via `next/font` variables, no layout-shifting live counters
(removed in v6). Recommend wiring Vercel Speed Insights or PostHog web-vitals
to get real INP/LCP within a week of traffic.

## Database (Supabase advisors, re-run today)

| Lint | Count | Disposition |
|---|---|---|
| `multiple_permissive_policies` | 228 | Defer to supervised RLS-consolidation pass — every overlapping policy is evaluated per query, but batch rewrites risk lockouts |
| `auth_rls_initplan` | 135 | Same pass — wrap `auth.uid()` as `(select auth.uid())` to stop per-row re-evaluation; highest-value DB perf fix available |
| `unused_index` | 100 | 47 are FK covering indexes added 2026-06-01 (too new to judge). Re-review after 30 days of production traffic; drop genuinely dead ones then |

Already done: 47 unindexed foreign keys covered, 3 duplicate indexes dropped,
missing PK added (program_preview_views), workout-PR aggregation moved from
"fetch all rows into JS" to a Postgres RPC.

## Bundle / rendering

- **Three.js + React Three Fiber + Spline** are the dominant JS weight. They
  are transpiled and the 3D components are client components; verify (post-
  launch, with a build) that heavy 3D chunks are dynamically imported with
  `ssr: false` on every page that renders them — biggest LCP/INP lever.
- Charts: chart.js **and** recharts are both shipped — consolidation to one
  library is a meaningful bundle cut (medium effort, low risk).
- `npm run build` was not run in this session (repo rule: slow/noisy; Vercel
  runs it on deploy and gates TS/ESLint).

## Caching opportunities

1. Static-render marketing pages (blog, press, podcast, legal) with ISR if any
   are currently dynamic.
2. `/en/tjai` hub: move non-personalized hero/content to static shell +
   client-fetch user state; would cut the 1.5 s SSR cost substantially.
3. TTS cache table already exists (tjai_tts_cache) — good.
4. Keep HSTS/`Cache-Control` as configured; Vercel CDN already shows HITs.

## Memory-leak review

Client: canvas/rAF components (hero brain, 3D scenes) were spot-checked during
the v6 motion pass; no unbounded listeners found in audited components. Server:
stateless route handlers; no in-process caches that grow unbounded. No leak
evidence in Sentry. Status: no findings, keep Sentry watch post-launch.

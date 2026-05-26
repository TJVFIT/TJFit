# CLAUDE.md — TJFit

Short, authoritative rules for Claude Code working in this repo.
Read the focused docs in `docs/claude/` only when the task requires them.

---

## 1. Project identity

- **Name:** TJFit
- **Domain:** tjfit.org (production; auto-deploys from `main` on Vercel project `tjfitmain`)
- **Product:** Premium multilingual online fitness coaching + bundles + TJAI plan generator
- **Locales (do not remove):** `en`, `tr`, `ar`, `es`, `fr`
- **Brand colors:** cyan / blue / black. **NOT** champagne/gold — replace on sight.

## 2. Tech stack

- Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · Resend
- Payments: **Gumroad-only** (Paddle was removed in commit `44f26a7`)
- Auth + DB: Supabase (RLS-protected)
- Hosting: Vercel

## 3. Protected areas — do NOT modify unless the task is explicitly about them

| Area | Rule |
|---|---|
| `src/lib/payments/**`, `src/app/api/checkout/**`, webhooks | Only when task is payments |
| Supabase migrations (`supabase/migrations/**`), RLS policies | Only when task is DB/security |
| `.env*`, `vercel.json`, `next.config.mjs`, `instrumentation*` | Only when task is config |
| `messages/**` and i18n dictionaries | Only when task is translations |
| `src/middleware.ts`, auth flows | Only when task is auth |
| Existing routes under `src/app/[locale]/**` | Never remove a working route |
| Supported locales array | Never remove a locale |
| SEO/legal pages (terms, privacy, sitemap, robots) | Only when explicitly asked |

If a task seems to require touching a protected area, **stop and ask first.**

## 4. Coding rules

- Edit existing files; do not create new ones unless needed.
- Match the surrounding style. No unrequested refactors, abstractions, or cleanup.
- No comments unless the *why* is non-obvious.
- No error handling for impossible cases. Validate only at boundaries.
- Never invent prices — all program/diet prices stay `$0` until the owner sets them.
- Shopify / equipment store is **out of scope** until the owner green-lights it.
- Cyan/blue/black only. No champagne/gold anywhere.

## 5. Testing / build rules

- Type-check before claiming done: `npx tsc --noEmit`
- Lint only the files you touched: `npx eslint <file>`
- Do **not** run `npm run build` unless asked — it's slow and noisy.
- Do **not** run database migrations or Supabase commands without permission.
- If a check fails, summarize the failure in ≤5 lines; do not paste full logs.

## 6. Token-saving rules

- Do not scan the whole project. Map first, read second.
- Before reading multiple files, list the exact paths and one-line reason each.
- Read the smallest section needed (`offset` / `limit` on `Read`).
- Do not use `@file` on large files unless required.
- Do not paste large logs, JSON, or build output. Summarize failures only.
- One task at a time. Do not improve unrelated files.
- After finishing a task, recommend the user run `/clear`.

## 7. Workflow rules

- **Map-first for large asks:** for any multi-file / multi-feature request, present a phased plan before executing.
- Use sub-agents (`Agent` with `Explore`) only for genuinely broad searches (>3 queries).
- Prefer `Grep` / `Glob` over `Bash find` / `cat`.
- Make small, reviewable commits. Never `--no-verify` or force-push.
- Never delete branches, reset hard, or touch git config without explicit OK.

## 8. When to read extra docs

Load a `docs/claude/*.md` file **only when the current task matches**:

| Task is about… | Read |
|---|---|
| Checkout, Gumroad, pricing, fulfillment | [docs/claude/payments.md](docs/claude/payments.md) |
| Locales, dictionaries, RTL, translation gaps | [docs/claude/i18n.md](docs/claude/i18n.md) |
| Tables, migrations, RLS, auth, RPC | [docs/claude/supabase.md](docs/claude/supabase.md) |
| Visual design, components, animation, brand | [docs/claude/ui-style.md](docs/claude/ui-style.md) |
| TJAI hub, plan generator, chat, prompts | [docs/claude/tjai.md](docs/claude/tjai.md) |
| Pre-merge audit, regression checks | [docs/claude/audit-checklist.md](docs/claude/audit-checklist.md) |
| Branching, PR flow, rollback, worktrees | [docs/claude/development-workflow.md](docs/claude/development-workflow.md) |

Do **not** read these proactively. They exist to keep this root file small.

Historical context (don't read unless explicitly asked): `docs/SHIP_REPORT_*`, `docs/MASTER_PLAN_v4.md`, `docs/*_AUDIT.md`, `docs/audits/**`.

## 9. End-of-task output format

Finish every task with this exact block:

```
**Files changed:** <list>
**What changed:** <1–3 lines>
**Build/test:** <pass | fail summary | not run + why>
**Risks:** <any protected-area proximity, breaking changes, regressions to watch>
**Next:** <single recommended next step, or "run /clear">
```

# AI task queue

## Layout

- `cursor/inbox/` — tasks for Cursor (UI, Tailwind, `src/components`, `src/app/[locale]` markup, `public/`, design docs).
- `cursor/doing/` — claimed, in progress.
- `cursor/done/` — completed (keep report section).
- `shared/locks/*.lock` — one lock file per claimed task (filename matches task slug).
- `shared/activity.log` — append-only claim/done events.
- `claudecode/inbox/` — backend/auth/API/schema (referrals only).
- `codex/inbox/` — i18n copy and non-UI lib work (referrals only).

## Task file format (`NNNN-slug.md`)

```markdown
# NNNN — Title

## Problem
Brief finding from audit.

## Allowlist (max 5 paths)
- path/one
- path/two

## Acceptance criteria
- [ ] …

## Report
(Filled when done: branch, PR link, commit SHA, notes)
```

## Rules

- Never claim two tasks; use a lock file while in `doing/`.
- Max 5 files per task; split larger work.

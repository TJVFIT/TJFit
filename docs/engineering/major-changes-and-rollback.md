# Major changes and rollback

Use this **before** large or risky work (auth, payments, data model, broad API refactors, i18n structure, realtime messaging, checkout). Small fixes and single-file tweaks do not need the full checklist.

## What counts as “major”

- Touches **multiple** packages, layers, or user flows (e.g. API + UI + DB).
- Changes **contracts** (API shapes, env vars, RLS, migrations).
- Hard to reason about in one review or one commit.

## Before you start (recovery path)

1. **Branch** off the current stable line (e.g. `main`):  
   `git checkout -b feat/your-topic`
2. **Optional but recommended:** create an annotated checkpoint developers can return to:  
   `git tag -a pre-<topic>-$(date +%Y%m%d) -m "Before <short description>"`  
   Push tags when you want them shared: `git push origin pre-<topic>-YYYYMMDD`
3. If the change includes **Supabase migrations**, note the migration filename(s) and keep reversibility in mind (new migration to undo, or documented manual steps—never edit applied migrations in shared envs).

## While you work

- Prefer **small, logical commits** with messages that state *intent* (not only “wip”).
- Keep **one PR (or doc section) per theme** when possible so `git revert` maps cleanly to a feature.
- For behavior changes, mention **how to verify** (URLs, API calls, env flags) in the PR description.

## Change summary (required for major PRs)

Paste this block into the PR description (or append to `docs/engineering/MAJOR_CHANGE_LOG.md` if you maintain it).

```markdown
## Summary
- What changed (user-visible + technical).

## Scope
- Paths / areas: e.g. `src/app/api/checkout/`, `supabase/migrations/…`

## Recovery
- Pre-change tag (if any): `pre-…`
- Roll back this PR: `git revert <merge-commit-sha>` (or revert the merge commit on main)
- DB: [none | migration `…` — rollback via `…`]

## Verification
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] [manual steps…]
```

## Rollback quick reference

| Situation | Action |
|-----------|--------|
| Merged PR is wrong, history is shared | `git revert -m 1 <merge_commit_sha>` on `main` (or revert individual commits). |
| Not merged; local only | `git reset --hard` to branch tip or to your `pre-…` tag. |
| Need exact tree from before work | `git checkout pre-<topic>-YYYYMMDD` (detached HEAD) or branch from that tag. |
| Bad deploy after merge | Revert on `main`, redeploy; or redeploy previous deployment from host (e.g. Vercel). |

## Database

- **New migration applied in prod:** rollback is usually a **follow-up migration** or controlled SQL—plan that when you ship the first migration.
- Document in the PR **which migration files** correspond to the code change.

## Optional: running log

To make rollback discovery trivial for the team, append dated entries to `MAJOR_CHANGE_LOG.md` in this folder (create the file when the first entry is needed). Each entry should link to the PR and repeat the **Recovery** line from the template above.

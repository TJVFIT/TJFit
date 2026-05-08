# 0021 — Remove arbitrary hex (components-tjai-tjai-my-plan-tab)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/tjai/tjai-my-plan-tab.tsx`
- `src/components/tjai/tjai-quiz.tsx`
- `src/components/tjai/tjai-result.tsx`
- `src/components/tjai/tjai-shell.tsx`
- `src/components/tjai/upgrade-prompt.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

# 0006 — Remove arbitrary hex (app-locale-settings-subscription-page)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/app/[locale]/settings/subscription/page.tsx`
- `src/app/[locale]/signup/page.tsx`
- `src/app/[locale]/suggestions/page.tsx`
- `src/app/[locale]/support/page.tsx`
- `src/app/[locale]/verify-email/page.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

# 0017 — Remove arbitrary hex (components-program-content-lock)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/program-content-lock.tsx`
- `src/components/program-detail-hero.tsx`
- `src/components/program-elite-system-card.tsx`
- `src/components/program-payment-success-notice.tsx`
- `src/components/programs/program-detail-tabs.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

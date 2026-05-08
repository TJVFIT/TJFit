# 0018 — Remove arbitrary hex (components-programs-programs-catalog-client)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/programs/programs-catalog-client.tsx`
- `src/components/progress-view.tsx`
- `src/components/public-profile-view.tsx`
- `src/components/records/records-trophy-canvas.tsx`
- `src/components/shell/site-side-overlay.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

# 0011 — Remove arbitrary hex (components-free-product-detail-view)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/free-product-detail-view.tsx`
- `src/components/home/cinematic-3d-act.tsx`
- `src/components/home/cinematic-3d-impl.tsx`
- `src/components/home/cinematic-sections.tsx`
- `src/components/home/home-ambient-backdrop.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

# 0008 — Remove arbitrary hex (components-3d-palette)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/3d/palette.ts`
- `src/components/3d/scene.tsx`
- `src/components/admin-blog-panel.tsx`
- `src/components/admin-challenges-panel.tsx`
- `src/components/animated-avatar.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

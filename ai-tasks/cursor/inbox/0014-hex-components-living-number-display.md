# 0014 — Remove arbitrary hex (components-living-number-display)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/living/number-display.tsx`
- `src/components/luxury/glow-button.tsx`
- `src/components/luxury/luxury-hero-3d-canvas.tsx`
- `src/components/luxury/luxury-home.tsx`
- `src/components/marketing/home-lead-nudge.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

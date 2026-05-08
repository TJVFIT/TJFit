# 0019 — Remove arbitrary hex (components-start-funnel-client)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/start-funnel-client.tsx`
- `src/components/sticky-purchase-rail.tsx`
- `src/components/tjai/body-silhouette-selector.tsx`
- `src/components/tjai/coach-review-request.tsx`
- `src/components/tjai/share-card-generator.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

# 0010 — Remove arbitrary hex (components-coach-profile-view)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/coach-profile-view.tsx`
- `src/components/coach-terms-accept-client.tsx`
- `src/components/cookie-consent.tsx`
- `src/components/delayed-early-access-popup.tsx`
- `src/components/free-offer-section.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

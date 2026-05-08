# 0009 — Remove arbitrary hex (components-auth-required-panel)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/auth-required-panel.tsx`
- `src/components/become-coach-application-form.tsx`
- `src/components/chat-thread-view.tsx`
- `src/components/cinematic-listing-header.tsx`
- `src/components/coach-card.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

# 0020 — Remove arbitrary hex (components-tjai-tjai-calculating)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (`TJ_PALETTE`), or a single-line exception for non-brand mask colors.

## Allowlist (max 5 paths)

- `src/components/tjai/tjai-calculating.tsx`
- `src/components/tjai/tjai-chat-standalone.tsx`
- `src/components/tjai/tjai-chat.tsx`
- `src/components/tjai/tjai-hub.tsx`
- `src/components/tjai/tjai-meal-swap-tab.tsx`

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask `#000` gradients may remain with brief comment.
- [ ] `npm run build` and `npm run lint` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

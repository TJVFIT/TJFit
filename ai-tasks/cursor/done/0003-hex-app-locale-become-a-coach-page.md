# 0003 — Remove arbitrary hex (app-locale-become-a-coach-page)

## Problem

Audit pass 2 lists raw `#RRGGBB` / hex literals in bundled UI. Replace with Tailwind theme tokens.

## Allowlist (max 5 paths)

- `src/app/[locale]/become-a-coach/page.tsx`
- `src/app/[locale]/calculator/page.tsx`
- `src/app/[locale]/checkout/page.tsx`
- `src/app/[locale]/coins/page.tsx`
- `src/app/[locale]/diets/page.tsx`

## Acceptance criteria

- [x] No remaining arbitrary hex in allowlisted paths.
- [x] `npm run build` and `npm run lint` pass.

## Report

- **Branch:** `auto/cursor/audit-pass2-queue`
- **Commit:** `b5bb7f8dfa4a99f7a5bc5523c2ba9f01b5bb97c8`
- **Notes:** Replaced dark-on-accent text with `text-background`; panel surfaces with `bg-surface-2` per `tailwind.config.ts` tokens.

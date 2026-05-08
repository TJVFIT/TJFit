# 0001 — Homepage hero uses design tokens (no arbitrary hex in classes)

## Problem

Audit grep finds multiple `#RRGGBB` literals in `src/components/home/hero-section.tsx` (e.g. `#71717A`, `#67E8F9`, `#A1A1AA`, `#08080A`). These duplicate values already defined in `tailwind.config.ts` (`faint`, `muted`, `accent-muted`, `background`, `surface-2`, `accent`).

Hero metric still shows `10` languages while routing supports five locales — align the displayed number.

## Allowlist (max 5 paths)

- `src/components/home/hero-section.tsx`

## Acceptance criteria

- [x] No `text-[#…]` / `bg-[#…]` / `border-[#…]` arbitrary hex classes in the hero file; use Tailwind theme keys (`text-faint`, `text-muted`, `text-accent-muted`, `bg-background`, `bg-surface-2`, `bg-accent`, etc.).
- [x] Primary CTA gradient uses `TJ_PALETTE` tokens (already imported), not raw hex in `style`.
- [x] Languages metric reads `5` (not `10`).
- [x] `npm run build` and `npm run lint` pass.

## Report

- **Branch:** `auto/cursor/0001-hero-remove-arbitrary-hex`
- **Commit:** `20a33a81fa54c8243c29eb9b1bcd30a332bb5a2b`
- **PR (compare):** https://github.com/TJVFIT/TJFit/compare/main...auto/cursor/0001-hero-remove-arbitrary-hex?expand=1
- **Notes:** Replaced arbitrary zinc/cyan hex utilities with Tailwind theme keys; CTA gradient uses `TJ_PALETTE.accentHi` + `accent`. Mask feather still uses `#000` in gradient strings (non-brand mask technicality). Bootstrap: `ai-tasks/README.md`, `activity.log` (un-ignored via `!ai-tasks/shared/activity.log`), `.gitignore` adds `.claude/` and activity.log exception.

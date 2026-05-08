# 0002 — Nested `loading.tsx` / `error.tsx` re-exports under `[locale]`

## Problem

Only `src/app/[locale]/loading.tsx` and `src/app/[locale]/error.tsx` existed. Nested App Router segments needed segment-level suspense/error re-exports.

## Allowlist

Mechanical: 49 segment folders under `src/app/[locale]` (see `scripts/generate-locale-nested-shells.mjs`), excluding home `page.tsx`, static marketing, and `legal/*`.

## Acceptance criteria

- [x] Each qualifying segment folder has `loading.tsx` and `error.tsx` re-exporting the `[locale]` defaults with correct relative depth.
- [x] `npm run build` and `npm run lint` pass.

## Report

- **Branch:** `auto/cursor/audit-pass2-queue`
- **Generator:** `scripts/generate-locale-nested-shells.mjs` (49 segment folders; `nested/error.tsx` includes `"use client"` before re-export)
- **Commit:** `b5bb7f8dfa4a99f7a5bc5523c2ba9f01b5bb97c8`
- **Notes:** Excluded top segments: `affiliate`, `become-a-coach`, `bundles`, `challenges`, `legal`, `membership`, `podcast`, `press`, `privacy-policy`, `pro`, `refund-policy`, `start`, `store`, `terms-and-conditions`; excluded `[locale]/page.tsx`.

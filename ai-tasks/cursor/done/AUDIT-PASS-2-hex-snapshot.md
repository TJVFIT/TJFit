# AUDIT PASS 2 — Hex literal snapshot

Date: 2026-05-08

Branch context: `auto/cursor/audit-pass2-queue` (continues from 0001).

## Definition of “clean” (steady state)

Every hex finding has a **destination**: open PR, inbox task, Codex task, or documented exception. The audit is steady when the queue fully lists findings—not when every line is already tokenized.

## Summary

- **Total `src` files matching hex pattern:** 106
- **Cursor inbox tasks generated (≤5 paths each, cluster-grouped):** 21 (numbers `0003`–`0023`; `0003` now in `cursor/done/`)
- **Excluded from this queue:** `hero-section` (0001; mask `#000`), `src/lib/*`, `src/app/api/*`

## Exceptions / referrals

- `src/components/home/hero-section.tsx` — 0001 report; mask `#000` only.
- **Lib (2):** `src/lib/email-templates.ts`, `src/lib/program-card-visual.ts`
- **API (2):** `src/app/api/profile/[username]/route.ts`, `src/app/api/profile/route.ts`

## Task index

- `ai-tasks/cursor/done/0003-hex-app-locale-become-a-coach-page.md` ✅
- `ai-tasks/cursor/inbox/0004-hex-app-locale-equipment-page.md`
- `ai-tasks/cursor/inbox/0005-hex-app-locale-press-page.md`
- `ai-tasks/cursor/inbox/0006-hex-app-locale-settings-subscription-page.md`
- `ai-tasks/cursor/inbox/0007-hex-app-globals.md`
- `ai-tasks/cursor/inbox/0008-hex-components-3d-palette.md`
- `ai-tasks/cursor/inbox/0009-hex-components-auth-required-panel.md`
- `ai-tasks/cursor/inbox/0010-hex-components-coach-profile-view.md`
- `ai-tasks/cursor/inbox/0011-hex-components-free-product-detail-view.md`
- `ai-tasks/cursor/inbox/0012-hex-components-home-premium-full-bleed-image.md`
- `ai-tasks/cursor/inbox/0013-hex-components-home-testimonials.md`
- `ai-tasks/cursor/inbox/0014-hex-components-living-number-display.md`
- `ai-tasks/cursor/inbox/0015-hex-components-marketing-lead-capture-form.md`
- `ai-tasks/cursor/inbox/0016-hex-components-people-search-view.md`
- `ai-tasks/cursor/inbox/0017-hex-components-program-content-lock.md`
- `ai-tasks/cursor/inbox/0018-hex-components-programs-programs-catalog-client.md`
- `ai-tasks/cursor/inbox/0019-hex-components-start-funnel-client.md`
- `ai-tasks/cursor/inbox/0020-hex-components-tjai-tjai-calculating.md`
- `ai-tasks/cursor/inbox/0021-hex-components-tjai-tjai-my-plan-tab.md`
- `ai-tasks/cursor/inbox/0022-hex-components-tjai-public-landing.md`
- `ai-tasks/cursor/inbox/0023-hex-components-user-dashboard-view.md`

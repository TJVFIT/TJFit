# v3.9 Round 2 — Public Polish — 2026-05-03

| Task | Status | Note |
|---|---|---|
| 1. Sidebar wire-up | **shipped** | `tj-sidebar-section` + `tj-sidebar-link-item` + dot indicator + `aria-current="page"` applied to `site-side-overlay.tsx`; CSS already in `globals.css` from v3.9 r1; RTL via `inset-inline-*`; reduced-motion gated. |
| 2. Top nav hover-reveal | **shipped** | Installed `@radix-ui/react-navigation-menu`; rewrote `site-top-bar.tsx` with **Train** (Programs / Diets / Coaches / Equipment) + **TJAI** (Generate plan / TJAI Chat / Credits) submenus; 220 ms fade + 8 px slide via Radix `data-state` keyframes; surface-2 `#16181C` background; cyan-tint hover; 5-locale labels; keyboard-accessible by default. |
| 3 #2. NumberDisplay wire-up | **skipped** | No clear "12 weeks · 4 days/week" target string in the existing detail hero (uses Goal/Type/Setup/Level text spec values, not numeric). New diet detail page uses tabular-nums spans directly — same visual effect minus rhythm pulse. NumberDisplay component remains unused; defer to a session that targets specific numeric surfaces (profile streak, workout player counters). |
| 3 #3. Spatial Z-fold transitions | **shipped** | New `src/components/transitions/PageTransition.tsx` — Web Animations API only; outgoing scale 1→0.96 + Z 0→-30 + opacity 1→0.5 (350 ms cubic-bezier(0.16,1,0.3,1)); incoming scale 1.04→1 + Z 30→0 + opacity 0→1; mobile drops Z; `prefers-reduced-motion` instant swap. Wired into `[locale]/layout.tsx` between `SiteShell` and children. |
| 3 #4. BloomingModal | **cut** | Per cut-order — biggest scope (find/replace every existing `<Dialog>` / `<Modal>`). Defer to next session. |
| 4. Diet route fix | **shipped** | Both routes were redirects (catalog → `/#diets` anchor; detail → `/programs/[slug]`). Replaced both with real pages backed by `src/lib/diets/index.ts` + 1 placeholder Diet (`middle-eastern-cutting-12w`). Catalog at `/[locale]/diets`; detail at `/[locale]/diets/[slug]` with macros panel computing protein/carbs/fat from the schema's `macro_split_target`. Already surfaced in sidebar's TRAIN section + new top-nav Train submenu. 5 locales each. |
| 5. Logo PNG | **skipped** | Per audit: SVG `<Logo>` is what renders in live UI; AI PNGs at `public/brand/logo-{main,mark,source}.png` only used in press-kit downloads + JSON-LD metadata. SVG already-clean win banked. PNG redesign is a designer pass, deferred. |

## Build

`next build` `✓ Compiled successfully`. One TS error caught on retry (function in `Record<Locale, Record<string, string>>`; widened to `string | (n) => string`).

## Deferred (concrete)

- **NumberDisplay wire-up** — pick targets per session: profile `[username]/page.tsx` streak/workouts, workout player set/rep counters (route TBD), program detail catalog header.
- **BloomingModal** — new `src/components/ui/BloomingModal.tsx` capturing `event.currentTarget.getBoundingClientRect()`; 280 ms cubic-bezier(0.16,1,0.3,1); mobile = bottom sheet; replace every `<Dialog>` / `<Modal>` usage in app.
- **v3.5 #5 mobile tilt** — separate session.
- **v3.5 #6 workout player immersion** — separate session, depends on locating the player route.
- **Logo PNG redesign** — designer pass.

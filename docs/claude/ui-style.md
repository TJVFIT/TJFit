# TJFit UI style — the live source of truth

Recreated 2026-08-13 (the file `CLAUDE.md` §8 references was missing from disk).
Every value below is read from `tailwind.config.ts` / `src/app/layout.tsx` —
if this doc and the config ever disagree, the config wins and this doc gets fixed.

## Brand rule (non-negotiable)

Black / deep purple / violet / soft purple / pale lavender ONLY.
No cyan or sky as accents. No champagne/gold anywhere. Replace on sight —
but note two **token names** are historical, not violations (see naming debt).

## Color tokens (`tailwind.config.ts` → `theme.extend.colors`)

| Token | Value | Use |
|---|---|---|
| `background` | `#0A0A0B` | page ground (obsidian) |
| `surface` | `#111215` | default card/panel |
| `surface-elevated` | `#15171A` | raised panels |
| `surface-2` | `#0E0F12` | recessed wells |
| `surface-3` | `#1E2126` | hover / sticky bars (top of stack) |
| `divider` | `#1E2028` | hairlines |
| `accent` | `#A855F7` | primary electric violet |
| `accent-sky` | `#7C3AED` | secondary violet — **historical name, violet value** |
| `accent-muted` / `accent-violet` / `premium` | `#C4B5FD` | soft lavender tints; `premium` = AI/Apex/TJAI badges |
| `muted` `#A1A1AA` · `dim` `#6B6B76` · `faint` `#71717A` · `bright` `#D4D4D8` | | text hierarchy |
| `success` `#22C55E` · `danger` `#F87171` · `warning` `#F59E0B` | | semantic, never decorative |

Shadows: `glass`, `lux-glow` (violet 35%), `lux-violet`, `premium-card`.
Background: `hero-gradient` (violet radial wash). Radius: `shell` = 1.75rem for
auth panels/modals/large cards.

**Naming debt (do not copy the pattern):** `accent-sky` and `3d/palette.ts`'s
`moonlight` hold violet values under cyan-era names. WP-DESIGN-02 renames them;
until then never add a new token with a non-violet family name.

## Typography (self-hosted via `next/font/local`, zero Google Fonts)

| Slot | Face | Notes |
|---|---|---|
| `font-display` | Bricolage Grotesque (variable) | headlines; tight tracking (−0.02em class patterns) |
| `font-sans` | Switzer 400/500/600/700 | body |
| `font-mono` | JetBrains Mono (variable) | numbers, code, eyebrows |
| `font-arabic` | IBM Plex Sans Arabic | **scoped to `:root[lang="ar"]` only** — its Latin set lacks `İ ğ Ğ ş Ş`; it must NEVER enter a global fallback chain (Turkish would lose glyphs) |

## Motion system

Hand-rolled CSS / rAF / IntersectionObserver — **no Framer Motion, no GSAP**
(both were deliberately removed; do not reintroduce an animation runtime).

- Easings: `ease-premium` (primary), `ease-spring` (entrances), `ease-out-soft` (landings)
- Durations: 120/180/240/280/320/480/720/1000ms — stay on the scale
- Keyframes: `fade-up`, `scale-in`, `blur-in`, `shimmer`, `breathe`, `drift`
- Lenis drives smooth scroll globally; the instance lives on `window.__lenis` —
  share its rAF loop, never add a second scroll driver
- Every effect gates on `prefers-reduced-motion` AND capability
  (`useShouldAnimate()` from `src/lib/device/DeviceContext.tsx` — the single
  source of truth for device tier low/mid/high/ultra)
- Touch devices get no hover-dependent effects (`(hover: none)` discipline)

## Component geography quick map

Canonical 3D: `src/components/3d/` (`TJHeroStage` + variants). Primitives:
`src/components/ui/`. Shell chrome: `src/components/shell/` + `site-shell.tsx`.
Landing composition root: `src/components/immersive-home.tsx`. TJAI surfaces:
`src/components/tjai/`. Never create a parallel system next to an existing one —
that is how `luxury-hero-3d` (deleted 2026-08-13) happened.

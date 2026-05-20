# Design upgrade report — 2026-05-20 (afternoon loop)

Branch `claude/design-upgrade-2026-05-20`, **30 iterations, 32+ commits, ~1,600 lines net.** No pushes to main. Every commit ran typecheck + lint + 38 tests + production build clean.

**Branch:** https://github.com/TJVFIT/TJFit/tree/claude/design-upgrade-2026-05-20

---

## What changed: the headline numbers

- **13 public surfaces** now share one brand hero treatment (cyan drifting orbs + shimmer-band title):
  `/bundles`, `/bundles/[slug]`, `/404`, `/coming-soon`, `/auth/*` (login + signup + forgot-password + verify-email), `/calculator`, `/support`, `/press`, `/become-a-coach`, `/leaderboard`, `/suggestions`, `/coins`, `/membership`, `/search`.
- **5 client-only effect hooks** in `src/components/effects/`: `useTilt`, `useReveal`, `useParallax`, `useMagnetic`, `useRipple` (+ `useMergedRef`).
- **2 reusable components**: `<AmbientOrbs>` (default + compact variants), `<DownloadButton>` for bundle PDF.
- **8 new keyframes** + supporting CSS in `globals.css`.

---

## What the catalog feels like now

**Bundle cards:** tilt toward the cursor in 3D (~7°), cyan glare follows the pointer across the face, an orbital cyan beam rotates around the perimeter on hover, the hero image inside scales up subtly, the "Download PDF" pill pulls itself toward your cursor and ripples on click. Cards cascade into view with a 60ms stagger. Two giant blurred cyan orbs drift behind the whole catalog on long opposing loops. The active filter chip pulses a soft cyan ring. The title text shimmers a cyan band through its letters.

**Bundle detail page:** hero image opens with a 1.28→1.15 ken-burns zoom, parallax-scrolls as you read, with a 2px cyan progress beam at the very top of the viewport. Three phase cards arrive staggered, a hairline draws in beneath them, a cyan tracer dot sweeps the connector, and the "At a glance" aside tilts in 3D with its own ambient halo. Exercise + meal rows light up a cyan accent bar on hover. Nutrition stats live in framed mini-cards with their own top hairline. Final "Ready to start" CTA = magnetic + ripple pill.

**Home page:** the existing staggered hero entry kept; the secondary "Browse bundles" CTA now has magnetic + ripple + arrow slide; new "12 bundles. One way to train." catalog teaser section between TJAI overview and the editorial rail; stats CountUp uses gradient text + cyan glow + settle pulse.

**Every other public page** (404, coming-soon, auth, calculator, support, press, become-a-coach, leaderboard, suggestions, coins, membership, search): consistent ambient cyan orb backdrop + title shimmer. Visual continuity across the whole funnel.

---

## Iteration log (newest first)

| # | Commit | What |
|---|---|---|
| 30 | `beb5786` | /search: AmbientOrbs + shimmer |
| 29 | `5308b1e` | /coins + /membership: brand hero |
| 28 | `4094fad` | /leaderboard + /suggestions: AmbientOrbs + shimmer |
| 27 | `a67429d` | /become-a-coach + /press: brand hero |
| 26 | `7d12939` | /support: ambient orbs + shimmer |
| 25 | `4019793` | refactor: extracted `<AmbientOrbs>` (default/compact variants) |
| 24 | `974fcd9` | /calculator: orb backdrop + title shimmer + form hover |
| 23 | `73487b6` | /auth: cyan orbs drift; off-brand violet removed |
| 22 | `db9a149` | /coming-soon: orbs drift + shimmer |
| 21 | `4546405` | /404: orb backdrop + shimmering "404" numeral |
| 20 | `2630eea` | Home bundle teaser CTA: magnetic + ripple |
| 19 | `3660892` | Home hero secondary CTA: magnetic + ripple |
| 18 | `098f282` | (mid-loop) design upgrade summary doc |
| 17 | `d88f051`+`6f5150a` | SVG bundle heroes: cyan beam sweep + numeral breathe |
| 16 | `1c6000f` | Home: bundle catalog teaser section + 6 goal chips |
| 15 | `91ca1d7` | Nutrition stats → framed mini-cards w/ cyan top line |
| 14 | `97eaf9c` | Coaches & affiliates panel: hairline + corner glow |
| 13 | `b1ace89` | Exercise + meal row hover: cyan accent slides from left |
| 12 | `4526a74` | "At a glance" aside: 3D tilt + cursor glare + ambient halo |
| 11 | `72cdb6d` | Cinematic ken-burns hero zoom + back/Ask-TJAI arrow polish |
| 10 | `94da298` | PhaseStrip: connector draws in + cyan tracer travels it |
|  9 | `5d0004e` | Title gradient shimmer — cyan band sweeps across letters |
|  8 | `ce8d190` | Orbital conic-gradient shimmer border on card hover |
|  7 | `6623072` | Top-of-page scroll progress beam on detail pages |
|  6 | `25411d7` | Magnetic + ripple on Download PDF (cards + detail) |
|  5 | `a2529b4` | Ambient cyan orb backdrop behind /bundles catalog |
|  4 | `26e0f8d` | Home stats CountUp: gradient text + glow + settle scale |
|  3 | `6e124bd` | /bundles header: conic halo + gradient title + chip pulse |
|  2 | `fcbb17f` | Detail page: parallax hero + tilted phase cards + reveals |
|  1 | `d0e0dae` | Bundle cards: 3D tilt + cursor glare + scroll reveal |
|  0 | `778a5cc` | (prior session) Removed programs + diets sections from home |

---

## Shared infrastructure

- **`src/components/effects/use-3d.ts`** — `useTilt`, `useReveal`, `useParallax` hooks. Direct-DOM CSS-variable writes inside rAF, motion-safe gated, `(hover: none)` aware for touch.
- **`src/components/effects/use-magnetic.ts`** — `useMagnetic`, `useRipple`, `useMergedRef`. Ripple injects + removes its own span (no React state churn).
- **`src/components/effects/ambient-orbs.tsx`** — `<AmbientOrbs variant="default"|"compact" />`. Two drifting cyan/sky radial orbs, mounted as a direct child of any `relative` parent.
- **`src/app/[locale]/bundles/[slug]/detail-effects.tsx`** — `DetailHero`, `PhaseStrip`, `RevealSection`, `DownloadButton`, `AtAGlance`, `ScrollProgressBar`. Six client components owning the detail page's animation surface.
- **Keyframes in `globals.css`**: `tj-halo-spin`, `tj-orb-drift-a/b`, `tj-chip-pulse`, `tj-shimmer-spin` (with `@property --shimmer-angle`), `tj-title-shimmer`, `tj-bundle-beam`, `tj-bundle-numeral`, plus the `.tj-list-row` utility class.

---

## Performance + safety contract

Every effect on the loop:
- Direct-DOM property writes inside `requestAnimationFrame` (zero React re-renders per pointer/scroll event).
- `transform` + `opacity` only (no layout-thrashing properties).
- Gated by `prefers-reduced-motion` — RM users see static surfaces (no rotation, no parallax, no count-up, no ripple, no beam).
- Touch / `(hover: none)` users skip pointer-tracking effects (tilts + magnetic pulls).
- No new heavy deps. Just CSS, SVG, and a handful of small hooks.

---

## Test + build snapshot

```
npm run typecheck   ✓ (clean every iter)
npm run lint        ✓ (zero warnings)
npx vitest run      ✓ 6 files / 38 tests
npm run build       ✓ warning-free
```

The 6 test files (registry / sitemap / robots / json-ld / pdf builder / refund) all still pass — none of these UI moves touched bundle data or routing.

---

## Followups (need a daylight call)

1. **Drop real `.webp` bundle heroes** — animated SVG placeholders are nice, but commercial photography would lift them further. The CSS animations stay because they're inside the SVG (swap one file at a time).
2. **Same magnetic vocabulary on remaining navigational pills** — top-bar links, footer links currently still on plain hover.
3. **Spline/3D hero scene** — `SplineShowcase` exists but is a static placeholder. Wiring an actual Spline export would be the biggest single visual jump.
4. **Authenticated surfaces** (dashboard, progress, profile, settings, messages) — these didn't get touched this loop; still feel flat compared to the public side.
5. **TJAI chat / generate flow** — `tjai-shell.tsx` and friends could pick up the shared tilt/reveal vocabulary.

The branch is safe to fast-forward to main when reviewed — no breaking changes, no infrastructure adjustments needed.

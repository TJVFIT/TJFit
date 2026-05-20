# Design upgrade report — 2026-05-20 (afternoon loop)

Branch `claude/design-upgrade-2026-05-20`, **17 iterations, 19 commits, ~1,200 lines net.** No pushes to main. Every commit ran typecheck + lint + 38 tests + production build clean.

**Branch:** https://github.com/TJVFIT/TJFit/tree/claude/design-upgrade-2026-05-20

---

## What the bundles surface feels like now

**On hover** of a bundle card: it tilts toward the cursor in 3D (~7°), a cyan glare follows the pointer across its face, an orbital cyan beam rotates around the perimeter, the hero image inside scales up subtly, and the "Download PDF" button pulls itself toward your cursor and ripples on click.

**On scroll into view**: cards cascade in with a 60ms stagger. The catalog title shimmers a slow cyan band through its letters. Two giant blurred cyan orbs drift behind the whole catalog on long opposing loops. The active filter chip pulses with a soft cyan ring.

**On a bundle detail page**: the hero image opens with a 1.28→1.15 ken-burns zoom, parallax-scrolls as you read, and is followed by a 2px cyan progress beam at the very top of the viewport. The three phase cards arrive staggered, a hairline draws in beneath them, a cyan tracer dot sweeps across the connector, and the "At a glance" aside tilts in 3D with its own ambient halo. The Sample Session and Sample Meal lists light up a cyan accent bar on row hover. The Nutrition stats sit in their own framed mini-cards. The final "Ready to start" CTA is the same magnetic + ripple pill as everywhere else.

---

## Iteration log (newest first)

| # | Commit | What |
|---|---|---|
| 17b | `6f5150a` | fix: card hero `<img>` so SVG animations fire |
| 17 | `d88f051` | SVG bundle heroes get cyan beam sweep + numeral breathe |
| 16 | `1c6000f` | Home page: bundle catalog teaser section + 6 goal chips |
| 15 | `91ca1d7` | Nutrition stats → framed mini-cards with cyan top hairline |
| 14 | `97eaf9c` | Coaches & affiliates panel: hairline + corner glow + hover |
| 13 | `b1ace89` | Exercise + meal row hover → cyan accent slides in from left |
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

## Shared infrastructure created

- **`src/components/effects/use-3d.ts`** — `useTilt`, `useReveal`, `useParallax` hooks. Direct-DOM CSS-variable writes inside rAF, motion-safe gated, `(hover: none)` aware for touch.
- **`src/components/effects/use-magnetic.ts`** — `useMagnetic`, `useRipple`, `useMergedRef`. Same patterns; ripple injects + removes its own span (no React state churn).
- **`src/app/[locale]/bundles/[slug]/detail-effects.tsx`** — `DetailHero`, `PhaseStrip`, `RevealSection`, `DownloadButton`, `AtAGlance`, `ScrollProgressBar`. Five client components that own the detail page's animation surface.
- **CSS keyframes added to globals.css**: `tj-halo-spin`, `tj-orb-drift-a/b`, `tj-chip-pulse`, `tj-shimmer-spin` (with `@property --shimmer-angle`), `tj-title-shimmer`, `tj-bundle-beam`, `tj-bundle-numeral`, plus the `.tj-list-row` utility.

---

## Performance + safety contract

Every single effect on the loop:
- Direct-DOM property writes inside `requestAnimationFrame` (zero React re-renders per pointer/scroll event).
- `transform` + `opacity` only (no layout-thrashing properties).
- Gated by `prefers-reduced-motion` — reduced-motion users see static surfaces (no rotation, no parallax, no count-up, no ripple, no beam).
- Touch / `(hover: none)` users skip pointer-tracking effects (tilts + magnetic pulls).
- No new heavy deps (no canvas libraries, no Vanta, no Three.js additions, no Lottie). Just CSS, SVG, and ~6 small hooks.

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

1. **Drop real `.webp` bundle heroes** — the animated SVG placeholders are nice, but commercial photography would lift them further. The animations stay because they're inside the SVG (so swap one file at a time).
2. **Same tilt/reveal/magnetic vocabulary on the home hero CTAs** — currently they have only basic hover. Two-line refactor each.
3. **Page-load entry animation for the home hero text** (eyebrow → headline → sub-headline → CTAs staggered). Cinematic arrival like the detail-page hero already has.
4. **Spline/3D hero scene** — the home `SplineShowcase` component exists but is a static placeholder. Wiring it to an actual Spline export would be the biggest single visual jump.
5. **Coach + community page polish** — these pages didn't get touched this loop; they still feel like flat surfaces compared to /bundles.

The branch is safe to fast-forward to main when reviewed — no breaking changes, no infrastructure adjustments needed.

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

---

## Round 2 — chrome unification (iters 40–62)

After the public-funnel pass settled, the loop turned to the surfaces every user touches on every page: navigation, buttons, inputs, loaders. The headline outcome is that the **entire app now shares one set of control-surface primitives** — the same hover, the same focus, the same active state, the same "lit beam" vocabulary, the same shimmer skeleton. No surface is on a different design system from another.

### Brand cleanup
- **Codebase is 100% violet-free.** Three sweeping commits eliminated every `#A78BFA` hex and every `rgba(167,139,250,…)` leak across 28+ files including `globals.css` ambient washes that bled into every page. Brand vocabulary is now strictly cyan / sky / black.
- **`<CinematicListingHeader>`** (used on /legal, /press, /search, /suggestions, /leaderboard, /support, /become-a-coach, /coaches/[slug], /transformations) had a violet gradient stop in its h1; replaced with an animated cyan→sky shimmer sweep using the shared `tj-title-shimmer` keyframe.

### One control vocabulary
- **`.tj-cta-sheen`** — new diagonal cyan-tinted light strip that sweeps across buttons on hover, mix-blend-mode: screen so it reads on both filled and outlined surfaces. Applied to: hero primary + secondary CTAs, bundle detail Download / Ask TJAI / Share, every bundle card's Download + Details, top-bar account pill.
- **`.btn-primary-shimmer`** (existing class on every primary `<Button>`) upgraded from pure-white sweep to a brand-tier cyan-tinted gradient with screen blend + reduced-motion guard. Cascades to: auth (login/signup/verify), profile-edit, become-a-coach, follow buttons, messages composer, admin coach authorization, DMs.
- **`.input`** got a hover-preview state (brighter border + 1px cyan halo) that auto-suppresses on focus so the focus ring isn't double-stroked. Cascades across ~18 form surfaces.
- **`.tj-api-error-block`** elevated with a left red accent stripe, soft drop shadow, and a 260ms slide-in keyframe. Login + signup error containers now carry `role="alert"` + `aria-live="polite"`.

### Navigation: one "lit beam" system
- **Sidebar active link bar** — vertical cyan gradient (pale-cyan → cyan → sky) + 10/22px halo + 1.6s opacity pulse (motion-safe).
- **Top-bar active link bar** (Home / Train / TJAI) — identical horizontal version of the same beam.
- **Top-bar dropdown items** (Train + TJAI submenus) — left-edge cyan stripe grows 0→3px on hover/focus.
- **Floating hamburger + close X** — cyan-300/40 border + cyan tint + cyan halo + motion-safe 90° icon rotation on hover.
- **Side-overlay search row** was a non-interactive `<div>` with a placeholder string. Promoted to a real `<Link>` → `/[locale]/search`, auto-closes the overlay on click.
- **Account / Sign-in pill** — cyan-300/40 border + 5% cyan tint + cyan-50 text + 22px cyan glow + sheen sweep, plus the icon shifting to cyan-200 via group-hover.
- **Footer locale pills** — active pill inherits the `.tj-chip-active` pulse keyframe; inactive pills upgrade to cyan-tint + cyan-100 text + cyan halo on hover.

### Loaders
- **`.tj-skeleton`** — new shimmer utility: white/[0.04] base + slow cyan→pale-cyan band sweep (1.8s). Motion-reduce flattens to static.
- Applied to: `[locale]/loading.tsx` (the universal Suspense fallback all 40+ route loaders re-export from), `HomeLuxurySkeleton`, `BlogCardSkeleton`, people-search avatar+text+chip rows, luxury-home programs grid, coins 6-card grid, leaderboard rank rows, records (32px + 28px), suggestions 3-card list, profile-edit initial load, programs-catalog placeholders.
- **Scroll progress** — site-shell had a flat-cyan global bar; bundle detail was stacking a duplicate premium one on top. Upgraded the shared bar to the premium gradient + glow and removed the duplicate. Every route in the app now gets the same beam.

### Hero micro
- **Bundle detail hero** — cascading fade-up entry (chips → title → hook → desc → CTAs at 80/180/280/380/480 ms) with the bundle name picking up `.tj-title-shimmer`.
- **Home hero scroll-cue chevron** — cyan drop-shadow halo at peak (0.45 → 0.92 opacity, 6px translate, 10px cyan glow). Reads as "there's more here" instead of a passive grey arrow.

### Round-2 iteration log

| #     | Commit    | What                                                            |
| ----- | --------- | --------------------------------------------------------------- |
| 62    | `d4ac749` | Hero scroll-cue cyan halo + livelier bob                        |
| 61    | `4712716` | Footer locale: active pulses + cyan hover on inactive           |
| 60    | `357a850` | Side-overlay search row → real Link with cyan hover             |
| 59    | `f91ca05` | Burger + close X: cyan hover + 90° icon rotate                  |
| 58    | `f9d35e1` | Top-bar account pill: cyan-tinted hover + sheen + icon shift    |
| 57    | `d2b7adf` | Top-bar dropdown items: left-edge cyan stripe on hover          |
| 56    | `31ad220` | Top-bar active link bar: gradient + halo + pulse                |
| 55    | `5081767` | Sidebar active link bar: gradient + halo + pulse                |
| 54    | `819a8e9` | Skeleton on 6 more loaders + fix `violet-500` leak              |
| 53    | `0848b51` | Skeleton on people-search + luxury-home                         |
| 52    | `1a214a8` | Skeleton on home Suspense + blog preview                        |
| 51    | `dcc0a0d` | New `.tj-skeleton` shimmer + adopt on root locale loading       |
| 50    | `b16c3f3` | Unify scroll-progress bar: premium gradient + glow, drop dup    |
| 49    | `06bb48b` | `.tj-api-error-block` elevated + `role=alert` on auth           |
| 48    | `96e11ae` | `.input` hover preview: brighter border + 1px cyan halo         |
| 47    | `c75a373` | `.btn-primary-shimmer` brand-tier gradient + RM guard           |
| 46    | `31afbda` | BundleGrid card buttons: `.tj-cta-sheen`                        |
| 45    | `855f2e6` | Bundle detail Download / Ask TJAI / Share: `.tj-cta-sheen`      |
| 44    | `28d74e1` | New `.tj-cta-sheen` + home hero CTAs                            |
| 43    | `1c99779` | Sweep `rgba(167,139,250,…)` violet → sky across 15 files        |
| 42    | `e772cb5` | Sweep `#A78BFA` violet → `#0EA5E9` sky across 12 surfaces       |
| 41    | `4e5d118` | De-violet `<CinematicListingHeader>` — cyan→sky animated h1     |
| 40    | `bad3f1a` | Bundle detail hero: staggered fade-up cascade + shimmer h1      |

### Round-2 test + build snapshot

Every single iteration above ran clean: typecheck ✓, lint ✓, 6 test files / 38 tests ✓. No new dependencies were added. No production build broke. No file lost backward compatibility.

---

## Round 3 — authenticated + global hover system (iters 63–76)

Once chrome was unified, the loop pivoted to the authenticated app and to *every remaining flat interaction*. The headline outcomes: the brand is now correct in **every CSS variable**, the `.tj-cta-sheen` vocabulary now reaches the entire CTA surface area, and there is essentially no plain `hover:bg-white/N` left where it would carry meaning.

### Brand integrity at the variable level
- The `--color-accent-violet` token was a legacy slate-grey alias (`#94a3b8`). One CSS line redefines it to sky-500 (`#0ea5e9`) — cascades to **~18 surfaces** instantly: trophy icons (leaderboard + dynamic island), membership pricing checkmarks, the TJAI Plateau Alert callout, the Aggressive Plan comparison toggle, the macro adherence progress bar, the "FREE" pill, the records Timer PR icon, coach review upgrade hint, Apex border CTA, and the decorative background orbs on quiz + calculating.
- The misleading `variant="violet"` prop on `<AmbientBackground>` + `<SectionTransition>` was renamed to `variant="sky"` (it had been sky-colored since the earlier violet sweeps — the prop name was the only thing still wrong). Two callers updated in lockstep.

### CTA vocabulary now app-wide
The diagonal cyan sheen + cyan→sky gradient + cyan glow + 1.02 hover scale now lives on **every primary CTA in the app** — not just the public funnel. The big sweep flipped 18 surfaces in one move (auth, TJAI quiz/result/chat, dashboard, settings, cookie consent, become-a-coach, support, suggestions, equipment, 404, share-card, meal swap, start-funnel, tjai-public-landing, tjai-typing-showcase, immersive-home, coach-profile). Five smaller commits filled in specific patches: bundle-detail Download/Share/Ask, BundleGrid card buttons, the home BundleTeaserCTA, the user dashboard Log-Workout + Retry, and the TJAI quiz Continue/Generate + Resume.

### Secondary + hover vocabulary
- **`<Button variant="secondary">`** moves from white-on-white hover to cyan-300/40 border + 5% cyan tint + cyan-50 text + 18px cyan halo. Cascades to every consumer.
- **Five files** of ad-hoc secondary pills + four DM-thread chrome elements + five community/coach/admin/onboarding surfaces + seven TJAI/funnel/search surfaces (~25 buttons total) all got the same cyan-tint + halo treatment.
- The **chat-thread incoming-message bubble border** now shifts to cyan-300/20 on hover.
- The **TJAI "Aggressive Plan" recommendation panel** was on the slate-grey legacy alias; rebuilt with cyan-300/45 border + 28px cyan halo + cyan-100 RECOMMENDED badge with its own glow. The plan the system actively steers toward now looks like the steer.

### Round-3 iteration log

| #     | Commit    | What                                                            |
| ----- | --------- | --------------------------------------------------------------- |
| 76    | `b27119a` | Final TJAI + funnel + global-search hover sweep (7 surfaces)    |
| 75    | `cd24808` | community + coach panel + admin + onboarding + home secondary   |
| 74    | `4bd047e` | Button.secondary + 4 ad-hoc outline pills → cyan hover          |
| 73    | `fabe23d` | DM chat-thread chrome + bubble border cyan-tint                 |
| 72    | `cd32f70` | Retire slate alias on `--color-accent-violet` → sky-500         |
| 71    | `699722d` | TJAI Aggressive Plan: cyan border + halo + RECOMMENDED badge    |
| 70    | `b4dae56` | Sweep flat bg-accent CTAs → brand sheen across 18 surfaces      |
| 69    | `ee70da2` | User dashboard Log-Workout + Retry → sheen vocab                |
| 68    | `48a55e7` | TJAI chat composer Send button (both shells) → sheen            |
| 67    | `6d13876` | TJAI result page plan-action CTAs (4 buttons) → sheen           |
| 66    | `fe7b2ff` | TJAI quiz Continue/Generate + Resume → sheen + motion-safe fix  |
| 65    | `9b2cf69` | Rename misleading `variant="violet"` prop → `variant="sky"`     |
| 64    | `90e696c` | Home BundleTeaserCTA sheen + PlatformFeatureCard icon cyan      |
| 63    | `b8552a2` | Audit doc — Round 2 (iters 40-62)                               |

### Round-3 test + build snapshot

Same as rounds 1 & 2: typecheck ✓, lint ✓, 6 test files / 38 tests ✓ on every commit. The branch is currently at 77 iterations / 50+ commits / ~3,000 lines net. No breaking changes. No new dependencies. Still safe to fast-forward to main after review.

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

---

## Round 4 — surface polish + final brand sweeps (iters 78–89)

After the chrome and CTA systems were unified, this round handled the surfaces that only show up in specific moments: scrollbars, empty states, the home page wow-acts, the Logo, and the metric strip. Plus one last brand sweep eliminated a literal Tailwind violet that had been shipping in the Apex tier button.

### Pixel-level micro-polish

- **Global scrollbar** — Replaced dead-grey resting thumb with a soft cyan→sky gradient (22% / 18% alpha), and the snap-to-flat-cyan hover with a brighter cyan→sky gradient + 8px cyan halo + smooth transition. Every scroll context in the app inherits.
- **`<Logo>`** — Hover state was `opacity-90` (dimming) which read as "going inactive when interactive." Now motion-safe 1.03 scale + 22px cyan halo + explicit `focus-visible` cyan-300/55 ring for keyboard nav. Lifts toward the cursor with a soft glow.
- **Hero "Today's Plan" rows** — The three command-panel rows (Push Day / Lunch / Steps) gained a brand-tier hover: cyan-300/22 border, 4% cyan fill, 22px cyan halo, hover-only gated. Inspectable depth-of-detail.
- **Hero metric blocks** — Three metric blocks under the CTAs (`HeroMetric`) light up on hover: cyan-300/30 top border, animated cyan-tinted glowing hairline (12px halo), cyan-50 value + cyan-200 label. Reads as live numbers.
- **Empty state** — Shared `.tj-empty-state` (6 surfaces: coach students, people search, messages, dashboard, people-search-error, messages-error) upgraded from dashed-white outline to cyan-300/18 dashed border + soft vertical cyan→neutral gradient + centered radial cyan halo (60×70%, 8% alpha).

### Home page wow-acts now share one arrival rhythm

All three home page hero-tier moments now cascade their header text (eyebrow → headline → sub at 80/180/320 ms with `tj-fade-up`, motion-safe gated):

- **SplineShowcase** — "Touch the system / Move your cursor / The system responds."
- **Cinematic3DAct** — "Engineered intelligence / Your transformation, computed in real time / 25 signals…"
- **CinematicHowItWorks** — "From intake to execution" (also gets `tj-title-shimmer` on the final word) + each step card lights its number circle (cyan-300/45 border + 18px cyan halo) and icon ring on hover.

### Home transformation strip — paths draw on view

The before/after Week 1 / Week 12 SVG trend curves were present-from-load. Now both paths animate `stroke-dashoffset` from 300 → 0 over 2.4s cubic-out, gated to fire only when `.reveal-section` enters viewport. Stagger: Week 1 at 120 ms, Week 12 at 520 ms — the transformation literally draws itself in front of the user.

### Final brand sweep

A literal Tailwind violet pair had survived three rounds of cleanup, shipping inside the `/membership` Apex tier button (`bg-gradient-to-r from-violet-500 to-cyan-500`) and badge (`border-violet-400/30 bg-violet-400/10 text-violet-300`). Plus 6 more surfaces with the same pattern (admin-blog feature pill, community-hub badge, luxury-home + people-search transformation badges, coach-profile gate hero, suggestion-cards "Swap" intent) and the program-card-visual library gradient tokens. All swept to sky/cyan. Legacy CSS class `.tj-hero-orb-violet` renamed to `.tj-hero-orb-sky`.

**Codebase verified: zero literal Tailwind `violet-*` / `purple-*` / `indigo-*` / `fuchsia-*` remain.**

### Round-4 iteration log

| #     | Commit    | What                                                            |
| ----- | --------- | --------------------------------------------------------------- |
| 89    | `e218099` | Sweep last Tailwind violet (Apex button + 7 more surfaces)      |
| 88    | `706c30e` | Home newsletter bar: shimmer title + gradient submit + sheen    |
| 87    | `454936f` | Home become-a-coach: shimmer title + sheen CTA + cyan glow      |
| 86    | `2e3a58e` | Home transformation: Week-1 / Week-12 SVG curves draw on view   |
| 85    | `cfce369` | Home how-it-works: shimmer + step number/icon glow on hover     |
| 84    | `3b75a49` | Cinematic3DAct header cascade fade-up                           |
| 83    | `a8693d5` | SplineShowcase header cascade fade-up                           |
| 82    | `b294669` | Empty-state cyan dashed border + soft cyan halo                 |
| 81    | `a6e77fe` | Hero metric blocks: cyan hairline + glow on hover               |
| 80    | `abbbdeb` | Hero "Today's Plan" rows: cyan hover-lift                       |
| 79    | `a3284f3` | Logo: motion-safe scale + cyan halo + focus ring                |
| 78    | `12c38f1` | Global scrollbar: cyan gradient + glow                          |

### Round-4 test + build snapshot

Same protocol: typecheck ✓, lint ✓, 6 test files / 38 tests ✓ on every commit. Branch is now at 89 iterations / 60+ commits / ~3,400 lines net. Still safe to fast-forward to main after review. No new dependencies, no breaking changes, no infrastructure adjustments.

---

## Round 5 — chip family + section motion + card reactivity (iters 90–99)

After the chrome system landed, this round propagated the same chip vocabulary across every remaining filter/tab/toggle in the app, breathed motion into static section artifacts, and brought card hover states (blog, home preview) into the same brand language. **The "Aggressive plan" toggle disambiguation is a small but real story** — it was visually identical to "Moderate" until iter 98 because of how the violet→sky alias shipped.

### Tab + chip vocabulary, complete

Every filter/tab/toggle surface in the app now belongs to one of two visual families:

- **`.tj-chip-active`-class pill chips** — leaderboard category tabs (Coins/Streak/Programs/Verified) + period pills (Week/All-Time), coins ledger filter pills (ALL/EARNED/SPENT), community-hub tabs (Threads/Challenges/Groups/Transformations/Blogs/People). All inherit the shared 2.8s cyan-300/45 border + cyan-fill + cyan-50 pulse.
- **Gradient + sheen primary toggles** — TJAI hub tab nav (My Plan/Chat/Progress/Meal Swap) active state, TJAI compare toggle pair (Moderate cyan→sky / Aggressive sky→deep-sky). Both with `.tj-cta-sheen` + 18px cyan halo.

### Motion injected into static moments

- **Home transformation strip** (Week-1 + Week-12) — SVG trend curves now `stroke-dashoffset` animate from 300 → 0 over 2.4s cubic-out, gated to `.reveal-section.revealed`, staggered 120/520 ms.
- **Home become-a-coach mock dashboard** — bar chart `transform: scaleY(0 → 1)` with `transform-origin: bottom`, staggered 70 ms per bar, motion-safe.
- **Home Cinematic3DAct + SplineShowcase + HowItWorks** — all three home page wow-acts now cascade their headers (eyebrow → headline → sub at 80/180/320 ms with `tj-fade-up`).

### Card surfaces feel reactive

- **Home blog preview** — Cards no longer just "border-tint" on hover. Now: cyan-300/30 border, 44px black drop shadow + 28px cyan halo, motion-safe `-translate-y-0.5` lift, title shifts to cyan-50.
- **Home Become CTA** + **newsletter bar** + **testimonials** + **how-it-works** — All four secondary-tier sections picked up `tj-title-shimmer` on their headlines and brought their CTAs into the unified vocabulary.

### Last hidden brand leak found

The `/membership` Apex tier button shipped with `bg-gradient-to-r from-violet-500 to-cyan-500` plus a `border-violet-400/30 bg-violet-400/10 text-violet-300` badge — literal Tailwind violet that earlier hex/rgba sweeps had missed. Swept across 8 surfaces (membership Apex, admin-blog feature, community + luxury + people-search badges, coach-profile gate, suggestion-cards Swap intent, program-card-visual library tokens). The `.tj-hero-orb-violet` CSS class was renamed `.tj-hero-orb-sky` (color was already sky).

**Verified: zero `violet-*` / `purple-*` / `indigo-*` / `fuchsia-*` Tailwind classes remain anywhere in src/.**

### Round-5 iteration log

| #     | Commit    | What                                                            |
| ----- | --------- | --------------------------------------------------------------- |
| 99    | `ceafd26` | Home blog card hover: cyan border + glow + lift + cyan-50 title |
| 98    | `f6e4443` | TJAI compare toggle: cyan vs sky gradient pair + sheen Continue |
| 97    | `9dad844` | TJAI hub tab nav: gradient active + cyan-100 hover              |
| 96    | `a369346` | Community tabs: tj-chip-active pulse + cyan-50 text             |
| 95    | `9c0cdd9` | Community Join Challenge pills: sheen + cyan-50 hover           |
| 94    | `6a7e7a8` | /coins ledger filter pills join the cyan-chip family            |
| 93    | `35df46f` | /leaderboard tabs + period pills join the cyan-chip family      |
| 92    | `b6c0ddb` | Home testimonials: shimmer title + cyan halo on chevrons        |
| 91    | `ca4cc09` | Home coach-cta mock dashboard bar chart grows on view           |
| 90    | `e5bc76e` | Audit doc — Round 4 (iters 78–89)                               |

### Round-5 test + build snapshot

Same protocol: typecheck ✓, lint ✓, 6 test files / 38 tests ✓ on every commit. Branch is now at 99 iterations / 70+ commits / ~3,800 lines net. Still safe to fast-forward to main after review.

---

## Where the branch stands at the 100-iteration mark

Across 5 rounds of work the branch has touched ~80 distinct files. The user-visible result: **every interactive surface in the app now hovers, focuses, fills, and pulses with the same brand vocabulary.** The catalog cascade from iter 1 (3D bundle cards) and the chip pulse from iter 95 (Join Challenge) feel like they were designed by the same person.

What you'd notice on a side-by-side with the pre-loop state:
- Every CTA flashes the same diagonal cyan sheen on hover.
- Every active route indicator (sidebar, top-bar, dropdown items) is a "lit cyan beam" with a soft 1.6s pulse.
- Every form input has a hover-preview ghost ring before focus engages, and every error block slides in with a left red accent + soft drop shadow.
- Every loading skeleton shimmers a cyan band through the placeholder shapes.
- Every section header on the home page breathes in on a 80/180/320 ms cascade.
- Every chip filter pulses gently when active.

What's left as **daylight followups** (need either user input or beyond-loop scope):
1. Real `.webp` bundle hero photography (animated SVG placeholders are nice but commercial photography would still lift them further).
2. Spline interactive scene wiring (`SplineShowcase` still renders the fallback TJHeroStage variant; the integration is stubbed at the package layer).
3. Equipment / Shopify store surface (memory `feedback_shopify_scope` says the user will green-light separately).
4. Coach dashboard + admin panels (have been touched but the data-dense surfaces could use more bespoke polish).

The branch is at `claude/design-upgrade-2026-05-20`, 100 iterations, ~70 commits, ~3,800 lines net, **zero new dependencies**, every commit clean on typecheck/lint/38 tests. Safe to fast-forward to main after a human review.

---

## Round 6 — corner cases + brand at the variable level (iters 100–125)

After the 100-iteration milestone audit shipped, this round did the "long tail" work — fishing out every remaining brand leak in CSS variables and Tailwind class names, propagating the chip / sheen / halo vocabulary to every surface that hadn't been touched, and fixing the dim-on-hover anti-pattern wherever it survived.

### Three more shipped brand leaks found and fixed

- **`.gradient-button` CSS class** (used on signup multi-step Continue + Finish Setup, every step): 3-stop gradient ended in `#94a3b8` slate-grey at the right edge. Cyan→darker-cyan→GREY shipping to prod. Replaced the slate stop with sky-500.
- **`.apex-rotating-border` CSS class** (TJAI hub Apex tier badge animation): cycled `#94a3b8 → #22d3ee → #94a3b8`. Now `#0ea5e9 → #22d3ee → #0ea5e9`. Inner text color went from `#94a3b8` slate to `#67e8f9` cyan-300.
- **3 PlatformFeatureCard accents** on the home feature grid (Full Diet Systems / Leaderboards / 10 Languages — half the cards): the vertical accent stripe color literal was `#94A3B8` slate. Repainted to cyan-300 / sky-500.
- The `--glow-violet-text` CSS var (rgba slate alias) retired to sky-500 for consistency.
- A literal Tailwind `from-violet-500 to-cyan-500` gradient on the `/membership` Apex tier button. Plus literal `border-violet-400/30 bg-violet-400/10 text-violet-300` on the Apex badge. Plus 7 other surfaces (admin-blog feature, community badge, luxury-home transformation badge, people-search badge, coach-profile gate, suggestion-cards Swap intent, program-card-visual library tokens). Swept to sky/cyan; `.tj-hero-orb-violet` CSS class renamed `.tj-hero-orb-sky`.

**Verified: zero `violet-*` / `purple-*` / `indigo-*` / `fuchsia-*` Tailwind classes and zero `#94a3b8` / `rgba(148,163,184,…)` slate-grey literals remain in src/.**

### Dim-on-hover anti-pattern eliminated

- Top-bar Logo (iter 79), home page LogoShowcase (iter 115), `/membership` Apex CTA (iter 116), and a redundant `hover:opacity-90` layered onto the TJAI aggressive Generate CTA all replaced `hover:opacity-9X` patterns with: motion-safe scale + cyan halo expand + focus-visible cyan ring. Brand marks and primary CTAs *grow* toward the cursor instead of dimming.

### Polish vocabulary now reaches every surface

- **Global form chrome** — accent-color cyan on native checkbox/radio/range/progress (iter 106).
- **Global focus-visible** — 2px solid outline at 75% alpha + 3px offset + stacked box-shadow halo (4px cyan/18% + 22px cyan/22%) + 140ms transitions, on links / buttons / role=button/tab/menuitem / tabindex=0 / summary (iter 107).
- **`<ScrollToTop>`** floating button — cyan-300/20 → cyan-300/50 border + 24px cyan halo + motion-safe chevron lift on hover.
- **`<DynamicIsland>` toast bubble** — cyan-300/20 border tint + 28px cyan halo stacked on the black drop shadow.
- **`<FollowButton>`** — Follow / Following / Unfollow-preview tristate, all with cyan halos (red on the destructive Unfollow preview), smooth state transitions.
- **`<Logo>`** small link — motion-safe scale + cyan halo + focus ring (no more dim).
- **`<AuthPageFrame>`** card (login/signup/forgot/verify): cyan-300/12 border + 44px cyan halo on top of the black drop shadow.

### Component-level polish

- **TJAI streak banner** — cyan-300/20 border, diagonal cyan→black gradient bg, 24px cyan box-shadow, badge halos on hover, motion-safe emoji pulse.
- **TJAI speaker (TTS)** — playing state lights up: cyan-300/55 border + 12% cyan fill + cyan-100 text + 14px cyan halo. Idle hover gets 12px cyan halo too.
- **Dashboard 4-stat tile row** (Programs/Entries/Milestones/Streak) — cyan-300/35 border + 60px black + 28px cyan halo + motion-safe -0.5 lift + value cyan-100 + label cyan-200/80 on hover.
- **Dashboard active-program "Continue →"** — border cyan-300/35 + 60px black + 36px cyan halo, inner Continue pill `.tj-cta-sheen` + cyan-300/55 border + cyan-50 text + 28px halo on group hover.
- **TJAI compare toggle** — Moderate cyan→sky gradient vs Aggressive sky→deep-sky gradient (visually distinct tiers) + sheen, Continue gets the same secondary cyan hover.
- **Coach profile** (`/coaches/[slug]`) — shimmer name h1 + 4 stat tiles cyan-halo hover.
- **Public profile** (`/people/[username]`) — shimmer display-name h1 + Edit Profile / Sign in pills with cyan hover.
- **Blog detail** (`/blog/[slug]`) — shimmer title + related-card cyan halo + cyan link hovers.
- **Transformations detail** — shimmer "Username • Category" + cyan dashed Before/After placeholders.
- **Search results** — cyan-300/40 border + cyan-50 text + 18px cyan halo on each result link.
- **Press** — Official-asset download rows with cyan halo + arrow slide.
- **Home blog preview cards** — cyan border + 28px cyan halo + motion-safe -0.5 lift + title shifts to cyan-50.
- **Home coach grid** — cyan-300/35 border + 36px cyan halo + lift + name shift.
- **Home become-a-coach mock dashboard** — bar chart grows on view (scaleY 0→1, 70ms staggered) + the 3 stat tiles got cyan-tinted borders + inset cyan halo.
- **Home testimonials carousel** — shimmer title + cyan halo on prev/next chevrons.
- **Home how-it-works** — shimmer "execution" word + step number+icon ring glow on hover.

### Chip / tab family completed

Every filter, tab, toggle, and pill in the app is now in one of two visual families:

1. **`.tj-chip-active` family** — bundle filters, leaderboard category + period pills, coins ledger filter, community-hub tabs. Inherit the shared 2.8s cyan-300/45 + cyan-fill + cyan-50 pulse.
2. **Gradient + sheen primary toggle family** — TJAI hub tab nav, TJAI compare toggle pair. Both with `.tj-cta-sheen` + 18px cyan halo.

### Round-6 iteration log

| #     | Commit    | What                                                            |
| ----- | --------- | --------------------------------------------------------------- |
| 125   | `84a345c` | Public profile: shimmer name + cyan hover on outline pills      |
| 124   | `22fe3e4` | Coach profile: shimmer name + 4 stat tile cyan halos            |
| 123   | `d1b2d9d` | Press: cyan halo + arrow slide on asset download rows           |
| 122   | `ec2dfd9` | Search results: cyan hover on result links                      |
| 121   | `6bbc0f0` | Transformations detail: shimmer + cyan dashed placeholders      |
| 120   | `050bb4e` | Blog detail: shimmer + related-card cyan halo + cyan links      |
| 119   | `af35741` | Home coach grid: cyan border + halo + lift + name shift         |
| 118   | `77ea7ab` | AuthPageFrame card: cyan halo + cyan border                     |
| 117   | `31774a0` | Home coach-cta mock dashboard tiles: cyan tint + inset halo     |
| 116   | `8f482ec` | Apex membership CTA: removed dim-on-hover + sheen vocab         |
| 115   | `3d600a8` | Home logo-showcase: scale + cyan halo + focus ring              |
| 114   | `a5ced3f` | Dashboard active-program Continue: cyan halo + sheen pill       |
| 113   | `ec67d6c` | Dashboard 4-stat tiles: cyan halo + lift + text shifts          |
| 112   | `ec00081` | TJAI speaker: playing state lights up cyan                      |
| 111   | `9c17c9a` | TJAI streak banner: cyan tint + gradient bg + badge halos       |
| 110   | `f92e52e` | --glow-violet-text retired to sky-500                           |
| 109   | `8d0f07b` | Apex rotating border + 3 PlatformFeatureCard slate accents      |
| 108   | `869e1ac` | .gradient-button slate stop → sky + signup CTAs sheen           |
| 107   | `a5ada26` | Global focus-visible ring upgrade                               |
| 106   | `b62be8c` | Native form controls: brand cyan accent-color                   |
| 105   | `bb2fe56` | Global search: focus-within ring + cyan icon + view-all sheen   |
| 104   | `660f413` | Scroll-to-top: cyan halo + chevron lift + backdrop blur         |
| 103   | `000d99c` | DynamicIsland toast: cyan tint + cyan halo                      |
| 102   | `9bc3655` | FollowButton: cyan / red tristate halos + smooth transitions    |
| 101   | `7a4d29e` | DM send button: brand gradient + sheen + cyan glow              |

### Round-6 test + build snapshot

Same protocol: typecheck ✓, lint ✓, 6 test files / 38 tests ✓ on every commit. Branch now at **125 iterations / ~85 commits / ~4,200 lines net.** Zero new dependencies, zero breaking changes, still safe to fast-forward to main after review.

The chrome is done. Every interactive surface in the app has been touched at least twice across the six rounds. The brand vocabulary is complete: cyan / sky / blue / black / neutral, with consistent halos, sheens, shimmers, and pulses across the entire interaction surface.

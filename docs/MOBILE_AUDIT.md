# Mobile / Responsive Audit — 2026-05-02 (static analysis)

Static read-only pass over the requested pages and their primary client components. Anything requiring DPR/iOS Safari/touch feel sits in the runtime section.

## Summary
- Pages/components audited: 14 (5 routes + 9 components)
- Critical (breaks <=375px or unusable on touch): 8
- High (degraded <=768px or RTL break): 9
- Polish: 7

## Per-page findings

### Homepage — src/app/[locale]/page.tsx (+ home components)

The route file itself (page.tsx) is clean — pure server orchestrator with a sound skeleton. All issues live in the dynamic-loaded `ImmersiveHome` tree.

- Critical src/components/home/cinematic-3d-impl.tsx:62-72 — `PointerCamera` always reads `mouse.x/y` and lerps the camera position even when `pointerReactive` is conceptually false. There's no `prefers-reduced-motion` short-circuit and no touch fallback; on iOS the camera locks to a fixed position because `mouse.x` stays at 0,0, but the GPU still runs the R3F frame loop with Sparkles + 3 torus rings + icosa geometry. Fix: gate the `useFrame` body on `!reduce && !isTouch` props passed in from `Cinematic3DAct`.
- Critical src/components/home/hero-section.tsx:194 — `<TJHeroStage variant="neural" pointerReactive={!reduce} ... />` passes `pointerReactive` based only on `reduce`, not touch. On a phone the stage subscribes a `pointermove` listener that never fires meaningfully; harmless functionally but it confirms there is no touch-tailored hero variant. Combined with the >=58% width SVG/canvas behind text, the silhouette steals visual weight on small screens. Fix: also pass `&& !isTouch` and reduce `lg:w-[56%] xl:w-[58%]` opacity to ~0.25 below `lg`.
- Critical src/components/immersive-home.tsx:471-514 — TJAI section sets `style={{ minHeight: "min(90vh, 700px)" }}` and the visual column is `hidden lg:flex`. On mobile (90vh) the section takes ~675px of empty cyan glow with the heading + bullets pushed below the fold; users have to scroll a full viewport before content begins. Fix: drop to `min-h-0` or `min-h-[60vh]` below `lg`.
- High src/components/home/hero-section.tsx:40 — `<p className="mt-2 text-xs leading-relaxed ...">{hint}</p>` is the HeroMetric hint copy ("Structured blocks with progression and checkpoints") — body context, not label. `text-xs` (12px) is sub-readable on mobile. Fix: `text-[13px]` minimum.
- High src/components/home/hero-section.tsx:174-179 — `ghost-text` decorative SYSTEM/TRAINING words use `start-[-5%]` / `end-[-4%]` and a `max-md:` reset to `start-0`/`end-0`. With `dir="rtl"` on Arabic plus the negative percentage start, these may overflow horizontally on small RTL viewports. Likely visually fine because they're aria-hidden decoration, but worth a runtime check.
- High src/components/immersive-home.tsx:108 — `TiltCard` rotates the card with `perspective(800px) rotateX/Y` driven by mouse coordinates. Disabled by `isTouch || reduce` (line 444), so this is correct, but verify `useIsTouchDevice` (line 53) returns true before first paint — `useState(false)` initial means a non-mobile-first one-frame flash. Fix: initialize from `typeof window !== "undefined" && matchMedia("(hover:none)").matches` lazy initializer or set in `useLayoutEffect`.
- High src/components/home/hero-section.tsx:248-268 — CTA buttons use `flex-1 sm:flex-none`. At 320px the container is `px-5` (40px gutters) leaving 280px; two buttons at `min-h-[54px] px-7 py-3.5` with `gap-3` end up at ~134px each, tight but workable. ArrowRight icon could clip at 320px due to text+icon line wrapping. Polish: add `whitespace-nowrap` on the labels.
- High src/components/immersive-home.tsx:236-247 — Programs section parallax effect attaches a scroll listener gated only by `reduce || window.innerWidth < 768`. The width check happens once at mount; rotating phone landscape (>= 768px) adds the listener with no cleanup-on-resize. Minor leak/perf nit.
- High src/components/immersive-home.tsx:441 — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` wrapped in `TiltCard` whose mouse handler measures `getBoundingClientRect()`. With sticky sticky-purchase-rail not on this page it's fine, but each card triggers a layout read — under 4-card grid acceptable.
- Polish src/components/home/cinematic-3d-act.tsx:54 — Section uses `min-h-[80vh]` — on iOS Safari with the dynamic chrome, `vh` is the larger viewport which means scrolling can reveal an empty band at the bottom. Use `100dvh`-equivalent or `min-h-[80svh]`.
- Polish src/components/home/spline-showcase.tsx:61 — Same `min-h-[80vh]`. Same fix.
- Polish src/components/home/hero-section.tsx:161-162 — Hero uses `min-h-[100dvh]` plus inline `minHeight: "max(760px, 100dvh)"`. On a 360x640 device the 760px floor introduces a forced scroll; intentional for "tall hero" feel but document the choice.

### Programs catalog — src/app/[locale]/programs/page.tsx (+ programs-catalog-client)

- High src/app/[locale]/programs/page.tsx:217 — Container uses `px-5 sm:px-8 lg:px-12` and `pt-28` (~112px). The `SiteShell` adds `pt-14 sm:pt-16` to `<main>`; combined that's fine, but on the page itself `pt-28` means the hero eyebrow sits ~6rem below the navbar bottom — extra empty space at 360px. Polish: drop to `pt-20 sm:pt-24`.
- High src/app/[locale]/programs/page.tsx:223 — Headline `text-[clamp(36px,6.4vw,68px)]` on 320px clamps to 36px — fine. With Turkish/Spanish strings ("Programas construidos como productos.") the headline can go three lines. `tracking-[-0.02em]` plus three lines is dense — verify line-height.
- Polish src/components/programs/programs-catalog-client.tsx:99-108 — `FilterPill` has `min-h-[36px]` (below 44px tap target). Tailwind class `min-h-[36px]` documented; pills are touch targets. Fix: `min-h-[44px]` or wrap in larger hit-area. Same issue on the clear button (line 215) and reset filters button (line 259).
- Polish src/components/programs/programs-catalog-client.tsx:101 — `active:scale-[0.97]` exists, but no `hover:` modifier with `focus-visible:` ring on the FilterPill. Keyboard users get default focus ring only. Add `focus-visible:ring-2 focus-visible:ring-cyan-300/60`.

### Program detail — src/app/[locale]/programs/[slug]/page.tsx

- Critical src/app/[locale]/programs/[slug]/page.tsx:236 — `<section className="mx-auto w-full max-w-[800px] ...">` is fine because `max-w-[800px]` is a max, not a fixed width. But it's nested inside `grid-cols-[1.05fr_0.95fr]` only at `xl:`. Below xl the section is the full column — OK. False alarm on first scan; leave.
- Critical src/components/program-detail-hero.tsx:112 — `<dl className="mt-8 grid grid-cols-3 gap-x-4 gap-y-3 ...">` with three Spec cells whose values include localized strings like "Beginner to Advanced" or "Adjustable strength". At 320px each col is ~88px wide; values truncate via `truncate` (line 162). Truncating the program difficulty is bad UX. Fix: `grid-cols-2 sm:grid-cols-3` or remove `truncate` and let it wrap.
- Critical src/components/program-detail-hero.tsx:70 — Hero section uses `-mx-4 sm:-mx-6 lg:mx-[calc(-50vw+50%)] lg:w-screen lg:max-w-[100vw]`. The `lg:w-screen lg:max-w-[100vw]` causes a full-bleed hero. On mobile the `-mx-4` reaches into the parent's `px-4` — confirms intent to break out of the page padding. But the parent `<div className="mx-auto max-w-6xl px-4 pt-4">` is on the route page (line 211) and `program-detail-hero` is rendered as a sibling outside that div (line 220). The `-mx-4` then breaks out of the program-detail page's outer flex/grid gap. Verify visually at 320px.
- Critical src/components/program-detail-hero.tsx:121 — Visual block `min-h-[280px] ... sm:min-h-[380px]` plus a 2-column `grid-cols-[0.72fr_1fr]` of stat tiles (line 127). At 320px each tile is roughly 120px wide; legible but title ("Goal", "Setup", "Level") truncation likely on Arabic strings. Polish: switch to single column below sm.
- High src/components/program-detail-hero.tsx:42-67 — Pointer-tracked parallax (`--hero-y`) hooked to scroll. Honors `prefers-reduced-motion` correctly (line 46). Clean.
- High src/app/[locale]/programs/[slug]/page.tsx:484-507 — Paid preview banner uses `min-h-[48px]` primary CTA and `min-h-[44px]` secondary. Good. Wraps via `flex-wrap` on the inner `gap-3` — works.
- High src/app/[locale]/programs/[slug]/page.tsx:443 — `<aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">` is sticky only at xl. Below xl, the StickyPurchaseRail card displays inline above the body content order? No — it renders as the second grid item in `xl:grid-cols-[1.05fr_0.95fr]`. Below xl it's a single column, so the rail appears below the description. That conflicts with the `MobileCtaBar` which also shows below xl (line 511 conditional). Result: at 768px users see both the inline rail card and the bottom-fixed CTA. Verify intent — likely the rail card should be `xl:block hidden` so only the mobile-cta-bar shows below xl.
- High src/app/[locale]/programs/[slug]/page.tsx:267-281 — Locale-switcher chips use `<Link className="rounded-full border ... hover:border-white/30 hover:text-white">` with no `focus-visible:` styling and no `active:` state. Tap targets are `px-3 py-1.5 text-xs` ~30px tall — below 44px. Fix: add `min-h-[36px]`-min plus focus-visible ring.
- High src/components/sticky-purchase-rail.tsx (referenced from line 444) — Not read in this audit pass; verify it has `min-h-[44px]` CTA and proper `pb-[env(safe-area-inset-bottom)]` if it ever becomes fixed below xl.
- Polish src/components/mobile-cta-bar.tsx:42-48 — Correctly uses `pb` via inline `style={{ paddingBottom: "env(safe-area-inset-bottom)" }}` and is gated `xl:hidden`. Good. CTA `min-h-[44px]` met.

### Diets index/detail — src/app/[locale]/diets/page.tsx, src/app/[locale]/diets/[slug]/page.tsx

Both files are pure redirects — no UI. Clean.

### TJAI gate — src/app/[locale]/ai/page.tsx

Pure server-side gate that redirects to `/login`, `/tjai`, or renders `<TJAIHub>`. Clean.

### TJAI public landing — src/app/[locale]/tjai/page.tsx (+ tjai-public-landing)

- Critical src/components/tjai-public-landing.tsx:280 — Training schedule table is `overflow-x-auto` wrapping a `min-w-full text-sm` table with 4 columns. Good — horizontal scroll is preserved instead of breaking layout. Polish: add `[-webkit-overflow-scrolling:touch]` for iOS momentum.
- Critical src/components/tjai-public-landing.tsx:281 — Table cells `px-3 py-2 text-sm` give ~36px row height. Below the 44px tap target, but rows aren't tappable, so it's read-only — fine.
- High src/components/tjai-public-landing.tsx:170-174 — `TJHeroStage` rendered with `hidden lg:block`. Clean — no touch impact. The hero CTA at line 188 has `min-h-[50px]` — meets 44px.
- High src/components/tjai-public-landing.tsx:269-277 — Tab buttons "training/nutrition/macros" use `<button className="rounded-lg px-4 py-2 text-sm">` with no `min-h-` and no focus-visible styling. Tap target ~32px. Fix: `min-h-[44px]` and `focus-visible:ring`.
- High src/components/tjai-public-landing.tsx:318 — Pricing grid `grid gap-4 md:grid-cols-2 xl:grid-cols-4`. Good. The `Best value` badge uses `start-5` (logical) — RTL safe.
- Polish src/components/tjai-public-landing.tsx:362-368 — "Choose" links rely on icon+text only with no underline and no focus-visible state beyond color change.

### TJAI hub — src/components/tjai/tjai-hub.tsx

- Critical src/components/tjai/tjai-hub.tsx:157-184 — Tab nav uses `flex flex-wrap gap-1` of tab buttons. At 320px four tabs (`My Plan`, `Chat`, `Meal Swap`, `Progress`) with `px-5 py-2.5 text-sm` and 16px-padding icons wrap to 2 rows — acceptable. Each button has no `min-h-[44px]`; with `py-2.5 text-sm` it's ~38px. Below tap target. Fix: `min-h-[44px]`.
- High src/components/tjai/tjai-hub.tsx:115-121 — Decorative `<TJHeroStage variant="neural" speed={0.6} intensity={0.7} />` is `hidden ... lg:block` so no mobile cost. Good.
- High src/components/tjai/tjai-hub.tsx:151-153 — `<a className="text-xs font-semibold text-accent hover:text-white">Upgrade →</a>` uses bare `<a>` (should be Next `Link`) — not a mobile issue but flagging.

### Site shell + nav — src/components/site-shell.tsx, src/components/shell/*

- Critical src/components/shell/site-side-overlay.tsx:283-293 — `<button>` (open menu) is `h-10 w-10` = 40px. Below 44px tap target on iOS. Sits at `fixed start-3 top-3` overlapping the topbar's logo area. Fix: `h-11 w-11`.
- Critical src/components/shell/site-side-overlay.tsx:312-318 — Side panel is `w-full max-w-[820px]`. At 360px viewport, `w-full` (= 360px) is correct — full-screen drawer. Good. The panel uses logical `start-0`, `border-e` — RTL safe.
- High src/components/shell/site-side-overlay.tsx:322-329 — Close button `h-9 w-9` = 36px tap target. Fix: `h-11 w-11`.
- High src/components/shell/site-side-overlay.tsx:337 — Inner grid is `grid sm:grid-cols-2 lg:grid-cols-4` with `gap-x-10 gap-y-7`. At 320px (`<sm`) it's a single column — clean.
- High src/components/shell/site-side-overlay.tsx:344-368 — Menu links use `min-h-[36px]` with `focus-visible:ring-2 focus-visible:ring-accent/60`. Below 44px tap target. Fix: bump to `min-h-[44px]`.
- High src/components/shell/site-top-bar.tsx:91 — Header is `h-14 sm:h-16`. Good. `SiteShell` `<main>` line 51 uses matching `pt-14 sm:pt-16`. Verified pair.
- High src/components/shell/site-top-bar.tsx:96-127 — Center nav is `hidden md:flex` — desktop only. On mobile only the logo (left) and account button (right) show; the hamburger menu lives in `site-side-overlay.tsx` at top-3. Good split.
- High src/components/shell/site-top-bar.tsx:104-122 — Tab links have `min-h-[36px]` plus `hover:text-white` and `aria-current` styling. No `focus-visible:` styling. Fix: add `focus-visible:ring-2 focus-visible:ring-accent/60 rounded`.
- Polish src/components/shell/site-top-bar.tsx:129-142 — Account button has `min-h-[36px]`, below 44px. Wrap with larger hit area or `min-h-[44px]`.
- Polish src/components/shell/site-top-bar.tsx:80 — Header `z-40`. Mobile-cta-bar is also `z-40` (line 43) and the side-overlay open trigger is `z-40` (line 284); the side-overlay panel itself jumps to `z-[60]`. The competition between top-bar and mobile-cta-bar is benign because they're at opposite ends of the viewport, but documenting: any new floating element should use `z-30` or `z-50` to avoid stacking ambiguity.

### Program card — src/components/program-card.tsx

- Critical src/components/program-card.tsx:25-49 — `useCard3D` mouse-driven tilt fires on every `onMouseMove` event. There is **no touch fallback** in the card itself — the wrapping `TiltCard` in immersive-home (line 444) gates by `isTouch`, but on the catalog page (`programs-catalog-client.tsx:232-244`) `<ProgramCard>` is rendered without that gate. On mobile this means: (a) `mousemove` doesn't fire from touches, so the tilt CSS vars never update — visually fine, but (b) the parent `<div>` has `onMouseMove` and `onMouseLeave` attached unconditionally, attaching listeners even on phones. Listeners are passive, no major perf impact, but cleaner to gate.
- High src/components/program-card.tsx:166-175 — Title block `pb-4 px-4` with `line-clamp-2`. Good.
- High src/components/program-card.tsx:184 — `dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-2"` — same column count below sm and at sm. The `sm:grid-cols-2` is redundant. Polish only.
- High src/components/program-card.tsx:286 — `Link` uses `focus:outline-none focus-visible:border-accent/45`. Good.
- Polish src/components/program-card.tsx:202-208 — Pointer spotlight `radial-gradient(220px circle at var(--mx,50%) var(--my,50%) ...)` is purely decorative; on touch the `--mx`/`--my` defaults to 50% which is fine.

### Mobile CTA bar — src/components/mobile-cta-bar.tsx

Mostly clean (see Program-detail entry above). One nit:

- Polish src/components/mobile-cta-bar.tsx:38-47 — `bg-[#0B0D10]/82` — `/82` opacity isn't a valid Tailwind opacity stop (closest is `/80` or arbitrary `/[0.82]`). Probably renders as 100% on some Tailwind setups. Verify build emits the right value.

## Cross-cutting issues

1. **Tap-target sizing under 44px** — Multiple navigational/interactive elements set `min-h-[36px]` (TopBar tabs, side-overlay menu items, side-overlay menu/close icons, FilterPills, locale switcher chips, TJAI hub tabs, TJAI public-landing tabs, account button). Below the 44px iOS guideline. Roughly **8 locations**. Recommend a project-wide audit-and-bump.

2. **Missing `focus-visible:` styling on hover-only interactive elements** — `hover:text-white`, `hover:border-...` patterns without paired `focus-visible:` ring on FilterPill (programs-catalog-client.tsx:99), SiteTopBar tabs (site-top-bar.tsx:108), locale-switcher chips (programs/[slug]/page.tsx:272), TJAI public landing tabs (tjai-public-landing.tsx:269). Roughly **6 locations**.

3. **Pointer-driven 3D without explicit touch fallback** — `cinematic-3d-impl.tsx:62-72` `PointerCamera` has no reduce-motion or touch short-circuit; `program-card.tsx:25-49` `useCard3D` always attaches mouse listeners (gating happens only at `immersive-home` consumer level, not at `programs-catalog-client`). 2 components, 3 consumer paths.

4. **Body copy at `text-xs`** — `hero-section.tsx:40` HeroMetric hint. Single instance in audited scope, but worth flagging because the hint is read on entry. Many `text-[10px]`/`text-[11px]` usages exist but they are labels (uppercase eyebrow, badge), which is acceptable.

5. **`min-h-[80vh]` instead of `dvh/svh`** — `cinematic-3d-act.tsx:54`, `spline-showcase.tsx:61`. Two files. iOS dynamic-chrome behavior: bottom bands appear/disappear on scroll. Switch to `min-h-[80svh]`.

6. **TJAI hub + program-detail rail double-show below xl** — `programs/[slug]/page.tsx:443` has the inline rail card visible at all breakpoints, but the `MobileCtaBar` also shows below xl. Visually duplicates the purchase decision. Decide one.

7. **`useIsTouchDevice` flash-of-wrong-state** — `immersive-home.tsx:53-59` initializes `useState(false)` then resolves in effect. First paint runs `TiltCard` enabled, second paint disables. Not catastrophic but causes a one-frame mouse-tilt prep on phones.

## Recommended fix order (Phase C input)

1. Critical: Gate `Cinematic3DSceneImpl` `PointerCamera` on `reduce && !isTouch` props from `Cinematic3DAct` (cinematic-3d-impl.tsx:62-72, cinematic-3d-act.tsx:24).
2. Critical: Fix `program-detail-hero.tsx:112` Spec grid — `grid-cols-2 sm:grid-cols-3` and remove `truncate` so localized values can wrap.
3. Critical: Reduce TJAI section `minHeight` below `lg` — `immersive-home.tsx:471-514`.
4. Critical: Bump tap targets to `min-h-[44px]` on TJAI hub tabs (tjai-hub.tsx:169), TJAI public-landing tabs (tjai-public-landing.tsx:269), side-overlay menu/close buttons (site-side-overlay.tsx:284, 322).
5. Critical: Decide the program-detail rail vs mobile-cta-bar duplication below xl (programs/[slug]/page.tsx:443 + 511).
6. High: Add `focus-visible:ring-2 focus-visible:ring-accent/60` plus `min-h-[44px]` on FilterPill (programs-catalog-client.tsx:99), TopBar tabs (site-top-bar.tsx:108), locale chips (programs/[slug]/page.tsx:272), side-overlay menu links (site-side-overlay.tsx:344).
7. High: Switch `min-h-[80vh]` to `min-h-[80svh]` on `cinematic-3d-act.tsx:54` and `spline-showcase.tsx:61`.
8. High: Pass `pointerReactive={!reduce && !isTouch}` from `hero-section.tsx:194` to TJHeroStage.
9. High: Bump `text-xs` -> `text-[13px]` on `HeroMetric` hint copy (`hero-section.tsx:40`).
10. Polish: Lazy-init `useIsTouchDevice` to avoid first-frame flash (immersive-home.tsx:53).
11. Polish: Verify `bg-[#0B0D10]/82` renders as expected (mobile-cta-bar.tsx:43).
12. Polish: Drop redundant `sm:grid-cols-2` on program-card spec grid (program-card.tsx:184).

## Needs runtime verification (Phase A.5)

- iOS Safari smoothness of `Cinematic3DSceneImpl` at 375px / 6.1" device — confirm Sparkles + 3 torus rings + icosa wireframe sustain 60fps, or acceptable degradation. Static analysis can't say.
- Hero 3D `TJHeroStage` neural variant on a phone GPU — confirm pointermove listener cost is 0 when `pointerReactive={!reduce}` and the hand never moves over the canvas.
- Arabic RTL layout of the hero ghost-text decorations (`hero-section.tsx:174-179`) — `start-[-5%]` plus `dir=rtl` could cause horizontal scroll.
- Real device tap-success rate on TJAI hub tabs at `py-2.5` (~38px height) before applying the 44px bump — measure failure rate.
- Verify whether the program-detail rail card actually shows below xl (CSS audit suggests yes; runtime click-through confirms).
- `MobileCtaBar` appearance over iOS home indicator — inline `paddingBottom: "env(safe-area-inset-bottom)"` should work but iOS 17/18 PWAs sometimes don't pick up the env value when `position: fixed` with `inset-x-0`.
- Spline scene (when `NEXT_PUBLIC_SPLINE_HERO_SCENE` is set) on a 375px iPhone — Spline runtime is heavy, may need explicit `pointer-events-none` overlay on touch.
- Check if `MobileCtaBar` and `SiteTopBar` are simultaneously visible above an open `SiteSideOverlay` on small viewports (z-40 vs z-[60]).

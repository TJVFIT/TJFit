# TJFit Website Overhaul Loop — 2026-05-22

Self-paced loop turning TJFit toward a "whole new website" feel: better
bundles, translations, design, UI/UX, animations, 3D, copy, layout, working
functions, better AI/chatbot. One complete, substantive improvement per
iteration — not micro-polish.

## Charter / guardrails

- One real task per iteration, finished fully. Verify, commit, push.
- Brand: cyan / sky / blue / black ONLY. Violet/purple/indigo/amber/gold are
  banned — ignore the Codex prompt's `--accent-2 #A78BFA`, it is wrong.
- Payments = Paddle (not Stripe).
- i18n locales: en / tr / ar / es / fr. Never ship a key in fewer than all 5.
  Turkish diacritics correct; Arabic proper hamzas + RTL logical properties;
  French full accents.
- Motion-safe gated, no jank, no new heavy deps.
- typecheck + lint + tests every iteration; build when routes / 3+ files touched.
- Branch `claude/design-upgrade-2026-05-20`, conventional commits. Push branch.
  Merge to main only after a green build.
- Never touch payment webhooks / RLS / auth middleware / .env unless the task
  is explicitly that.

## DONE

- **Iter 1** — i18n the `/bundles` listing page. New `src/lib/bundles-copy.ts`
  (`getBundlesCopy`) with all page + grid chrome strings in en/tr/ar/es/fr;
  wired `bundles/page.tsx` (incl. localized `generateMetadata`) and
  `bundle-grid.tsx`. Build green, live on main.
- **Iter 2** — i18n the `/bundles/[slug]` detail page. Extended
  `bundles-copy.ts` with a `detail` block (~26 strings/fns × 5 locales);
  wired `[slug]/page.tsx` + `detail-effects.tsx` (DownloadButton/ShareButton/
  AtAGlance now take label props). Build green, live on main.
- **Iter 3** — finished TJAI chatbot i18n in `tjai-chat.tsx`. Extended
  `tjai-chat-copy.ts` with followUps chips, composer hint, fallback/connection/
  api-error messages, upgrade-prompt copy, and trial-counter functions across
  all 5 locales. Build green, live on main.
- **Iter 4** — finished `tjai-chat-standalone.tsx` i18n. Its `COPY` only had
  en+ar; added tr/es/fr (full, accented) + new keys (starter, copyLabel,
  refine, tryLabel, followUps, quickPrompts, composerEmptyHint, errorGeneric,
  errorTimeout). Fixed the `t` selector to `COPY[locale]`. Build green, live.
- **Iter 5** — bundle detail sticky mobile purchase bar. New `StickyBuyBar`
  in `detail-effects.tsx`: slides up once past the hero, tucks away near the
  footer CTA, mobile-only, motion-safe gated, localized Download label.
  Build green, live on main.
- **Iter 6** — RTL correctness pass on the bundles experience. Fixed the
  listing title halo + coach-box corner glow offsets, mirrored the 3
  directional arrows (listing Details, detail back, detail Ask-TJAI) via
  `rtl:rotate-180` + flipped hover nudges, and made the PhaseStrip connector
  draw + tracer dot travel start→end (`rtl:origin-right` + logical
  `insetInlineStart`). Build green, live on main.
- **Iter 7** — localized bundle card content. New `bundle-localization.ts`
  with translated name + hook + goalLabel for all 12 bundles in tr/ar/es/fr.
  Build green, live on main.
- **Iter 8** — localized the rest of the bundle prose. Extended
  `bundle-localization.ts` to a unified `localizeBundle` carrying
  programTitle + dietTitle + description for all 12 bundles × 4 locales;
  wired the card subline, detail description, At-a-glance Training/Diet rows,
  and the nutrition-section heading. Bundle prose is now fully localized;
  only the structured data tables remain English. Build green, live on main.
- **Iter 9** — i18n the homepage Bundles Catalog Teaser section. Added a
  `homeTeaser` block to `bundles-copy.ts` (eyebrow/body/cta × 5 locales),
  reused `title` + `filterLabels` for the heading + goal pills, wired the
  `immersive-home` section + `BundleTeaserCTA` (now takes a label, count
  driven by `BUNDLES.length`, arrow RTL-mirrored). Build green, live.
- **Iter 10** — related-bundles strip on the detail page. New "More bundles"
  section after the footer CTA: same-goal-first, capped at 3, compact link
  cards (goalLabel + localized name + Details arrow). Localized via
  `detail.moreBundlesTitle` (5 locales) + reuse of `localizeBundle`;
  RTL-safe, motion-safe hover lift. Build green, live on main.
- **Iter 11** — i18n the homepage TJAI/rail/stats strips. New
  `home-sections-copy.ts` (`getHomeSectionsCopy`) with the TJAI overview
  section (heading/body/cta), the 5 editorial-rail phrases, and the 3 stats
  labels × 5 locales; wired `immersive-home`. Build green, live on main.
- **Iter 12** — i18n the homepage features grid + platform-spec header.
  Extended `home-sections-copy.ts` with `platformSpec` (eyebrow + two-tone
  heading + body) and the 6 `features` cards × 5 locales; split the
  `immersive-home` features array into icon/accent `featureMeta` + localized
  title/desc. The homepage body is now fully localized. Build green, live.

## QUEUE (next up)

- Translate the bundle *structured data* in `src/lib/bundles.ts` — phases,
  nutrition, sampleTrainingDay, sampleMealDay. Large, multi-iteration.
- Bundle detail page: week-by-week accordion (needs week data added first).
- Localize the homepage error-boundary fallback copy (`[locale]/page.tsx`).
- Audit other top routes (programs, diets, dashboard) for hardcoded English.

## BACKLOG (drive-by notes, unfixed)

- `tjai-chat-copy.ts` — existing tr/es/fr suggestion-prompt strings are
  accent-stripped ("ozeti", "Resume", "entrainement"). Restore diacritics.

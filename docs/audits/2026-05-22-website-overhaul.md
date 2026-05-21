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
  `bundle-grid.tsx`. Build green.

## QUEUE (next up)

- Translate the bundle *content* catalogue in `src/lib/bundles.ts` (12 bundles:
  name, hook, goalLabel, descriptions, phases, nutrition, sample days) — large,
  may span several iterations.
- i18n the `/bundles/[slug]` detail page chrome.
- Bundle detail page: sticky mobile purchase bar, week-by-week accordion.
- RTL pass on `/bundles` (mirror the title halo offset + card arrow for `ar`).
- Better TJAI chatbot UX (streaming affordance, message states, empty state).
- Homepage hero copy + layout refresh.

## BACKLOG (drive-by notes, unfixed)

- (none yet)

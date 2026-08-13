# Visual QA protocol — the standing gate for every visual change

Created 2026-08-13 (WP-DESIGN-01 of the Ascension Plan). Exists because the
July 2026 prod outage shipped a homepage that passed tsc, 265 tests, and
`next build` while rendering nothing in a real browser. **Local gates provably
do not catch this class. The browser check is not optional.**

## When this protocol applies

Any change that a browser renders: components, pages, CSS/tokens, fonts,
motion, 3D, layout wrappers, `globals.css`, anything under `src/components/`
or `src/app/[locale]/`. If unsure, it applies.

## The checklist (run before merge, after the code gate passes)

1. **Dev server**: `preview_start` entry `tjfit-dev` (port 3020) — never run
   the dev server and `next build` at the same time (both write `.next/`).
2. **Load every touched route** in at least: `en`, `tr`, `ar`.
   - `tr`: confirm diacritics render (ü ğ ş İ present in served text)
   - `ar`: confirm `dir="rtl"` on the locale wrapper and layout doesn't break
3. **Widths**: 375 / 768 / 1280 (`resize_window`). No horizontal scroll at 375.
4. **Reduced motion**: toggle `prefers-reduced-motion` — content must be fully
   visible and functional with animations skipped (reveal-on-scroll content
   must not stay hidden).
5. **Console**: zero errors on every checked route (`read_console_messages`).
6. **Structure over pixels when the pane can't composite**: if screenshots are
   unavailable, verify via `read_page` / `get_page_text` / DOM queries
   (element present, `dir` correct, old ids absent). Verify i18n/SSR claims
   against SERVED BYTES (`curl | grep`), never the hydrated DOM.
7. **Stop the server**, then run `npx next build` (exit 0) as the last step.
8. Record in the commit message or WP notes: routes checked, locales checked,
   console status. A reviewing agent must be able to see WHAT was verified.

## Dark mode note

The site is dark-only by design — there is no light theme to check. Never
introduce a color that depends on a light background.

## Escalation rule

If the Browser pane stops compositing mid-session (screenshots time out, rAF
throttled), scroll/motion measurements are meaningless — pause layout-rhythm
work and switch to non-visual WPs. A 674-line homepage restructure attempted
without a working pane is exactly the July failure retried.

# TJFit — Design Review (2026-06-10)

Benchmark frame: Apple/Stripe/Linear (restraint, type discipline, motion
quality) and Nike/Gymshark (energy, conversion surfaces).

## Where the product stands

The 2026-06-01 rebrand + v6 "de-vibecode" pass already executed most of what a
premium review would demand:

- **Palette:** locked to obsidian `#050507` / violet `#7C3AED` / electric
  violet `#A855F7` / soft purple `#C4B5FD` / lavender `#EDE9FE`. Zero cyan
  remains in `src`; champagne/gold removed. (The May 3 brand audit in
  `docs/audits/v6/` predates this and is marked superseded.)
- **Typography:** Space Grotesk display + Manrope body via `next/font`
  variables, with Arabic letter-spacing and per-script line-height tuning —
  better multilingual type hygiene than most competitors.
- **Iconography:** lucide-react only; all functional emoji replaced with
  icons keyed to data (badges, goals, moods, reactions) — a genuine
  Linear-tier consistency move. Decorative emoji stripped from copy, emails,
  and AI prompts.
- **Motion:** scroll reveals retuned (travel 40→26px, blur 8→6px,
  easeOutExpo ~760ms, no whole-section scaling) — reads "expensive" rather
  than "template." Fake live counters removed (trust).
- **3D:** Three.js/Spline hero surfaces with a centralized palette
  (`components/3d/palette.ts`) keep brand lighting consistent.
- **Regression fixed:** 605 broken Tailwind arbitrary values (spaces inside
  `rgba()`) had silently disabled purple glows site-wide — repaired across
  108 files, so the glow language actually renders now.

## Gaps vs. the benchmark set

1. **Visual QA of glows in a real browser (High):** the rgba fix shipped
   without a rendered-pixel check. One pass over home/bundles/TJAI at
   390px/768px/1440px confirming glows, contrast, and RTL mirroring is the
   last mile. (Needs a human or a browser session — not possible from this
   CLI audit.)
2. **Pricing surfaces read "placeholder" (High, blocked on owner):** $0
   everywhere undermines the premium read more than any visual choice.
   Gymshark-tier merchandising needs real anchors, compare-at framing, and a
   single accent CTA per card — ready to apply the moment prices exist.
3. **Photography consistency (Medium):** hero illustrations are coherent;
   user-generated surfaces (transformations, blog) will drift — add a subtle
   duotone/violet-grade overlay treatment to keep UGC on-brand.
4. **Empty states (Medium):** dashboards/feeds have skeletons; ensure new-user
   zero-data states sell the next action (start TJAI, claim a bundle) instead
   of showing blank panels — Stripe-style empty states are conversion surfaces.
5. **Spacing rhythm (Low):** spot-checks look consistent (Tailwind scale);
   a full 8pt-grid sweep is polish-tier, post-launch.

## Verdict

Brand system: production-grade. Outstanding design work is one browser QA
pass + pricing-dependent merchandising, both tracked in the execution plan.

# Research blockers — TJFit launch overhaul mega-prompt

These are open questions that surfaced while researching the codebase to
write `prompts/CLAUDE_DESIGN_LAUNCH_OVERHAUL.md`. None block the design
session from starting — the mega-prompt picks defaults — but Joseph (or a
follow-up research pass) should resolve these to lock the brief tighter.

## B1 — Hero asset replacement timeline
Three hero PNGs in `/public/assets/hero/` (`hero-programs-bg.png`,
`hero-tjai-core.png`, `hero-nexus.png`) reportedly contain visible
generator artifacts (`TJfit.org` text, generator star marks) per
`docs/design-audit-2026.md:7,17`. The procedural CSS surfaces at
`src/app/globals.css:3454-3507` are the planned replacement. Question: do
we need bespoke vector art commissioned, or are the procedural CSS
surfaces final-quality? **Default in mega-prompt:** procedural surfaces
are final.

## B2 — Language count
`src/lib/home-luxury-copy.ts:170` claims `value: "10", label: "Languages
live"`. The actual locales in `src/lib/i18n.ts` are en/tr/ar/es/fr (5).
The Tailwind body fallback list (`globals.css:519-520`) supports
Arabic/Devanagari/Cyrillic glyph fallback, but we don't ship those locales.
**Default in mega-prompt:** correct en string to "5". If Joseph plans to
add hi/ru/ja later, the original "10" may have been forward-looking — but
shipping a wrong number today fails the credibility test.

## B3 — Coach roster status
`src/lib/home-luxury-copy.ts:235` says `emptyTitle: "Coach roster is
opening soon"`. Are there actually any verified coaches in
`src/lib/content.ts` `coaches` array, or is this empty at launch?
**Default in mega-prompt:** the homepage `<HomeCoachCta>` section renders
4 coach cards from `coaches.slice(0, 4)` (page.tsx:73). Assume non-empty.

## B4 — Equipment store scope
`src/app/[locale]/store/page.tsx` and `src/app/[locale]/equipment/page.tsx`
both exist. The store renders `<ComingSoonLaunchPage>`. Equipment renders
something different. Joseph's scope guard says "do NOT touch
Shopify/equipment store yet". Question: is `/equipment` also out of
scope, or only `/store`? **Default in mega-prompt:** treat both as
coming-soon polish only.

## B5 — Membership 3D scarab decision
`src/app/[locale]/membership/page.tsx:34` mounts `<TJHeroStage
variant="scarab">`. This is a deliberate Three.js / R3F luxury motif. The
mega-prompt instructs replacing it with a fitness kinetic frame. Question:
is the scarab a Joseph favorite that he wants to keep? If yes, override
the mega-prompt's E9 instruction. **Default in mega-prompt:** replace.

## B6 — Recomp goal category
`docs/audits/PROGRAMS_GAP.md:14` says the catalog has zero programs
explicitly tagged `recomp`. The /programs filter UI offers a `recomp` chip
(programs/page.tsx:285). Question: ship the chip with no results, hide the
chip, or relabel? **Default in mega-prompt:** keep chip visible — adds
catalog discoverability for a future program category.

## B7 — Card breathing on every page
`.tj-breathe` and variants are applied to program cards, diet cards. Should
coach cards, blog cards, transformation cards also breathe? **Default in
mega-prompt:** yes, apply `.tj-breathe-coach` to coach cards. Other cards
breathe is an open call — let Claude Design decide per surface density.

## B8 — Coming-soon gate behavior
Commit `65e2665` added "coming-soon gate that admins bypass". Where is the
production gate routed? Is the launch overhaul shipping to live tjfit.org
behind that gate, or going live? Mega-prompt assumes the design overhaul
ships into the gated environment first, then rolls out at launch.

## B9 — Fonts subsetting
Outfit + Manrope load via next/font with default subsets. Arabic glyphs
fall back to system fonts (Noto / Segoe UI). Question: should we add
Noto Sans Arabic via next/font for crisper Arabic display, at the cost of
~80kb extra font payload? **Default in mega-prompt:** no — keep system
fallback.

## B10 — Final hero CTA verb (Joseph approval)
The mega-prompt locks `"Start training — free"` as the primary hero CTA.
Joseph's existing en string is `"Start your transformation"`. The new verb
is shorter and more decisive but loses the "transformation" word that
appears elsewhere as a brand pillar. Open call — both work.

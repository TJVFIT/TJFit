# 0001 - Localize Hero Section Copy

Owner: Codex
Status: done
Priority: P1

## Finding
`npm run i18n:scan` reports hardcoded visible English in `src/components/home/hero-section.tsx`. Manual audit confirms the hero command panel, signal labels/values, live badge fallback, secondary CTA, metric labels/hints, and scroll cue are English literals in JSX/component data instead of typed locale copy.

## Scope / Allowlist
- src/components/home/hero-section.tsx
- src/components/immersive-home.tsx
- src/lib/home-luxury-copy.ts

## Plan
Move visible hero literals into `HomeLuxuryCopy.hero`, preserve locale order `en, tr, ar, es, fr`, and pass the typed hero copy into the hero component.

## Validation
- npm run build
- npm run i18n:verify

## Report
- Moved visible hero strings into `HomeLuxuryCopy.hero` for en, tr, ar, es, fr.
- Updated `HeroSection` to consume typed hero copy and `ImmersiveHome` to pass it through.
- `npm run build` passed.
- `npm run i18n:verify` was run; parity passed, scan still fails on pre-existing/broader candidates and style-literal false positives, including two non-user-facing rgba strings in this hero file.

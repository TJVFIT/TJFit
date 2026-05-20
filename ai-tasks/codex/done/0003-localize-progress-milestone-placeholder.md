# 0003 - Localize progress milestone target placeholder

Status: done
Owner: Codex
Priority: P1

## Finding
`src/components/progress-view.tsx` renders a visible English-only placeholder: `Target (e.g. "Bench 100kg")`.

## Scope
- `src/components/progress-view.tsx`
- `src/lib/feature-copy.ts`

## Plan
Add a typed progress copy key for the milestone target placeholder in all five locales, then swap the JSX literal to the copy lookup.

## Verification
- `npm run build`
- `npm run i18n:verify`

## Report
- Added `milestoneTargetPlaceholder` to the typed progress copy in all five locales.
- Replaced the English-only milestone target placeholder in `ProgressView` with `t.milestoneTargetPlaceholder`.
- `npm run build`: passed.
- `npm run i18n:verify`: failed on pre-existing global scan findings; targeted `Target (e.g. "Bench 100kg")` finding is cleared.

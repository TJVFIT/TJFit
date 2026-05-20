# 0007 - Localize TJAI result extra copy

Status: done
Owner: Codex
Priority: P1

## Finding
`TJAIResult` renders English-only extra-plan copy for Sunday meal prep and meal alternative modal states even though the component already receives typed TJAI copy.

## Scope
- `src/components/tjai/tjai-result.tsx`
- `src/lib/tjai-copy.ts`
- `src/lib/tjai-types.ts`

## Plan
Extend `TJAICopy.result` with typed keys for meal prep and alternative-meal UI, fill all five locales, and replace the hardcoded JSX strings with copy lookups.

## Verification
- `npm run build`
- `npm run i18n:verify`

## Report
- Extended `TJAICopy.result` with `mealPrep` and `alternatives` groups for all five locales.
- Replaced hardcoded TJAI result meal-prep and alternative-meal UI strings with typed copy lookups.
- `npm run build`: passed.
- `npm run i18n:verify`: failed on pre-existing global scan findings; targeted English literals are cleared, leaving style/ternary false positives in `tjai-result.tsx`.

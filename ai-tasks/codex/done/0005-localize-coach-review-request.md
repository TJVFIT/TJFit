# 0005 - Localize coach review request copy

Status: done
Owner: Codex
Priority: P1

## Finding
`CoachReviewRequest` is mounted in `TJAIResult` and renders visible English-only UI and state messages.

## Scope
- `src/components/tjai/coach-review-request.tsx`
- `src/components/tjai/tjai-result.tsx`
- `src/components/tjai/tjai-shell.tsx`
- `src/lib/coach-review-request-copy.ts`

## Plan
Add a typed copy module for all five locales, thread `locale` through `TJAIResult`, and replace hardcoded strings in `CoachReviewRequest` with copy lookups.

## Verification
- `npm run build`
- `npm run i18n:verify`

## Report
- Added `src/lib/coach-review-request-copy.ts` with typed copy for all five locales.
- Threaded `locale` from `TJAIShell` to `TJAIResult` and into `CoachReviewRequest`.
- Replaced English-only title, description, bullet, CTA, and state copy with typed copy lookups.
- `npm run build`: passed.
- `npm run i18n:verify`: failed on pre-existing global scan findings; coach review English literals are cleared, with one remaining scanner false positive on a ternary expression.

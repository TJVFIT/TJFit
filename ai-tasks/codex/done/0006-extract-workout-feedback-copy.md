# 0006 - Extract workout feedback prompt copy

Status: done
Owner: Codex
Priority: P1

## Finding
`npm run i18n:scan` flags the localized feedback prompt copy in `src/components/tjai/workout-feedback-prompt.tsx` because the `Record<Locale, ...>` lives inline in a `.tsx` component.

## Scope
- `src/components/tjai/workout-feedback-prompt.tsx`
- `src/lib/workout-feedback-copy.ts`

## Plan
Move the existing typed locale record into a pure lib copy module and have the component import a getter.

## Verification
- `npm run build`
- `npm run i18n:verify`

## Report
- Moved the existing workout feedback prompt `Record<Locale, ...>` into `src/lib/workout-feedback-copy.ts`.
- Updated `WorkoutFeedbackPrompt` to import `getWorkoutFeedbackCopy(locale)` and the shared rating type.
- `npm run build`: passed.
- `npm run i18n:verify`: failed on pre-existing global scan findings; targeted workout feedback prompt findings are cleared.

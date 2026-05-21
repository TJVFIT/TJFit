# TJFit Loop Audit

## Cycle 001

- `src/lib/programs/index.ts` registers only the structured `comeback` program.
- `src/lib/programs/programs/comeback-12w/index.ts` exports week 1 only; weeks 2-12 still await authoring.
- `src/lib/diets/index.ts` keeps the structured diet registry on a placeholder diet with no weeks.
- Program and diet translation seed helpers still fall back to `__TRANSLATE__` markers outside English.
- Bundle catalog filtering, card CTA text, and supporting labels are hardcoded English in the bundle flow.
- Bundle detail copy includes hardcoded English labels and metadata text outside the i18n message files.
- Bundle catalog cards do not yet present the required duration, level, and location subline consistently.
- Bundle card media uses a `16/10` ratio instead of a single approved `16:9` or `4:5` catalog ratio.
- Bundle catalog and detail components use arbitrary Tailwind text sizes such as `text-[10px]` and `text-[11px]`.
- Bundle catalog and detail effects include hardcoded color values outside design-token surfaces.
- `messages/en.json` key parity currently matches `tr`, `ar`, `es`, and `fr` by flattened-key count.
- `src/app/api/webhooks/gumroad/route.ts` has a refund/revoke-access TODO that is outside loop safety scope.

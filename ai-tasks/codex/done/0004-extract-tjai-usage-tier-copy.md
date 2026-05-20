# 0004 - Extract TJAI usage tier table copy

Status: done
Owner: Codex
Priority: P1

## Finding
`npm run i18n:scan` flags the localized pricing table copy in `src/components/pricing/tjai-usage-tier-table.tsx` because the `Record<Locale, ...>` lives inline in a `.tsx` component.

## Scope
- `src/components/pricing/tjai-usage-tier-table.tsx`
- `src/lib/tjai-usage-tier-copy.ts`

## Plan
Move the existing typed locale record into a pure lib copy module and have the component import a getter.

## Verification
- `npm run build`
- `npm run i18n:verify`

## Report
- Moved the existing TJAI usage tier `Record<Locale, ...>` out of the TSX component into `src/lib/tjai-usage-tier-copy.ts`.
- Updated `TjaiUsageTierTable` to use `getTjaiUsageTierCopy(locale)` with no layout or styling changes.
- `npm run build`: passed.
- `npm run i18n:verify`: failed on pre-existing global scan findings; targeted `tjai-usage-tier-table.tsx` scan findings are cleared.

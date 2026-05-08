# Codex 0001 — Immersive home: “10 languages” → five supported locales

## Problem

`src/components/immersive-home.tsx` still advertises **10 languages** in multiple places while routing and config support **five** locales (per Track C / hero alignment).

Places to align (grep `10`, `Languages`, `locales` in file):

- Feature card title `"10 Languages"` and description copy.
- Marquee / string `"10 languages"`.
- `<CountUp target={10} label="Languages" />` (should use `5`).

## Allowlist (max 5 paths)

- `src/components/immersive-home.tsx`

## Acceptance criteria

- [ ] User-facing copy and counts reflect **5** supported languages/locales; no lingering “10” in that narrative unless referring to a different metric (e.g. pricing) with clear context.
- [ ] `npm run build` and `npm run lint` pass if Codex runs them in scope.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

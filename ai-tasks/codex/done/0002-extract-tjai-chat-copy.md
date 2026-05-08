# 0002 - Extract TJAI Chat Prompt Copy

Owner: Codex
Status: done
Priority: P1

## Finding
`npm run i18n:scan` flags `src/components/tjai/tjai-chat.tsx` prompt and label strings. The strings are localized inline, but because they live directly in `.tsx`, the scanner reports them as hardcoded UI strings.

## Scope / Allowlist
- src/components/tjai/tjai-chat.tsx
- src/lib/tjai-chat-copy.ts

## Plan
Move the inline chat copy record into a typed lib copy module with locale order `en, tr, ar, es, fr`, then import it from the component.

## Validation
- npm run build
- npm run i18n:verify

## Report
- Moved inline `CHAT_COPY` out of `src/components/tjai/tjai-chat.tsx` into `src/lib/tjai-chat-copy.ts`.
- Component now reads copy via `getTJAIChatCopy(getChatLocale())`.
- `npm run build` passed.
- `npm run i18n:verify` was run; parity passed, scan still fails on other existing files, but `tjai-chat.tsx` prompt findings are cleared.

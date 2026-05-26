# Plan 2 — Loop state

Driven by recurring `/loop` cron job `1d297b47` (`*/2 * * * *`). Each fire reads this file, picks the first non-protected pending phase, executes, commits, updates this file.

**Started:** 2026-05-27
**Total phases:** 28 (22 trust + 6 visual upgrade)
**Protected (⚠) phases:** 3, 5, 7, 8, 18, 19 — auto-skipped, surfaced at end.

| # | Group | Phase | Status | Commit | Note |
|---|---|---|---|---|---|
| 1 | A | Strip TJCOIN from membership-tier/home-sections/email-templates/subscription/i18n copy | done | ba8b29d | i18n.ts had no coin refs (false flag from earlier grep) |
| 2 | B | ⓘ Audit medical-safety guards → docs/audits/tjai-safety-2026-05.md | done | fcfeda5 | 4 P1 gaps surfaced: pregnancy / reds / rhabdo / self_harm. Addendum is EN-only. |
| 3 | B | ⚠ Edit safety-guard prompts | blocked: needs-approval | — | Manual phase |
| 4 | B | Verify /api/tjai/memory GET/DELETE/PATCH coverage | done | sha-next | GET + DELETE existed; PATCH added (edit fact text, 280 char cap, owner-only). Pause is in /api/tjai/settings.memory_enabled. |
| 5 | B | ⚠ TJAI generate refund-safety + structured output | blocked: needs-approval | — | Manual phase |
| 6 | C | ⓘ Bundle PDP audit → docs/audits/bundle-pdp-2026-05.md | pending | — | — |
| 7 | C | ⚠ Diet registry honesty pass | blocked: needs-approval | — | Manual phase |
| 8 | C | ⚠ Program registry honesty pass | blocked: needs-approval | — | Manual phase |
| 9 | D | ⓘ TJAI streaming/stop/retry audit → docs/audits/tjai-stream-2026-05.md | pending | — | — |
| 10 | D | ⓘ Memory dashboard gap audit → docs/audits/tjai-memory-2026-05.md | pending | — | — |
| 11 | D | ⓘ Account deletion + data export audit → docs/audits/account-deletion-2026-05.md | pending | — | — |
| 12 | D | ⓘ Activation event inventory → docs/audits/activation-events-2026-05.md | pending | — | — |
| 13 | E | themeColor → viewport migration | pending | — | — |
| 14 | E | i18n:verify hardcoded-string fix | pending | — | — |
| 15 | E | Form/error microcopy pass (role="alert") | pending | — | — |
| 16 | E | ⓘ Mobile + RTL audit → docs/audits/mobile-2026-05.md | pending | — | — |
| 17 | E | ⓘ Voice/TTS audit → docs/audits/tjai-voice-2026-05.md | pending | — | — |
| 18 | F | ⚠ Supabase RLS spot-check | blocked: needs-approval | — | Manual phase |
| 19 | F | ⚠ Page guards for /programs/upload + /blog/write | blocked: needs-approval | — | Manual phase |
| 20 | F | Pre-merge full check → docs/audits/pre-merge-2026-05.md | pending | — | — |
| 21 | G | Hero animations (luxury-home.tsx) | pending | — | — |
| 22 | G | Bundle card hover + entry transitions | pending | — | — |
| 23 | G | TJAI chat polish (typing indicator, slide-in, scroll-to-bottom) | pending | — | — |
| 24 | G | Locale-route page transitions (Next.js template.tsx) | pending | — | — |
| 25 | G | Confetti on first-value events | pending | — | — |
| 26 | G | Skeleton states (bundles/hub/profile/dashboard/leaderboard) | pending | — | — |
| 27 | G | Streak banner + badge toast polish | pending | — | — |
| 28 | H | Write LASTCLAUDECODE_v2.md handoff | pending | — | — |

## Convention

- `pending` — ready to run.
- `done: <sha>` — completed in commit.
- `blocked: <reason>` — manual review required.

## Cron job

`1d297b47` — `CronDelete` to cancel.

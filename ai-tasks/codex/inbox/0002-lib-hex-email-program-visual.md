# Codex 0002 — Lib: hex in email templates & program card visual

## Problem

Audit pass 2 lists hex literals under `src/lib/` (email HTML and visual helpers). Tokenize or centralize against `tailwind.config` / `TJ_PALETTE` as appropriate for non-React outputs.

## Allowlist (max 5 paths)

- `src/lib/email-templates.ts`
- `src/lib/program-card-visual.ts`

## Acceptance criteria

- [ ] Hex in allowlisted paths resolved per project token strategy (or documented exception for email-client constraints).
- [ ] Build/lint as applicable for touched TS.

## Report

(Filled when done: branch, PR link, commit SHA, notes)

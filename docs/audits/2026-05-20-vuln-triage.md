# Dependency vulnerability triage — 2026-05-20

`npm audit` reports **17 vulnerabilities** (6 moderate, 6 high, 5 critical) after restoring `node_modules`. This is the autonomous loop's read-only triage — **no auto-fix run**.

## TL;DR

All 5 critical and most high-severity findings are **build-time only**, transitively pulled in through `to-ico` (favicon generator in `scripts/generate-brand-assets.mjs`). None of these packages ship in the Next.js runtime bundle. The two findings that *do* matter for production are `ws` and `tough-cookie` (transitive through Sentry / Supabase tooling) — both fixable with a non-breaking `npm audit fix`.

## Findings grouped by impact

### Group A — Build-time only (devDep `to-ico` chain)
*Severity: 5 critical + 4 high. **Production impact: none.***

| Package | Severity | Source | Notes |
|---|---|---|---|
| `form-data` | critical | via `request` → `jimp` → `to-ico` | unsafe boundary RNG |
| `jimp` | critical | via `to-ico` | bundle of issues |
| `jpeg-js` | high | via `jimp` | infinite loop on crafted JPEG |
| `minimist` | critical | via `mkdirp` → `jimp` | prototype pollution |
| `request` | — | via `jimp` | deprecated package |
| `tough-cookie` | moderate | via `request` | prototype pollution |
| `url-regex` | high | via `jimp` | ReDoS |

**Action:** Replace `to-ico` with a maintained alternative (`png-to-ico`, or call `sharp` directly — which is already a dep). One file affected: [scripts/generate-brand-assets.mjs](scripts/generate-brand-assets.mjs). Defer until the favicon is regenerated.

### Group B — Lint-time (devDep `eslint-config-next` v14)
*Severity: 2 high. **Production impact: none.***

`@next/eslint-plugin-next` 14 → `glob` 10.2–10.4 has a CLI command-injection issue (CVE-2024-…). The fix is `eslint-config-next@16.2.6`, which is a **major bump** and may require ESLint v9 migration.

**Action:** Bump `eslint-config-next` to v16 in a separate PR; expect rule realignment. Low urgency since `glob -c` is not invoked anywhere in this repo.

### Group C — Runtime, fixable without breaking changes
*Severity: 1 moderate. **Production impact: low.***

| Package | Severity | Action |
|---|---|---|
| `ws` (8.0.0–8.20.0) | moderate | `npm audit fix` → bumps to 8.21+. Used by Supabase realtime; non-breaking. |

**Action:** Run `npm audit fix` (no `--force`). Verify with `npm run build` and a typecheck.

### Group D — Tough-cookie (transitive, low risk)
Reported under `to-ico` chain but also surfaces in some Supabase tooling depending on version. Fix lives in Group A's replacement of `to-ico`.

## Recommended next steps

1. **Now (autonomous-safe):** run `npm audit fix` for the Group C `ws` bump only — non-breaking, no devDep changes.
2. **Next deploy:** replace `to-ico` in `scripts/generate-brand-assets.mjs` with `sharp.toFormat("ico")` or `png-to-ico`. Removes ~13 transitive vulns in one shot.
3. **Backlog:** schedule the `eslint-config-next` v14 → v16 migration; budget half a day for rule realignment.

## Why no auto-fix tonight

The loop's safety contract excludes `npm audit fix --force` (would force semver-major downgrades / upgrades that can silently break the build). `npm audit fix` without `--force` would only touch a couple of packages and is fine, but the policy in this loop is to *report only* on dependency changes and let the owner trigger the install in daylight.

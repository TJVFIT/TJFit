# TJFit premium platform audit

Date: 2026-04-20. Scope: representative pass across layouts, marketing home, programs, dashboard, TJAI APIs/libs, shell/navigation, styling system, and known build risks.

## Executive summary

The codebase already implements a **dark luxury visual system** (CSS variables in `globals.css`, Tailwind extensions, glass-style cards, hero layers, `ScrollRevealInit` + `useScrollReveal`, scroll progress, page transitions, magnetic CTAs). TJAI has a **real orchestration layer** under `src/lib/tjai/` (plan pipeline, guards, context builder, optional strict validation, skill registry).

Main gaps are **not “missing luxury”** but **product surface area** (many AI features exist only as ideas), **catalog/commerce consistency** (static `content.ts` vs DB-backed coach programs), and **build hygiene** when optional vendor SDKs are absent.

---

## What works well

| Area | Evidence |
|------|-----------|
| Visual system | `--color-bg`, cyan/violet accents, motion tokens, `.reveal-section`, `.tj-skeleton` + shimmer |
| App shell | `SiteShell`: sidebar, mobile nav, scroll progress, error boundary, intro gate |
| Homepage | `ImmersiveHome` + `HeroSection` + 3D/layers; RTL-aware |
| TJAI plan path | `runPlanGenerationPipeline`, validation, save + analytics side effects |
| TJAI chat | Streaming SSE, domain guard, memory + logs context |
| Programs catalog | Large `programs` array in `src/lib/content.ts`, filters on programs page |
| Weekly AI insight | `GET /api/tjai/progress` caches `tjai_weekly_insights` |

---

## Broken or at risk

| Issue | Detail |
|-------|--------|
| Build without Paddle SDK | `npm run build` can fail if `@paddle/paddle-js` is imported but not installed (checkout / membership). Fix: install dependency or gate dynamic import behind env. |
| Search diets bug | `src/app/api/search/route.ts` maps “diets” from `programs` filtered by category string — easy to mislabel; worth a dedicated diets source when diets split from programs. |
| Dual LLM backends | OpenAI (plan/chat/progress) vs Anthropic (some flows) — operational complexity, not user-facing “broken”. |

---

## Ugly / inconsistent

| Issue | Detail |
|-------|--------|
| Hex drift | Mix of `#09090B`, `#0A0A0B`, `#111215` — acceptable artistically but tokens should stay the single source of truth. |
| Some routes use `any` | e.g. fragments of `plan_json` typing in progress API — reduces safety when refactoring. |
| Public TJAI landing | Strong but less “editorial” than immersive home — acceptable as marketing subpage. |

---

## Slow or heavy

| Issue | Mitigation already / suggested |
|-------|----------------------------------|
| Fast-scroll blur on main | `useScrollVelocity` applies filter blur to `<main>` — subtle but can feel like lag on low-end GPUs; capped further in code tweak. |
| Hero weight | Multiple layers + 3D + particles — `reduce` / `prefers-reduced-motion` paths exist; keep testing mid-tier Android. |
| Large `globals.css` | Single file is fast to parse but hard to navigate — future split by concern only if team agrees. |

---

## Missing (product vs code)

| Gap | Note |
|-----|------|
| Most “50 TJAI features” | Not implemented as named product surfaces; see `docs/TJAI_FEATURE_ROADMAP_50.md`. |
| 30 + 30 sale-ready unique catalogs | Requires content pipeline + deduping against `slug` + legal review; see `docs/catalog-expansion-strategy.md`. |
| Unified payment story | Intentionally out of scope for this pass; connect provider last. |

---

## TJAI (code) gaps

| Gap | Direction |
|-----|-----------|
| Chat intent routing | Implemented: lightweight module routing → system prompt addendum (`src/lib/tjai/orchestrator/chat-intent.ts`). |
| Named agents | Program generation is modular; chat uses one coach with **focus modes** until true multi-agent routing is needed. |
| Tool chain | Typed tools exist; plan pipeline still calls core libs directly for stability — extend gradually. |

---

## Supabase (high level)

- Auth-linked tables with RLS for chat, plans, purchases, checkpoints, weekly insights.
- Coach content: `custom_programs` API vs static catalog — two channels to keep in sync for search/SEO.

---

## Recommended priority order (post-audit)

1. Restore green builds (payment SDK / env gates).
2. Ship **user-visible** TJAI increments behind flags (weekly check-in table + API).
3. Expand catalog via **scripted** authoring + slug uniqueness checks, not ad-hoc duplication.
4. Dashboard / AI hub polish per `docs/UI_UX_ROADMAP_50.md` (incremental).

This audit is a living document; update it when major verticals (payments, catalog, TJAI) change.

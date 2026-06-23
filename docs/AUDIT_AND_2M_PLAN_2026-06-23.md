# TJFit — Full Audit & Roadmap to a $2M Product (2026-06-23)

> Author: Claude (engineering pass). Grounded in a real codebase + live-DB audit on
> branch `feat/tjfit-2m-overhaul`. Numbers are measured, not estimated.
> "2M" here = the product/engineering/design bar a credible $2M-valuation fitness
> startup must clear. Valuation ultimately = **traction × revenue × retention × growth** —
> code quality is necessary, not sufficient. This plan covers what *we* control.

---

## 1. What TJFit is today

A premium, multilingual (en/tr/ar/es/fr) AI fitness platform on Next.js 14 (App Router) +
TypeScript + Tailwind + Supabase + Gumroad. Three revenue rails:
- **Bundles** — 10 paid 12-week program+diet dossiers @ $10 (Gumroad) + 2 free lead-magnets.
- **TJAI** — AI plan generator + chatbot; one-time credit packs ($8/$35/$65) + subscriptions.
- **Coach marketplace** — coaches publish/sell, students message & book.

## 2. Audit — the hard numbers (measured 2026-06-23)

| Metric | Count |
|---|---:|
| Rendered pages (`page.tsx`) | **72** |
| Layouts | 10 |
| `loading`/`error`/`not-found` boundaries | 93 |
| **API endpoints** (`route.ts`) | **108** |
| API method handlers | 138 (64 GET · 60 POST · 10 PATCH · 4 DELETE) |
| React components (`.tsx`) | **155** |
| Hooks | 8 |
| Lib modules (`.ts`) | **168** |
| Exported functions | **691** |
| Total named functions | 1,048 |
| `redirect()` calls | 46 |
| `NextResponse.redirect` (middleware/routes) | 13 |
| `next.config` redirects | `/` → `/en` (+ locale rewrites) |
| Supabase migrations | **88** |
| Total TS/TSX files | 636 |
| **Total TS/TSX lines** | **71,551** |

**Feature surface (47 page areas):** admin, affiliate, ai (TJAI app), become-a-coach, blog,
bundles, calculator, challenges, checkout, coach, coach-dashboard, coaches, coins, community,
dashboard, equipment, feed, feedback, leaderboard, legal, live, login, membership, messages,
people, podcast, press, pro, profile, progress, records, search, settings, signup, start,
store, suggestions, support, tjai, transformations, verify-email, + auth flows.

**API areas (31):** admin, auth, blog, bundles, chat, checkout, coach(-applications), coaches,
coins, community, cron, email, feed, feedback, follow, leaderboard, newsletter, notifications,
profile(s), programs, progress, search, store, suggestions, support, tjai, user(s), webhooks.

**Verdict:** this is **not** an MVP. It's a ~72k-line, 108-endpoint platform that has already
shipped most of the surface area of a Series-A fitness app. The gap to "$2M" is **not more
features** — it's *finishing the money paths, deepening the design, and proving traction.*

## 3. Current state — what works vs. what's blocking revenue

### ✅ Working
- Build is healthy: `tsc --noEmit` clean, zero console errors, i18n parity passes (5 locales).
- **Bundles fully wired:** 10 paid bundles mapped to live Gumroad products; checkout flow
  (`/api/checkout/*`) + fulfillment webhook (`/api/webhooks/gumroad`) complete.
- TJAI hub, plan preview, chatbot UI, coach marketplace, community — all built & rendering.
- Premium design system: R3F 3D hero, cinematic sections, the new 3D whirl reveal, violet brand.

### 🔴 Revenue blockers (owner action — none are code bugs)
1. **TJAI credits not buyable.** 3 packs published with correct prices, but `product_gumroad_sync`
   has **0 live Gumroad links** → all show "Available soon." *Fix: create 3 Gumroad products,
   insert rows (real `gumroad_product_id` + permalink). One SQL statement once IDs exist.*
2. **Subscriptions un-activatable** until `NEXT_PUBLIC_GUMROAD_{PRO,APEX}_{MONTHLY,ANNUAL}_URL`
   env vars are set in Vercel.
3. **Supabase free-tier auto-pause.** Prod DB was found paused 2026-06-23 (restored). It will
   re-pause when idle, silently emptying credits/auth/community. *Fix: paid Supabase plan.*

### 🟡 Quality gaps
- LLM keys (`OPENAI_API_KEY`, Anthropic, `RESEND_API_KEY`) absent locally → TJAI generation,
  chatbot responses, and email can't be exercised end-to-end outside prod.
- Some marketing copy can drift from data (just fixed the "12 Free Bundles" stat).

## 4. The roadmap — phased

### Phase 0 — Turn the revenue on (days, mostly owner)
- [ ] Create 3 Gumroad credit-pack products → link in `product_gumroad_sync`.
- [ ] Create 4 Gumroad membership products → set the 4 `NEXT_PUBLIC_GUMROAD_*_URL` env vars.
- [ ] Move Supabase to a plan that doesn't auto-pause (or a keep-alive cron).
- [ ] Verify keys in Vercel (OpenAI/Anthropic/Resend) and run one live checkout + one TJAI
      generation + one credit purchase end-to-end. **This is the single highest-ROI day of work.**

### Phase 1 — Conversion & trust (the "feels worth $2M" layer)
- [ ] **Delivery polish:** confirm paid-PDF-on-success is bulletproof (build → email → in-app
      access). Add a branded post-purchase success screen + "your dossier" library.
- [ ] **Design cascade:** roll the violet/depth/whirl pass already started on the homepage out to
      `/bundles`, `/tjai`, `/tjai/credits`, `/coaches`, `/membership` for one coherent premium feel.
- [ ] **Bundle upgrade:** richer bundle detail pages (sample week, macro breakdown, before/after,
      testimonials, FAQ), trust badges, urgency, and a clear free→paid ladder.
- [ ] Social proof: real transformation gallery, review capture, coach ratings surfaced.
- [ ] Analytics + funnels (signup → bundle view → checkout → repeat) so you can *prove* traction.

### Phase 2 — Deepen the moat (TJAI as the wedge)
- [ ] Make TJAI demonstrably the best fitness AI: progress-aware memory, adaptive weekly check-ins,
      meal swaps, grocery lists, wearable/data import — several of these endpoints already exist
      (`/api/tjai/*`), so this is *polish + glue*, not greenfield.
- [ ] Credit economics: bundle credits with subscriptions, referral credits, win-back offers.
- [ ] Coach marketplace liquidity: onboarding, payouts, quality bar, discovery.

### Phase 3 — Growth & scale
- [ ] Programmatic SEO over the 47 feature areas + blog; AI-answer optimization.
- [ ] Lifecycle email/retention (Resend), churn-prevention save flows, referral program.
- [ ] Affiliate program (route already scaffolded), community challenges, leaderboards as retention.
- [ ] Mobile polish + PWA; consider native shell later.

## 5. Design — how to go further

- Finish the **brand consistency sweep** (cyan→violet is done on the logo; audit remaining
  components for any cyan/sky/gold and replace — CLAUDE.md mandates this).
- Extend the **3D whirl + rack-focus** signature to 1–2 hero moments per key page (not every
  section — it punctuates, it shouldn't nauseate). Add scroll-linked parallax depth on imagery.
- Typography & spacing rigor pass (the hero hierarchy fix is the template).
- Micro-interactions: magnetic CTAs (already present), haptics on mobile, sound-off by default.
- One "wow" set-piece per surface: hero 3D object, credits storefront shimmer, transformation reel.

## 6. Features worth adding (ranked by ROI)

1. **Post-purchase library & PDF re-download** (reduces support, increases trust).
2. **TJAI free-trial → paid conversion flow** with a credit on signup.
3. **Referral program** (viral loop; route scaffolded).
4. **Transformation submissions + social proof engine.**
5. **Wearable/CSV import → TJAI adapts** (data moat).
6. **Coach payouts + reviews** (marketplace liquidity).
7. **Native-feeling PWA** (install, offline plan access, push).

## 7. Technical hardening

- Resolve the Supabase auto-pause (Phase 0) — it's an availability risk on a live product.
- Add error monitoring (Sentry) + uptime checks on the 108 endpoints.
- Run `get_advisors` (security + performance) on Supabase now that it's active; fix RLS/index gaps.
- CI: `tsc` + `vitest` + `i18n:check` gates on every PR (scripts already exist).
- Rate-limit + abuse protection on TJAI generation (cost control).

## 8. What "$2M" actually needs (the honest part)

Code readiness is ~80% there. A $2M valuation realistically needs **demonstrable traction**:
- A working, friction-free purchase for *all three* rails (Phase 0).
- Early revenue + retention cohorts you can show (Phase 1 analytics).
- A defensible wedge (TJAI quality, Phase 2) and a growth loop (Phase 3).

**Recommended next 5 moves, in order:** (1) link the credit-pack Gumroad products, (2) set the
subscription env vars, (3) un-pause/upgrade Supabase, (4) verify all three purchase paths live,
(5) ship the design cascade + delivery polish. Items 1–4 are mostly *yours* (IDs, env, billing);
item 5 is *mine*, and I can start immediately.

---
*Generated from a live audit on branch `feat/tjfit-2m-overhaul`. All design changes so far are
on that branch; production was not touched except the authorized Supabase restore.*

# TJFit — Master Execution Plan (2026-06-10)

Everything Critical→High that is safely automatable **is already done and
deployed/committed** (see FINAL_REPORT.md). This plan covers what remains,
ranked, with impact/complexity/effort and the gate that holds each item.

## 1. Critical

| Task | Impact | Complexity | Effort | Gate |
|---|---|---|---|---|
| — none open — | | | | |

All seven critical-class issues found across the audits (RLS leaks, credit-mint
RPCs, migration drift, consent bypass, missing buckets, entitlement lockout,
spoofable RPCs) are fixed and verified.

## 2. High

| Task | Impact | Complexity | Effort | Gate / next action |
|---|---|---|---|---|
| Set real prices on hero bundles | Revenue: existential | Trivial | Minutes | **Owner** enters prices (never invented by tooling) |
| Enable Supabase Leaked Password Protection | Account security | Trivial | 1 click | **Owner**: dashboard → Auth → Password |
| Next.js 14 → 15/16 major upgrade | Clears all 5 remaining npm-audit CVEs | High | 1–2 days | **Owner-approved supervised session**: branch, full build, route-by-route regression, then deploy |
| Browser visual QA pass (glow fix, RTL, 3 breakpoints) | Brand integrity | Low | 1–2 h | Human or browser session; CLI audit cannot render pixels |

## 3. Medium

| Task | Impact | Complexity | Effort | Gate |
|---|---|---|---|---|
| Content-Security-Policy (start Report-Only, then enforce) | Defense-in-depth | Medium | 0.5–1 day | Supervised: must test Spline/Three/GA4/Meta/TikTok/Supabase/Sentry/Gumroad |
| RLS rewrite pass: `auth_rls_initplan` (135) + `multiple_permissive_policies` (228) | DB performance at scale | High | 1–2 days | Supervised + staging verification; lockout risk if batched blind |
| Add `supabase db push`/drift check to CI | Prevents drift recurrence (root cause of the worst launch bug) | Low | 2 h | None — good first post-launch task |
| Hreflang alternates verification/add | International SEO | Low | 2–4 h | None |
| Founding-member email + TJAI credit-pack surfacing | Revenue | Low | 0.5 day each | After pricing |
| Consolidate chart.js vs recharts to one library | Bundle size | Medium | 0.5 day | None |
| Wire web-vitals field data (Speed Insights/PostHog) | Measurement | Low | 1 h | None |

## 4. Low

| Task | Impact | Complexity | Effort |
|---|---|---|---|
| Re-review 100 unused indexes after 30 days traffic; drop dead ones | Minor DB | Low | 2 h |
| `claude-opus-4-7` → `opus-4-8` in TJAI provider policy | Quality/cost tweak | Trivial | Owner call |
| Archive retired TJCoin tables | Hygiene | Low | 2 h (owner confirm) |
| Product/FAQ/Article JSON-LD (after pricing) | SEO depth | Low | 0.5 day |
| 8pt-grid spacing sweep, UGC duotone treatment | Polish | Low | 1 day |
| Empty-state conversion copy pass | UX/conversion | Low | 0.5 day |

## Standing rules carried forward

- Never batch-rewrite RLS policies unsupervised.
- After applying any SECURITY DEFINER function, re-check `exec_roles` and
  revoke anon/authenticated unless the user client calls it.
- Use scoped `git add <paths>`; keep prices $0 until owner sets them; Shopify
  store stays out of scope until green-lit.

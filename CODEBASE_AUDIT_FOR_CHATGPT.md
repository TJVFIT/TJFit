# TJFit — Full codebase audit (for ChatGPT / external review)

**Generated:** 2026-03-31 (workspace: Next.js app `tjfit`, GitHub `TJVFIT/TJFit`, production domain `tjfit.org` on Vercel).

---

## Important: this is not a literal dump of every character

- **`src/` alone is ~14,600+ lines** of `.ts` / `.tsx` / `.css` (approximate count via PowerShell).
- Pasting **100% of the source** would exceed ChatGPT context limits and is unnecessary for most reviews.
- For a **line-by-line** review, zip the repo or use your IDE / `git archive`, then upload or reference specific files.

This document gives a **complete inventory**, **architecture**, **API surface**, **data layer**, **env/config**, **known issues**, and **how pieces connect** so another model can reason about the whole system.

---

## 1. Stack & tooling

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 14.2** (App Router) |
| UI | **React 18**, **Tailwind CSS 3.4** |
| Motion | **Framer Motion 11** |
| Icons | **lucide-react** |
| Auth + DB | **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) |
| Errors | **Sentry** (`@sentry/nextjs`, `withSentryConfig` in `next.config.mjs`) |
| Payments | **Adapter-based checkout** (`src/lib/payments/`, `/api/checkout/*`, `PAYMENT_PROVIDER` = `live` or `test`) |
| PDF | **pdf-parse** (program ingestion / uploads) |
| Language | **TypeScript 5.7** |
| Lint | **ESLint** + `eslint-config-next` |

**Scripts (`package.json`):** `dev`, `build`, `start`, `lint`, `i18n:check`, `i18n:scan`, `i18n:verify`.

---

## 2. High-level architecture

- **App Router** under `src/app/`.
- **Locale-first URLs:** `src/app/[locale]/...` with `locales = ["en","tr","ar","es","fr"]` in `src/lib/i18n.ts`.
- **Root** `src/app/page.tsx` uses `permanentRedirect("/en")` (backup); **`next.config.mjs`** also redirects `/` → `/en` with **308** (crawler-safe `Location` header).
- **Shell:** `src/components/site-shell.tsx` — sticky header (`SiteNav`), `GuestOnboardingPopup`, `<main>`, `SiteFooter`.
- **Middleware** `src/middleware.ts` — Supabase session refresh on cookies; **HTML** responses get `Cache-Control: public, max-age=0, must-revalidate`.
- **SEO:** `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/site-url.ts`, root `layout.tsx` metadata + optional `GOOGLE_SITE_VERIFICATION`.

---

## 3. Complete source file inventory (paths)

### 3.1 App — pages & layouts

```
src/app/layout.tsx
src/app/page.tsx
src/app/globals.css
src/app/robots.ts
src/app/sitemap.ts
src/app/programs/page.tsx
src/app/privacy-policy/page.tsx
src/app/refund-policy/page.tsx
src/app/terms-and-conditions/page.tsx
src/app/[locale]/layout.tsx
src/app/[locale]/page.tsx
src/app/[locale]/admin/page.tsx
src/app/[locale]/ai/page.tsx
src/app/[locale]/become-a-coach/page.tsx
src/app/[locale]/challenges/page.tsx
src/app/[locale]/checkout/page.tsx
src/app/[locale]/coach-dashboard/page.tsx
src/app/[locale]/coaches/page.tsx
src/app/[locale]/coaches/[slug]/page.tsx
src/app/[locale]/community/page.tsx
src/app/[locale]/dashboard/page.tsx
src/app/[locale]/feedback/page.tsx
src/app/[locale]/live/page.tsx
src/app/[locale]/login/page.tsx
src/app/[locale]/membership/page.tsx
src/app/[locale]/messages/page.tsx
src/app/[locale]/messages/[conversationId]/page.tsx
src/app/[locale]/privacy-policy/page.tsx
src/app/[locale]/programs/page.tsx
src/app/[locale]/programs/[slug]/page.tsx
src/app/[locale]/programs/upload/page.tsx
src/app/[locale]/progress/page.tsx
src/app/[locale]/refund-policy/page.tsx
src/app/[locale]/signup/page.tsx
src/app/[locale]/store/page.tsx
src/app/[locale]/support/page.tsx
src/app/[locale]/terms-and-conditions/page.tsx
src/app/[locale]/transformations/page.tsx
src/app/[locale]/transformations/[slug]/page.tsx
```

### 3.2 App — API routes (`route.ts`)

```
src/app/api/admin/authorize-coach/route.ts      POST
src/app/api/admin/coaches/route.ts              GET
src/app/api/auth/admin-login/route.ts           POST
src/app/api/auth/me/route.ts                    GET
src/app/api/chat/attachments/register/route.ts  POST
src/app/api/chat/attachments/sign/route.ts      POST
src/app/api/chat/calls/events/route.ts          POST
src/app/api/chat/calls/start/route.ts          POST
src/app/api/chat/conversations/route.ts         GET, POST
src/app/api/chat/messages/[conversationId]/route.ts  GET, POST
src/app/api/checkout/complete-order/route.ts    POST
src/app/api/checkout/create-order/route.ts      POST
src/app/api/coach-applications/route.ts         POST
src/app/api/coach-applications/list/route.ts    GET
src/app/api/coins/redeem/route.ts               POST
src/app/api/coins/wallet/route.ts               GET
src/app/api/community/blogs/route.ts            GET, POST, DELETE, PATCH
src/app/api/community/blogs/translate/route.ts  POST
src/app/api/feedback/route.ts                   POST
src/app/api/feedback/list/route.ts              GET
src/app/api/newsletter/subscribe/route.ts       POST
src/app/api/checkout/prepare-session/route.ts   POST
src/app/api/programs/custom/route.ts            GET, POST, DELETE
src/app/api/programs/custom/[slug]/route.ts     GET
src/app/api/progress/entries/route.ts           GET, POST
src/app/api/progress/milestones/route.ts        GET, POST, PATCH
src/app/api/progress/workouts/route.ts          GET, POST
```

### 3.3 Components (`src/components/`)

```
admin-coach-applications.tsx
admin-coach-authorization.tsx
admin-dashboard-view.tsx
admin-feedback-list.tsx
ai-coach-matcher.tsx
auth-provider.tsx
chat-thread-view.tsx
coach-application-slideshow.tsx
coach-dashboard-view.tsx
community-hub.tsx
dashboard-role-router.tsx
feedback-form.tsx
guest-onboarding-popup.tsx
home-blogs-preview.tsx
language-switcher.tsx
live-proof.tsx
locale-document.tsx
locale-document-attrs.tsx
messages-view.tsx
motion.tsx
progress-view.tsx
protected-route.tsx
site-footer.tsx
site-nav.tsx          (portal + framer-motion drawer; half-width menu; summaries)
site-shell.tsx
ui.tsx
```

### 3.4 Library (`src/lib/`)

```
auth-utils.ts
chat-crypto.ts
chat-keyring.ts
content.ts              — static marketing/program seed-like content, community mock data
custom-programs.ts
feature-copy.ts
i18n.ts                 — locale types, `getDictionary`, large string tables
launch-copy.ts          — auth, guest popup, community UI, footer, nav chrome, nav summaries, home sections, admin coach copy
legal.ts
legal-copy.ts
payments/               — resolve-provider, checkout adapters, types
program-blueprints.ts
program-localization.ts
program-management-copy.ts
rate-limit.ts
recommendations.ts
require-admin.ts
require-auth.ts
require-coach-or-admin.ts
site-url.ts             — canonical URL for SEO
supabase.ts             — browser client
supabase-server.ts      — server client (service role where used)
supabase/server.ts      — server component client pattern
tjfit-coin.ts
utils.ts
```

### 3.5 Other root-level source

```
src/middleware.ts
src/instrumentation.ts
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
```

### 3.6 Scripts

```
scripts/i18n/check-locale-parity.ts
scripts/i18n/check-hardcoded-ui.ts
```

### 3.7 Supabase migrations (`supabase/migrations/`)

```
20250316000000_coach_applications_and_feedback.sql
20250316100000_profiles_and_auth.sql
20250316110000_paytr_callbacks.sql
20260331120000_drop_legacy_payment_callbacks.sql
20260316000100_progress_and_secure_chat.sql
20260330000100_tjfit_coin.sql
20260330000200_one_active_coach_per_student.sql
20260330000300_custom_program_uploads.sql
20260330000400_marketing_subscribers.sql
20260330000500_enforce_customer_signup_and_roles.sql
20260330000600_community_blogs.sql
20260330000700_community_blog_pinning.sql
20260331000100_coach_student_links_insert_rls.sql
20260331000100_harden_coach_student_link_insert.sql   ← duplicate timestamp prefix with previous row; verify ordering in Supabase
```

### 3.8 Docs (non-code product copy)

- `docs/programs/*.md` — many markdown program descriptions (content source / references).

### 3.9 Config / build

```
package.json
package-lock.json
next.config.mjs
tailwind.config.ts (if present at root)
postcss.config.js / mjs
tsconfig.json
.eslintrc.* (if present)
.env.example          — env template (no secrets)
.gitignore
```

---

## 4. Product surface (what the app does)

- **Marketing / home:** localized hero, **blog preview** (`HomeBlogsPreview` → `/api/community/blogs`), category cards (blogs first in grid).
- **Programs:** marketplace + detail pages; **custom coach uploads** via API + storage.
- **Community hub:** tabs — **Blogs** (default when no `tab`), Threads (static content from `content.ts`), Challenges / Transformations (static + redirects from legacy routes).
- **Blogs:** DB-backed `community_blog_posts`, image bucket, coach/admin publish, admin pin, **translate** API to target locale.
- **Auth:** Supabase email/password; **admin** path via `admin-login` + `ADMIN_EMAILS` / `ADMIN_CREDENTIALS` patterns; roles: customer, coach, admin (see migrations).
- **Coach dashboard / student progress / encrypted chat** — APIs under `/api/chat/*`, `/api/progress/*`, client crypto helpers in `chat-*.ts`.
- **Checkout:** create order, `clientFlow` (simulated vs await gateway), complete-order (test only), prepare-session stub for future PSP.
- **TJFit coin:** wallet + redeem APIs.
- **Newsletter / marketing subscribers** table + subscribe API.
- **Feedback** form + admin list.

---

## 5. Internationalization (i18n)

- **Locales:** `en`, `tr`, `ar`, `es`, `fr`.
- **Dictionaries:** `src/lib/i18n.ts` (large).
- **Feature-specific copy:** `launch-copy.ts`, `feature-copy.ts`, `legal-copy.ts`, `program-management-copy.ts`, per-page literals still exist in some routes (see `i18n:scan` script).
- **RTL:** `dir` set per locale in `locale-document` / layout patterns.
- **Verification:** `npm run i18n:verify` = parity check + hardcoded UI scan (scan may be noisy).

---

## 6. Security & auth (patterns to review in depth)

- **Server guards:** `require-admin.ts`, `require-coach-or-admin.ts`, `require-auth.ts` used in sensitive API routes.
- **Service role:** `SUPABASE_SERVICE_ROLE_KEY` — must remain server-only; `getSupabaseServerClient` / admin operations.
- **RLS:** enforced in Supabase; migrations include blog tables, roles, coach–student links, etc. **Two migrations share `20260331000100_` prefix** — confirm applied order.
- **Chat:** E2E-style encryption helpers on client; review threat model separately.
- **Rate limiting:** `rate-limit.ts` present — confirm usage on hot routes.
- **Admin env:** `.env.example` shows **ADMIN_EMAILS** / **ADMIN_CREDENTIALS** — treat as sensitive in real deployments (rotate if exposed).

---

## 7. Environment variables (from `.env.example`; names only)

- `NEXT_PUBLIC_SITE_URL` — canonical site URL for SEO.
- `GOOGLE_SITE_VERIFICATION` — optional Search Console HTML tag content.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`, `ADMIN_CREDENTIALS` (server-side admin login mapping)
- `PAYMENT_PROVIDER`, `ALLOW_TEST_CHECKOUT` (see `.env.example`)
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`

**Vercel:** also uses system vars like `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_ENV` (read in `site-url.ts`).

---

## 8. Known technical notes / debt

- **ESLint:** `chat-thread-view.tsx` has `react-hooks/exhaustive-deps` warnings (non-blocking build).
- **Sentry:** suggests `global-error.js` for React render errors (optional).
- **No `error.tsx` / `loading.tsx`** in `src/app` at time of audit — consider adding for UX.
- **Guest onboarding popup** — marketing email capture; flows should be tested per locale.
- **Checkout / PSP** — validate in production with real webhooks and legal terms when `PAYMENT_PROVIDER=live`.

---

## 9. Deployment

- **Vercel** project `tjfitmain`, domain `tjfit.org` (DNS often Namecheap; TXT for Google verification).
- **Git:** `main` branch pushed to `https://github.com/TJVFIT/TJFit.git`.
- **Build:** `npm run build` (Next production build).

---

## 10. How to give ChatGPT “everything” anyway

1. **Zip the repo** (exclude `node_modules`, `.next`):  
   `git archive -o tjfit-src.zip HEAD`
2. **Upload** the zip to ChatGPT if your plan supports it, **or**
3. **Paste this file** + **ask targeted questions** (“audit `src/app/api/checkout` for idempotency”).
4. For **one file at a time**, paste file contents with path as header.

---

## 11. Changelog highlights (recent product-facing work)

- SEO: sitemap, robots, metadataBase, root redirect 308 `/` → `/en`.
- Nav: wide menu, translated short summaries, **portal to `document.body`** (fixes drawer clipped by header `backdrop-blur`).
- Home: blogs preview section + blogs first in community hub default tab.
- Community blogs: CRUD, pin, translate API, image uploads to storage.

---

*End of audit index. For behavioral questions, name files from section 3.*

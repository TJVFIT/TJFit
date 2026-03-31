# TJFit Platform – Technical Audit for Upgrade Recommendations

**Purpose:** Send this document to ChatGPT and ask: *"Review this audit and tell me what needs upgrading, in priority order, with specific actionable recommendations."*

---

## 1. Project Overview

**TJFit** is a premium multilingual coaching platform (fitness, performance, nutrition, rehabilitation). It is a Next.js 14 app deployed on Vercel, using Supabase for auth and database.

- **URL:** tjfit.org
- **Locales:** English, Turkish, Arabic, Spanish, French
- **Roles:** Public, Coach, Admin

---

## 2. Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 14.2.30 |
| React | React | ^18.3.1 |
| Database/Auth | Supabase | ^2.49.1 |
| Styling | Tailwind CSS | ^3.4.17 |
| Animation | Framer Motion | ^11.11.17 |
| Icons | Lucide React | ^0.469.0 |
| Utils | clsx, tailwind-merge | ^2.x |
| TypeScript | TypeScript | ^5.7.2 |
| Linting | ESLint + eslint-config-next | 14.2.30 |

---

## 3. Project Structure

```
src/
├── app/
│   ├── [locale]/           # Locale-based routes (en, tr, ar, es, fr)
│   │   ├── page.tsx        # Home / Launching Soon
│   │   ├── login/
│   │   ├── signup/
│   │   ├── become-a-coach/
│   │   ├── store/
│   │   ├── coaches/
│   │   ├── programs/
│   │   ├── transformations/
│   │   ├── community/
│   │   ├── challenges/
│   │   ├── live/
│   │   ├── membership/
│   │   ├── feedback/
│   │   ├── checkout/
│   │   ├── dashboard/      # Role-based (admin/coach)
│   │   ├── coach-dashboard/
│   │   └── admin/          # Admin-only
│   ├── api/
│   │   ├── coach-applications/   # POST submit, GET list
│   │   ├── feedback/             # POST submit, GET list
│   │   ├── admin/
│   │   │   ├── authorize-coach/  # POST – create coach
│   │   │   └── coaches/          # GET – list coaches
│   │   └── checkout/             # create-order, complete-order, prepare-session
│   └── layout.tsx
├── components/
│   ├── auth-provider.tsx
│   ├── protected-route.tsx
│   ├── site-nav.tsx
│   ├── site-footer.tsx
│   ├── site-shell.tsx
│   ├── language-switcher.tsx
│   ├── admin-coach-authorization.tsx
│   ├── admin-coach-applications.tsx
│   ├── admin-feedback-list.tsx
│   ├── coach-application-slideshow.tsx
│   ├── feedback-form.tsx
│   └── ...
└── lib/
    ├── supabase.ts         # Browser client
    ├── supabase-server.ts  # Server client (service role)
    ├── i18n.ts             # Inline dictionaries (EN, TR, AR, ES, FR)
    ├── content.ts          # Static content
    ├── rate-limit.ts       # In-memory rate limiting
    ├── payments/           # Checkout adapters + resolve-provider
    └── utils.ts
```

---

## 4. Authentication & Authorization

- **Auth:** Supabase Auth (email/password)
- **Admin:** Determined by `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated)
- **Coach:** Stored in `profiles` table (`role = 'coach'`), set by admin via authorize-coach
- **Admin login:** Username→email mapping via `NEXT_PUBLIC_ADMIN_CREDENTIALS` (e.g. `JosephAZ:email@...`)
- **Protected routes:** Client-side only via `ProtectedRoute` (redirects to login or home)
- **API protection:** Admin APIs (`/api/admin/*`) have **no server-side auth** – anyone can call them

---

## 5. Database (Supabase)

**Tables:**
- `coach_applications` – form submissions (age, name, specialty, etc.)
- `feedback_submissions` – feedback/support (type, message, email, etc.)
- `profiles` – links `auth.users` to role (`admin` or `coach`)

**RLS:** Enabled on all tables. Anon can insert into `coach_applications` and `feedback_submissions`. Select on `profiles` restricted to own profile; service role bypasses RLS.

---

## 6. Security Observations

| Issue | Severity | Description |
|-------|----------|-------------|
| Admin APIs unprotected | **Critical** | `/api/admin/authorize-coach` and `/api/admin/coaches` have no auth. Anyone can create coach accounts or list coaches. |
| Rate limiting in-memory | Medium | `rate-limit.ts` uses `Map` – resets on serverless cold starts, not shared across instances. |
| Admin credentials in client | Medium | `NEXT_PUBLIC_ADMIN_CREDENTIALS` and `NEXT_PUBLIC_ADMIN_EMAILS` are exposed to the browser. |
| Payment webhooks | TBD | Wire your PSP; verify signatures server-side on dedicated webhook routes. |
| List APIs | Low | `coach-applications/list` and `feedback/list` use optional `x-admin-secret` header when `ADMIN_API_SECRET` is set. |

---

## 7. i18n (Internationalization)

- **Approach:** Inline dictionaries in `src/lib/i18n.ts` (no external files)
- **Locales:** en, tr, ar, es, fr
- **RTL:** Supported via `dir` attribute for Arabic
- **Coverage:** Nav, hero, become-a-coach, admin, dashboard, feedback, etc.

---

## 8. Dependencies – Potential Upgrades

- **Next.js 14.2.30** – Next.js 15 is available (App Router improvements, React 19 support)
- **React 18** – React 19 is available
- **Supabase 2.49** – Check for newer versions
- **Tailwind 3.4** – Tailwind v4 is in development
- **No testing** – No Jest, Vitest, or Playwright
- **No error boundary** – No React error boundaries
- **No monitoring** – No Sentry, LogRocket, or similar

---

## 9. Code Quality

- **TypeScript:** Strict mode enabled
- **ESLint:** `next/core-web-vitals` only
- **No Prettier** – No shared formatting config
- **No Husky/lint-staged** – No pre-commit hooks
- **Params:** Some pages use `params` as sync object; Next.js 15 uses async `params`

---

## 10. Performance & UX

- **Fonts:** Inter + Outfit via `next/font`
- **Images:** `next/image` with Unsplash remote pattern
- **Animations:** Framer Motion on become-a-coach slideshow
- **No loading states** – Some routes may lack skeletons
- **No error pages** – Default `error.tsx` / `not-found.tsx` usage unclear

---

## 11. Deployment

- **Platform:** Vercel
- **Env vars:** Supabase URL/keys, admin emails/credentials, payment provider flags (`PAYMENT_PROVIDER`, `ALLOW_TEST_CHECKOUT`)
- **Build:** `next build` – no custom optimizations

---

## 12. Feature Completeness

| Feature | Status |
|---------|--------|
| Public nav (Home, Store) | ✅ |
| Coach nav (+ Dashboard) | ✅ |
| Admin nav (full) | ✅ |
| Become a Coach form | ✅ |
| Coach applications (admin view) | ✅ |
| Feedback form | ✅ |
| Feedback list (admin) | ✅ |
| Coach authorization (admin) | ✅ |
| Login (email + admin username) | ✅ |
| Checkout / PSP | Adapter UI ready; live gateway + webhooks TBD |
| Store, Programs, Coaches pages | Coming soon / placeholder |
| Tests | ❌ None |

---

## 13. Specific Questions for ChatGPT

1. **Security:** How should we protect `/api/admin/authorize-coach` and `/api/admin/coaches`? (Supabase session cookie, JWT, or API key?)
2. **Next.js 15:** Is upgrading from 14 to 15 recommended now? What breaking changes matter for this app?
3. **Rate limiting:** Should we move to Redis/Upstash for production, or is in-memory acceptable for current scale?
4. **i18n:** Should we migrate to `next-intl` or keep inline dictionaries?
5. **Testing:** What testing strategy do you recommend (unit, integration, E2E) and which tools?
6. **Monitoring:** What error/performance monitoring would you add first?
7. **Admin credentials:** Is storing admin username→email mapping in `NEXT_PUBLIC_` acceptable, or should we move it server-side?

---

## 14. Files to Reference (if ChatGPT has file access)

- `package.json` – dependencies
- `src/lib/supabase.ts` – browser client
- `src/lib/supabase-server.ts` – server client
- `src/components/auth-provider.tsx` – auth state, role resolution
- `src/components/protected-route.tsx` – client-side route protection
- `src/app/api/admin/authorize-coach/route.ts` – coach creation (unprotected)
- `src/app/api/admin/coaches/route.ts` – coach list (unprotected)
- `src/lib/rate-limit.ts` – in-memory rate limiting
- `src/lib/i18n.ts` – dictionaries (large file)
- `.env.example` – env var template

---

*End of audit. Ask ChatGPT to prioritize upgrades and provide concrete steps.*

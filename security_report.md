# TJFit — Security Report (2026-06-10)

Scope: authentication, authorization (RLS + RPC), session handling, API
security, secrets, headers, XSS/CSRF/SSRF/SQLi, dependencies. Live project:
Supabase `kohuiyqyixvrcqeepalz`, Vercel `tjfitmain`.

## Posture summary

**No known exploitable issue remains open.** Every finding below is either
fixed-and-verified, an intentional accepted risk, or an owner-gated toggle.

## Fixed and verified (chronological)

1. **RLS disabled on 5 public tables** — anyone with the anon key could read
   reengagement_emails, tjai_plan_analytics, program_preview_views,
   coach_profile_views, program_catalog_flags. Enabled RLS (20260531120000);
   advisor ERRORs cleared.
2. **Anon-executable SECURITY DEFINER RPCs** — incl. `grant_tjai_credit` /
   `consume_tjai_credit` (free-credit minting). Revoked anon/PUBLIC EXECUTE on
   15 RPCs, pinned `search_path` on 3 trigger functions (20260601120000).
3. **newsletter_subscribers anon policies** — anon could edit/unsubscribe any
   row and bypass double-opt-in inserts. Dropped (20260601130000); table is
   service-role-only.
4. **Coin-minting regression risk** during RPC drift remediation — Supabase
   default privileges auto-grant EXECUTE to anon+authenticated on new
   functions; `tjfit_award_reaction` (writes coin ledger) revoked to
   service_role at apply time. Rule recorded: re-check `exec_roles` after every
   SECURITY DEFINER (re)application.
5. **Storage enumeration** — broad public-read SELECT policies on
   avatars/blog buckets allowed listing all object paths. Dropped (c8b9e7f);
   public buckets serve via CDN URL without SELECT policies.
6. **Cron endpoint** — `/api/cron` verified fail-closed (CRON_SECRET via
   header or Bearer, 401 with opaque errors).
7. **Consent bypass (GDPR/ePrivacy)** — GA4/Meta/TikTok loaded on env-presence
   alone; now gated on cookie-consent categories and reactive to changes.
8. **Baseline security headers** (7e03768): HSTS (2y, includeSubDomains, no
   preload by design), nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy
   strict-origin-when-cross-origin. **Verified live on tjfit.org.**
9. **NEW — user-spoofable RPCs (fixed today, 20260610120000):**
   `tjfit_workout_records(p_user_id)` and `tjfit_toggle_suggestion_vote(p_user_id, …)`
   trusted the caller-supplied id — any signed-in user could read another
   user's workout PRs or toggle votes as them via `/rest/v1/rpc/...`. Both now
   require `p_user_id = auth.uid()` (service_role exempt). `tjfit_replace_meal`
   is invoked only via the service-role client, so authenticated EXECUTE was
   revoked outright. **Verified by simulated-JWT test:** spoofed read returns
   0 rows; legitimate grants intact; replace_meal no longer
   authenticated-executable.

## Current advisor state (re-run today)

- 0 ERROR-level lints.
- 8 INFO `rls_enabled_no_policy` — service-role-only tables; locked-down RLS is
  the intended state. Do **not** add public policies.
- 7 WARN `rls_policy_always_true` — public-form INSERTs (affiliates,
  coach_applications, feedback_submissions, store_waitlist, …) and a
  service-scoped ALL policy. Intentional; forms are server-validated and
  rate-limited at the route layer.
- 11 WARN SECURITY DEFINER executable lints — secure-chat RPCs,
  `search_profiles`, `get_profile_card`, `increment_blog_view_count` (public
  counter), and the two RPCs hardened today (they remain authenticated-callable
  by design, now self-scoped).
- 1 WARN `auth_leaked_password_protection` — **owner action required** (see below).

## Domain reviews

- **Authentication/session:** Supabase SSR client with middleware session
  refresh; PKCE; COPPA DOB gate on signup; email verification flow present.
  No session tokens in localStorage-only paths found.
- **API security:** routes consistently use `requireAuth()`; entitlement gate
  (`hasPurchasedProgram`) verified end-to-end on the paid-content path;
  webhook + cron endpoints secret-gated; admin routes audit-logged
  (admin_audit_log).
- **XSS:** React escaping throughout; no `dangerouslySetInnerHTML` misuse
  found in audited components; user images via Next/Image with fixed
  remotePatterns (unsplash + project Supabase host only).
- **CSRF:** mutating endpoints are bearer/session-authenticated JSON APIs (no
  cookie-trusting form posts); SameSite cookie defaults via Supabase SSR.
- **SSRF:** no user-supplied URL fetching server-side (image domains pinned).
- **SQLi:** no string-built SQL; Supabase client + parameterized RPCs only.
- **Secrets:** no tracked `.env*`; `.env.example` placeholders only; repo
  scan clean.
- **Dependencies:** 0 critical. 4 high + 1 moderate remain, all resolved only
  by the Next.js major upgrade (see remaining items).

## Remaining items (none silently risky)

| Item | Gate | Notes |
|---|---|---|
| Enable Leaked Password Protection | **Owner, 1 click** | Supabase dashboard → Auth; no API/MCP path exists |
| Next.js 14→15/16 major | Owner + supervised regression | clears all 5 remaining npm-audit findings |
| Content-Security-Policy | Supervised pass | test against Spline/Three/GA4/Meta/TikTok/Supabase/Sentry/Gumroad before enforcing; start Report-Only |
| `auth_rls_initplan` (135) + `multiple_permissive_policies` (228) | Supervised pass | performance-motivated policy rewrites; botched batch could lock users out — keep deferred |
| Permissions-Policy | **Shipped today** | `camera=(), microphone=(self), geolocation=(), browsing-topics=()` — mic kept for TJAI Web Speech voice input |

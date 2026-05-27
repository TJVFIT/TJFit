# Account Deletion + Data Export Audit — 2026-05-27

**Method:** static scan for delete-account / data-export surfaces across `src/app/api/*`, `src/app/[locale]/settings/*`, `src/components/*`, and `supabase/migrations/*.sql`. Cross-referenced against LASTCLAUDECODE.md Cycle 075 (GDPR Article 17 erasure / Article 20 portability).

## Headline

TJFit **does not currently expose** an account-deletion endpoint or a data-export endpoint to customers. If the product serves EU/UK/EEA users (the production locale list includes `en/tr/ar/es/fr` so EU users are very likely), this is a **P0 GDPR compliance gap**.

## Static evidence

| Surface | Present? |
|---|---|
| `/api/account/*` route | **❌ Directory does not exist** |
| Any handler calling `supabase.auth.admin.deleteUser(...)` | **❌ Zero matches across `src/app/api/`** |
| Any handler that builds + returns a per-user data dump (JSON/zip) | **❌ Zero matches** |
| Settings page index ([src/app/\[locale\]/settings/page.tsx](../../src/app/[locale]/settings/page.tsx)) | Renders links but no "Delete account" or "Export my data" entry |
| `/settings/profile`, `/settings/subscription`, `/settings/messaging` | None of these contain a delete-account button |
| Privacy policy or terms refs to deletion/portability | Not audited here — separate legal review |

## What partial coverage *does* exist

If a Supabase admin deletes a row from `auth.users` manually (or via a future deletion endpoint), the cascade behavior is mostly clean:

| Behavior | Count |
|---|---|
| Tables referencing `auth.users(id)` with `ON DELETE CASCADE` | **17** of 18 references |
| Tables with `ON DELETE SET NULL` | 1 (some anonymization path) |
| Tables with no `ON DELETE` clause (defaults to `NO ACTION` / `RESTRICT`) | **1 — `coach_id` in [supabase/migrations/20260405193000_tjai_upgrades.sql](../../supabase/migrations/20260405193000_tjai_upgrades.sql)** |

So the cascade-delete plumbing is mostly in place at the data layer — what's missing is the *user-facing pathway* to trigger it, and one FK that would block deletion of a coach user.

## Cycle 075 / GDPR requirement matrix

### Article 17 — Right to erasure ("right to be forgotten")

| Requirement | TJFit today |
|---|---|
| User can request account deletion from the product UI | **❌ Missing** |
| Deletion is processed within a reasonable timeframe (default: 30 days) | n/a — no pathway |
| User receives confirmation that deletion completed | n/a |
| Backups / logs are scoped or anonymized | n/a — no policy declared |
| Exceptions (legal hold, fraud, contractual records) are documented | n/a |

### Article 20 — Right to data portability

| Requirement | TJFit today |
|---|---|
| User can download their own data in a machine-readable format (JSON / CSV) | **❌ Missing** |
| Export includes: profile, TJAI memory, plans, progress, blog posts, messages, settings, purchase history | n/a |
| Export excludes data that affects other users' rights (e.g. inbound messages from someone else) | n/a |

### Article 15 — Right of access

| Requirement | TJFit today |
|---|---|
| User can see what data is stored about them | **Partial** — `/api/tjai/memory` GET shows TJAI long-memory; `/api/profiles/me` shows profile. No unified "all your data" view. |

## Specific FK gap

[supabase/migrations/20260405193000_tjai_upgrades.sql](../../supabase/migrations/20260405193000_tjai_upgrades.sql):

```sql
coach_id uuid REFERENCES auth.users(id),
```

No `ON DELETE` clause → defaults to `NO ACTION`. Deleting a coach user fails with a foreign-key violation. Fix when account deletion ships: change to `ON DELETE SET NULL` (preserve historical attribution as anonymized) or `ON DELETE CASCADE` (wipe the upgrade record entirely).

## Recommended implementation (for a future ⚠ phase)

### Minimum viable delete

1. **API:** new `DELETE /api/account` route. `requireAuth`. Confirms user identity via a recently-issued password reauth or a typed confirmation string (e.g. "delete my account"). Calls `supabase.auth.admin.deleteUser(user.id)` server-side via service-role key. Records the deletion timestamp into an `account_deletions` audit table (no PII, just `deleted_at`).
2. **UI:** new `/settings/account` page (or section inside existing `/settings/profile`) with a clearly-labeled danger zone. Two-step confirm. Localized in en/tr/ar/es/fr.
3. **DB:** fix the `coach_id` FK gap before launching the API.
4. **Email:** auto-send a localized "your TJFit account has been deleted" email via existing `email-templates.ts` (need new template).

### Minimum viable export

1. **API:** new `GET /api/account/export`. `requireAuth`. Streams a JSON file containing the user's profile, settings, TJAI memory, saved plans, progress entries, blog posts authored, messages sent/received (with consent caveat), purchase history. **Excludes:** other users' inbound messages, anything containing other users' email/phone.
2. **UI:** "Download my data" button in `/settings/account`. Generates the file on demand.
3. **Format:** single JSON file. CSV optional later.
4. **Rate-limit:** one export request per hour per user (already have `src/lib/rate-limit.ts`).

## Eval coverage gap

The 17 cases in [tests/tjai-eval/cases.json](../../tests/tjai-eval/cases.json) don't include account-deletion or data-export scenarios. Add 1-2 cases later (e.g., "How do I delete my account?", "I want to download all my data") to verify TJAI itself routes the user correctly toward the future settings flow instead of attempting the action via chat (which is unsafe per Cycle 016).

## Severity rationale

- **Article 17 missing → P0 if EU users are served.** The DPA/regulator surface here is real, not theoretical. Production audits frequently flag this on the first review.
- **Article 20 missing → P1.** Less aggressive enforcement than Article 17 but still required.
- **`coach_id` FK gap → P2.** Latent — only bites when deletion actually runs.
- **Article 15 unified view → P3.** Partial coverage exists; better view is a nice-to-have once 17/20 ship.

## What this audit did NOT cover

- Existing privacy policy / terms-of-service language about deletion timeframe.
- Backup / log retention policy.
- Whether Vercel + Supabase + Resend (the third-party stack) each have a "process a deletion request" pathway documented.
- Any contractual data-retention obligation (e.g. tax records for paid orders may need to persist beyond user deletion — covered by GDPR Article 17(3)(b)).
- iOS / Android app-store account-deletion requirements (App Store requires in-app delete from iOS 15 + ; TJFit appears web-only today).

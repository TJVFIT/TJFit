# Supabase DB Hardening Audit — 2026-06-23

Run via `get_advisors` on `kohuiyqyixvrcqeepalz` right after the DB restore.
**Conclusion: do NOT blind-apply.** Most findings are intentional or bulk optimizations
that need careful, tested migrations — not autonomous batch changes on a live revenue DB.

## Security (28 findings)

### Likely intentional — verify, don't auto-change
- **RLS enabled, no policy (8 tables):** `bundle_gumroad_products`, `coach_profile_views`,
  `marketing_subscribers`, `newsletter_subscribers`, `program_catalog_flags`,
  `program_preview_views`, `reengagement_emails`, `tjai_plan_analytics`. RLS-on + no-policy =
  **deny-all except service role** — safe by design for admin/analytics tables. No action.
- **Permissive INSERT policies (public forms):** `affiliates` (apply), `coach_applications`
  (apply), `feedback_submissions`, `store_waitlist` (join). `WITH CHECK (true)` is intentional
  for anonymous submission forms — anyone can submit, no one can read. **Risk = spam, not leak.**
  Harden with app-level rate-limiting/validation, not by removing the policy (would break forms).
- **SECURITY DEFINER RPCs (anon + authenticated):** `get_profile_card`, `increment_blog_view_count`,
  `assert_can_message_peer`, `create_direct_conversation`, `get_conversation_peer`,
  `list_my_conversations_with_peers`, `mark_conversation_read`, `search_profiles`,
  `tjfit_toggle_suggestion_vote`, `tjfit_workout_records`. These are RPCs **the app calls** —
  revoking EXECUTE would break features. Audit each for internal `auth.uid()` checks instead.

### Genuine quick win (owner)
- 🟢 **Enable leaked-password protection** (Supabase Auth → HaveIBeenPwned). Dashboard toggle,
  zero risk, real benefit. *Owner action — no MCP tool for auth config.*

## Performance (487 findings — optimizations, not bugs)
- **228 `multiple_permissive_policies`** — multiple permissive RLS policies per role/action;
  Postgres evaluates all. Consolidate per table. Medium effort, low urgency.
- **135 `auth_rls_initplan`** — policies call `auth.uid()` directly; wrap as `(select auth.uid())`
  so it evaluates once per query, not per row. **Highest-value perf fix** — but it's ~135 policy
  rewrites across ~90 tables. Do as a *tested* migration batch, ideally on a branch DB first.
- **124 `unused_index`** — ⚠️ **DO NOT DROP NOW.** Index usage stats reset on the DB restore, so
  "unused" is unreliable today. Re-check after a week of real traffic before dropping anything.

## Recommended sequencing (when owner greenlights DB work)
1. Owner: enable leaked-password protection (1 click).
2. Add rate-limiting on the 4 public-insert endpoints (app-level, safe).
3. Plan a tested `auth_rls_initplan` migration on a Supabase **branch**, verify app access, then merge.
4. Defer `unused_index` cleanup until usage stats re-accumulate.
5. Consolidate multiple-permissive policies opportunistically alongside #3.

*No DB changes were applied in this pass — by design. These are tracked for a careful, tested rollout.*

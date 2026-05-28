# Supabase RLS Spot-Check — 2026-05-27 (Plan2 phase 18, approved)

**Method:** static review of `supabase/migrations/*.sql` (77 files) for `enable row level security` + `create policy` on the sensitive tables named in the Plan 2 spec. Case-insensitive (the codebase mixes `ALTER TABLE` and `alter table`).

## Result: RLS is comprehensive and owner-scoped

| Table | RLS enabled | Owner policy | Notes |
|---|---|---|---|
| `tjai_long_memory` | ✓ | `auth.uid() = user_id` FOR ALL | + `ON DELETE CASCADE` from auth.users |
| `tjai_user_settings` | ✓ | `auth.uid() = user_id` FOR ALL | |
| `tjai_chat_messages` | ✓ | "Users own messages" | |
| `program_orders` | ✓ | `"Users can read own orders" using (auth.uid() = user_id)` | Writes happen via service-role API only |
| `community_blog_posts` | ✓ | public-read for `status='published'` + owner write | Public read is intentional (published posts) |
| `progress_entries` | ✓ | owner read/insert/update/delete | |
| `workout_logs` | ✓ | owner read/insert/update/delete | |
| `progress_milestones` | ✓ | owner read/insert/update/delete | |
| `messages` | ✓ | participant-scoped select/insert + before-insert enforcement trigger (2-party only) | |
| `conversations` / `conversation_participants` | ✓ | participant-scoped | |
| `coach_student_links` | ✓ | `auth.uid() = coach_id or auth.uid() = student_id` | |
| `user_public_keys` | ✓ | public read (keys), owner write | E2E key exchange — public read is correct |
| `tjfit_coin_wallets` | ✓ | owner read | Legacy (TJCoin retired; data preserved) |
| `coach_review_requests` | ✓ | owner read | See FK fix below |

No sensitive table was found with RLS disabled. No policy was found that leaks another user's rows.

## Defense-in-depth note

`program_orders` enables RLS with an owner-only SELECT policy and **no INSERT/UPDATE/DELETE policy** — meaning direct client writes are denied. All order mutations route through service-role API handlers (`/api/checkout/*`) that enforce ownership in code. This is the correct posture: customers cannot fabricate or read others' orders from the client.

## Fix applied (migration file)

[supabase/migrations/20260527120000_fix_coach_id_fk_ondelete.sql](../../supabase/migrations/20260527120000_fix_coach_id_fk_ondelete.sql)

The Phase 11 audit found `coach_review_requests.coach_id` referenced `auth.users(id)` with **no `ON DELETE` clause** (defaults to RESTRICT) — the only such FK in the schema. That would block deletion of any coach user. The migration drops the unnamed constraint and re-adds it as `ON DELETE SET NULL` (preserves the requesting user's review history; anonymizes the coach attribution).

**Not applied yet.** The migration is committed but `supabase db push` was NOT run from this session (DB writes require explicit owner action / Supabase access). Apply on next migration run / deploy.

## What this spot-check did NOT cover

- Live `\d+` introspection against the running Supabase instance (would catch dashboard-created tables/policies not in migration files).
- Policy *correctness under edge cases* (e.g. whether the messages before-insert trigger truly blocks 3-party threads) — would need runtime tests.
- Storage bucket policies (progress photos, PDFs) — separate pass.
- `SECURITY DEFINER` function audit (RPCs like `consume_trial_message`, `tjfit_grant_program_purchase_coins`) — they run as definer; should be reviewed for privilege escalation in a future pass.

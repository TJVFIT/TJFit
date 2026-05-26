# Supabase — TJFit

## Layout

- Client bootstrap: `src/lib/supabase.ts`
- Migrations: `supabase/migrations/` (timestamp-prefixed SQL files; see README for the full applied list)
- RLS policies live alongside table definitions in migrations.

## Hard rules

- Never edit an existing migration file in-place. Always create a new timestamped one.
- Never disable RLS or open a policy to `public` without an explicit owner request.
- Never apply a migration in production without confirming with the owner. Local/branch testing is fine via the Supabase MCP (`apply_migration`) when scoped to a non-production branch.
- Never commit `SUPABASE_SERVICE_ROLE_KEY` or any anon/service token.

## When the task is DB-related

1. List the tables/columns you intend to touch and confirm with the owner before writing SQL.
2. Pair every new column/table with an RLS policy.
3. Service-role usage is server-only — never import the service key into a client component.

## Related context

- README lists every required migration with status.
- `tjfit_coin_*` tables are load-bearing for fulfillment — extra care.

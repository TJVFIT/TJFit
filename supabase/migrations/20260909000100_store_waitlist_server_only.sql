-- Waitlist requests must pass through the validated, rate-limited server route.
-- A direct PostgREST INSERT would otherwise bypass those checks.
alter table public.store_waitlist enable row level security;

drop policy if exists "Public joins waitlist" on public.store_waitlist;

revoke all privileges on table public.store_waitlist
  from public, anon, authenticated;
revoke all privileges (id, email, created_at) on table public.store_waitlist
  from public, anon, authenticated;

-- The server upserts by email; preserve its conflict-read/update permissions.
grant select, insert, update on table public.store_waitlist to service_role;

notify pgrst, 'reload schema';

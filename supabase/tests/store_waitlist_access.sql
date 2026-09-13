-- Run after 20260909000100_store_waitlist_server_only.sql in a local or branch DB.
-- This inspects effective privileges without reading email rows or writing data.
begin transaction read only;

do $$
declare
  web_role text;
  required_privilege text;
begin
  if not coalesce((
    select relrowsecurity
    from pg_class
    where oid = to_regclass('public.store_waitlist')
  ), false) then
    raise exception 'store_waitlist must exist with row-level security enabled';
  end if;

  foreach web_role in array array['public', 'anon', 'authenticated'] loop
    if has_table_privilege(web_role, 'public.store_waitlist',
      'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
      or has_any_column_privilege(web_role, 'public.store_waitlist',
        'SELECT, INSERT, UPDATE, REFERENCES') then
      raise exception 'Unexpected direct store_waitlist access for %', web_role;
    end if;
  end loop;

  foreach required_privilege in array array['SELECT', 'INSERT', 'UPDATE'] loop
    if not has_table_privilege('service_role', 'public.store_waitlist', required_privilege) then
      raise exception 'Server waitlist upsert is missing % privilege', required_privilege;
    end if;
  end loop;

  if not coalesce((select rolbypassrls from pg_roles where rolname = 'service_role'), false) then
    raise exception 'Expected the Supabase service_role to bypass RLS';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'store_waitlist'
      and policyname = 'Public joins waitlist'
  ) then
    raise exception 'The unconditional public waitlist policy still exists';
  end if;
end $$;

rollback;

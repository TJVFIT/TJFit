-- Keep identity, authority, entitlements and earned counters server-owned.
-- RLS still determines whose profile can be edited; column grants determine what.
-- No profile data, SELECT policy, service-role grant or signup trigger is changed.
begin;

-- Auth's trusted signup trigger omits this field. Generate new codes in the DB,
-- without accepting browser metadata or rewriting existing/null legacy rows.
alter table public.profiles alter column referral_code
  set default ('TJ-' || upper(replace(gen_random_uuid()::text, '-', '')));

revoke insert, update, delete, truncate, references, trigger
  on table public.profiles from public, anon, authenticated;

do $$
declare
  profile_column record;
  credit_function record;
  editable_columns constant text[] := array[
    'username', 'display_name', 'avatar_url', 'bio',
    'is_private', 'is_searchable', 'message_privacy',
    'privacy_settings', 'banner_color', 'display_badge_key'
  ];
begin
  -- Revoking table privileges does not revoke old column-specific grants.
  -- Iterate actual columns to handle production schema drift without granting
  -- new/unknown fields. updated_at and username_normalized remain trigger-owned.
  for profile_column in
    select attname from pg_catalog.pg_attribute
    where attrelid = 'public.profiles'::regclass and attnum > 0 and not attisdropped
  loop
    execute format('revoke insert (%I), update (%I), references (%I) on table public.profiles from public, anon, authenticated',
      profile_column.attname, profile_column.attname, profile_column.attname);
    if profile_column.attname = any(editable_columns) then
      execute format('grant update (%I) on table public.profiles to authenticated', profile_column.attname);
    end if;
  end loop;

  -- Defensive reinforcement of the currently service-only legacy credit RPCs.
  -- Their SECURITY DEFINER bodies accept a user id; clients must never call them.
  for credit_function in
    select p.oid::regprocedure as signature
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('grant_tjai_credit', 'consume_tjai_credit')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', credit_function.signature);
    execute format('grant execute on function %s to service_role', credit_function.signature);
  end loop;
end;
$$;

commit;

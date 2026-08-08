-- TJFit API hardening:
--   * make coin redemption atomic and optionally idempotent
--   * prevent self-service privilege / balance escalation through profiles
--   * enforce the coach upload cap under concurrency
--   * pre-create restricted storage buckets
--   * remove direct Data API access to tables served only through backend APIs

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Server-managed profile fields
-- ---------------------------------------------------------------------------

create or replace function private.protect_profile_managed_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  protected_field text;
  protected_fields constant text[] := array[
    'id',
    'email',
    'role',
    'username_normalized',
    'created_at',
    'updated_at',
    'is_verified',
    'referral_code',
    'display_badge',
    'display_badge_key',
    'current_streak',
    'longest_streak',
    'last_activity_date',
    'tjxp',
    'level',
    'subscription_tier',
    'tjai_credit_balance'
  ];
begin
  -- Service-role and trusted database operations do not carry an auth.uid().
  -- A user session may edit its profile, but never server-managed fields.
  if (select auth.uid()) = old.id then
    foreach protected_field in array protected_fields loop
      if (to_jsonb(new) -> protected_field)
        is distinct from (to_jsonb(old) -> protected_field) then
        raise exception 'profile_field_is_server_managed'
          using errcode = '42501';
      end if;
    end loop;
  end if;

  return new;
end;
$$;

revoke all on function private.protect_profile_managed_fields()
  from public, anon, authenticated;

drop trigger if exists protect_profile_managed_fields on public.profiles;
create trigger protect_profile_managed_fields
before update on public.profiles
for each row execute function private.protect_profile_managed_fields();

-- Consolidate the duplicate own-profile SELECT policies found in production.
drop policy if exists "Profiles read own" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users update own profile fields" on public.profiles;
create policy "Users update own profile fields"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- Wallet provisioning and atomic redemption
-- ---------------------------------------------------------------------------

create or replace function private.ensure_tjfit_wallet_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.tjfit_coin_wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.ensure_tjfit_wallet_for_new_user()
  from public, anon, authenticated, service_role;

drop trigger if exists ensure_tjfit_wallet_for_new_user on auth.users;
create trigger ensure_tjfit_wallet_for_new_user
after insert on auth.users
for each row execute function private.ensure_tjfit_wallet_for_new_user();

insert into public.tjfit_coin_wallets (user_id)
select id from auth.users
on conflict (user_id) do nothing;

alter table public.tjfit_discount_codes
  add column if not exists idempotency_key text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tjfit_discount_codes_idempotency_key_length'
      and conrelid = 'public.tjfit_discount_codes'::regclass
  ) then
    alter table public.tjfit_discount_codes
      add constraint tjfit_discount_codes_idempotency_key_length
      check (
        idempotency_key is null
        or char_length(idempotency_key) between 8 and 128
      );
  end if;
end;
$$;

create unique index if not exists uniq_tjfit_discount_codes_user_idempotency
  on public.tjfit_discount_codes (user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists idx_tjfit_discount_codes_user_status_created
  on public.tjfit_discount_codes (user_id, status, created_at desc);

create index if not exists idx_tjfit_coin_ledger_user_created
  on public.tjfit_coin_ledger (user_id, created_at desc);

create or replace function public.redeem_tjfit_discount(
  p_user_id uuid,
  p_offer_key text,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_offer public.tjfit_discount_offers%rowtype;
  v_wallet public.tjfit_coin_wallets%rowtype;
  v_existing_code public.tjfit_discount_codes%rowtype;
  v_code text;
  v_inserted boolean := false;
begin
  if p_user_id is null or not exists (
    select 1 from auth.users where id = p_user_id
  ) then
    raise exception 'invalid_user' using errcode = 'TJ003';
  end if;

  if p_idempotency_key is not null
    and char_length(p_idempotency_key) not between 8 and 128 then
    raise exception 'invalid_idempotency_key' using errcode = '22023';
  end if;

  insert into public.tjfit_coin_wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select *
  into strict v_wallet
  from public.tjfit_coin_wallets
  where user_id = p_user_id
  for update;

  -- The wallet lock serializes redemptions for this user. Checking the key
  -- after taking the lock makes simultaneous retries return the same code.
  if p_idempotency_key is not null then
    select *
    into v_existing_code
    from public.tjfit_discount_codes
    where user_id = p_user_id
      and idempotency_key = p_idempotency_key;

    if found then
      select *
      into strict v_offer
      from public.tjfit_discount_offers
      where key = v_existing_code.offer_key;

      return jsonb_build_object(
        'code', v_existing_code.code,
        'idempotent', true,
        'offer', jsonb_build_object(
          'key', v_offer.key,
          'title', v_offer.title,
          'coin_cost', v_offer.coin_cost,
          'discount_percent', v_existing_code.discount_percent,
          'active', v_offer.active
        ),
        'wallet', jsonb_build_object(
          'balance', v_wallet.balance,
          'lifetime_earned', v_wallet.lifetime_earned,
          'lifetime_spent', v_wallet.lifetime_spent
        )
      );
    end if;
  end if;

  select *
  into v_offer
  from public.tjfit_discount_offers
  where key = p_offer_key
    and active = true;

  if not found then
    raise exception 'offer_not_found' using errcode = 'TJ002';
  end if;

  if v_wallet.balance < v_offer.coin_cost then
    raise exception 'insufficient_balance' using errcode = 'TJ001';
  end if;

  for attempt in 1..10 loop
    v_code :=
      'TJFIT-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
    begin
      insert into public.tjfit_discount_codes (
        code,
        user_id,
        offer_key,
        discount_percent,
        status,
        idempotency_key
      )
      values (
        v_code,
        p_user_id,
        v_offer.key,
        v_offer.discount_percent,
        'available',
        p_idempotency_key
      );
      v_inserted := true;
      exit;
    exception
      when unique_violation then
        -- Cryptographically random code collisions are retried. The wallet
        -- lock prevents an idempotency collision for the same user here.
        null;
    end;
  end loop;

  if not v_inserted then
    raise exception 'discount_code_generation_failed' using errcode = 'TJ004';
  end if;

  update public.tjfit_coin_wallets
  set
    balance = balance - v_offer.coin_cost,
    lifetime_spent = lifetime_spent + v_offer.coin_cost,
    updated_at = now()
  where user_id = p_user_id
  returning * into strict v_wallet;

  insert into public.tjfit_coin_ledger (
    user_id,
    delta,
    reason,
    metadata
  )
  values (
    p_user_id,
    -v_offer.coin_cost,
    'discount_code_redeem',
    jsonb_build_object(
      'offerKey', v_offer.key,
      'discountPercent', v_offer.discount_percent,
      'code', v_code,
      'idempotencyKey', p_idempotency_key
    )
  );

  return jsonb_build_object(
    'code', v_code,
    'idempotent', false,
    'offer', jsonb_build_object(
      'key', v_offer.key,
      'title', v_offer.title,
      'coin_cost', v_offer.coin_cost,
      'discount_percent', v_offer.discount_percent,
      'active', v_offer.active
    ),
    'wallet', jsonb_build_object(
      'balance', v_wallet.balance,
      'lifetime_earned', v_wallet.lifetime_earned,
      'lifetime_spent', v_wallet.lifetime_spent
    )
  );
end;
$$;

revoke all on function public.redeem_tjfit_discount(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.redeem_tjfit_discount(uuid, text, text)
  to service_role;

-- ---------------------------------------------------------------------------
-- Concurrency-safe coach upload limit
-- ---------------------------------------------------------------------------

create or replace function private.enforce_custom_program_coach_limit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  active_count integer;
begin
  if new.active and new.uploader_role = 'coach' then
    perform pg_advisory_xact_lock(
      hashtextextended(new.uploaded_by::text, 0)
    );

    select count(*)
    into active_count
    from public.custom_programs
    where uploaded_by = new.uploaded_by
      and uploader_role = 'coach'
      and active = true
      and id <> new.id;

    if active_count >= 3 then
      raise exception 'coach_program_limit_reached'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_custom_program_coach_limit()
  from public, anon, authenticated;

drop trigger if exists enforce_custom_program_coach_limit
  on public.custom_programs;
create trigger enforce_custom_program_coach_limit
before insert or update of active, uploaded_by, uploader_role
on public.custom_programs
for each row execute function private.enforce_custom_program_coach_limit();

-- ---------------------------------------------------------------------------
-- Storage and direct Data API surface
-- ---------------------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'community-blog-images',
    'community-blog-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'program-assets',
    'program-assets',
    false,
    20971520,
    array['application/pdf']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- These tables are intentionally served through scoped Next.js APIs. In
-- particular, custom_programs contains private PDF paths/source text, so a
-- broad Data API SELECT would expose columns that the public API omits.
revoke all on table
  public.program_orders,
  public.tjfit_coin_wallets,
  public.tjfit_coin_ledger,
  public.tjfit_discount_offers,
  public.tjfit_discount_codes,
  public.custom_programs,
  public.marketing_subscribers,
  public.community_blog_posts
from anon, authenticated;

notify pgrst, 'reload schema';

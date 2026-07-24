-- Harden TJFit program checkout around server-authoritative orders and
-- transactionally idempotent PayTR/test fulfillment.

alter table public.program_orders
  add column if not exists idempotency_key text,
  add column if not exists amount_minor bigint,
  add column if not exists final_amount_minor bigint,
  add column if not exists payment_expires_at timestamptz,
  add column if not exists provider_token_created_at timestamptz,
  add column if not exists provider_error text,
  add column if not exists paytr_test_mode boolean not null default false;

update public.program_orders
set
  amount_minor = amount_try::bigint * 100,
  final_amount_minor = final_amount_try::bigint * 100
where amount_minor is null or final_amount_minor is null;

alter table public.program_orders
  alter column amount_minor set not null,
  alter column final_amount_minor set not null;

alter table public.program_orders
  add constraint program_orders_minor_amount_check
  check (
    amount_minor >= 0
    and final_amount_minor >= 0
    and final_amount_minor <= amount_minor
  );

alter table public.program_orders
  drop constraint if exists program_orders_idempotency_key_check;

alter table public.program_orders
  add constraint program_orders_idempotency_key_check
  check (
    idempotency_key is null
    or char_length(idempotency_key) between 16 and 128
  );

create unique index if not exists program_orders_user_idempotency_key_idx
  on public.program_orders (user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists program_orders_user_created_at_idx
  on public.program_orders (user_id, created_at desc);

alter table public.tjfit_discount_codes
  add column if not exists reserved_at timestamptz,
  add column if not exists reservation_expires_at timestamptz;

alter table public.tjfit_discount_codes
  drop constraint if exists tjfit_discount_codes_status_check;

alter table public.tjfit_discount_codes
  add constraint tjfit_discount_codes_status_check
  check (status in ('available', 'reserved', 'used', 'expired'));

create table if not exists public.paytr_callbacks (
  merchant_oid text primary key,
  order_id uuid not null references public.program_orders(id) on delete restrict,
  status text not null check (status in ('success', 'failed')),
  total_amount_minor bigint not null check (total_amount_minor >= 0),
  payment_amount_minor bigint,
  currency text,
  test_mode boolean not null default false,
  failed_reason_code text,
  failed_reason_msg text,
  raw_payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz not null default now()
);

alter table public.paytr_callbacks enable row level security;

revoke all on table public.paytr_callbacks from anon, authenticated;
grant select, insert on table public.paytr_callbacks to service_role;

create table if not exists public.program_entitlements (
  order_id uuid primary key references public.program_orders(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text not null,
  status text not null default 'active'
    check (status in ('active', 'revoked', 'refunded')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists program_entitlements_user_program_idx
  on public.program_entitlements (user_id, program_slug, status);

alter table public.program_entitlements enable row level security;

create policy "Users can read own program entitlements"
  on public.program_entitlements for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.program_entitlements from anon, authenticated;
grant select on table public.program_entitlements to authenticated;
grant select, insert, update on table public.program_entitlements to service_role;

create or replace function public.create_program_order(
  p_user_id uuid,
  p_program_slug text,
  p_amount_minor bigint,
  p_final_amount_minor bigint,
  p_currency text,
  p_provider text,
  p_provider_order_id text,
  p_idempotency_key text,
  p_discount_code text,
  p_discount_percent integer,
  p_coins_earned integer,
  p_payment_expires_at timestamptz,
  p_paytr_test_mode boolean
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing public.program_orders%rowtype;
  v_order public.program_orders%rowtype;
  v_discount public.tjfit_discount_codes%rowtype;
  v_discount_code text := nullif(upper(btrim(p_discount_code)), '');
begin
  if p_user_id is null then
    raise exception 'invalid_user';
  end if;
  if p_program_slug is null
    or char_length(p_program_slug) < 2
    or char_length(p_program_slug) > 160
    or p_program_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'invalid_program_slug';
  end if;
  if p_amount_minor < 0
    or p_final_amount_minor < 0
    or p_final_amount_minor > p_amount_minor
  then
    raise exception 'invalid_order_amount';
  end if;
  if p_currency <> 'TRY' or p_provider not in ('paytr', 'test') then
    raise exception 'invalid_payment_provider';
  end if;
  if p_provider_order_id is null
    or char_length(p_provider_order_id) > 64
    or p_provider_order_id !~ '^[A-Za-z0-9]+$'
  then
    raise exception 'invalid_provider_order_id';
  end if;
  if p_idempotency_key is null
    or char_length(p_idempotency_key) < 16
    or char_length(p_idempotency_key) > 128
  then
    raise exception 'invalid_idempotency_key';
  end if;
  if p_discount_percent < 0 or p_discount_percent > 100 then
    raise exception 'invalid_discount';
  end if;
  if (v_discount_code is null and p_discount_percent <> 0)
    or (v_discount_code is not null and p_discount_percent = 0)
  then
    raise exception 'invalid_discount';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text || ':' || p_idempotency_key, 0)
  );

  select *
    into v_existing
    from public.program_orders
    where user_id = p_user_id
      and idempotency_key = p_idempotency_key;

  if found then
    if v_existing.status = 'pending'
      and v_existing.payment_expires_at <= pg_catalog.now()
    then
      update public.program_orders
        set status = 'failed',
            provider_error = 'payment_expired'
        where id = v_existing.id
        returning * into v_existing;
    end if;
    return pg_catalog.to_jsonb(v_existing);
  end if;

  if v_discount_code is not null then
    select *
      into v_discount
      from public.tjfit_discount_codes
      where code = v_discount_code
        and user_id = p_user_id
      for update;

    if not found
      or v_discount.discount_percent <> p_discount_percent
      or v_discount.status <> 'available'
    then
      raise exception 'invalid_or_unavailable_discount';
    end if;
  end if;

  insert into public.program_orders (
    user_id,
    program_slug,
    amount_try,
    final_amount_try,
    amount_minor,
    final_amount_minor,
    currency,
    provider,
    provider_order_id,
    idempotency_key,
    status,
    discount_code,
    discount_percent,
    tjfit_coins_earned,
    payment_expires_at,
    paytr_test_mode
  )
  values (
    p_user_id,
    p_program_slug,
    pg_catalog.round(p_amount_minor::numeric / 100)::integer,
    pg_catalog.round(p_final_amount_minor::numeric / 100)::integer,
    p_amount_minor,
    p_final_amount_minor,
    p_currency,
    p_provider,
    p_provider_order_id,
    p_idempotency_key,
    'pending',
    v_discount_code,
    p_discount_percent,
    p_coins_earned,
    p_payment_expires_at,
    p_paytr_test_mode
  )
  returning * into v_order;

  if v_discount_code is not null then
    update public.tjfit_discount_codes
      set status = 'reserved',
          reserved_at = pg_catalog.now(),
          reservation_expires_at = p_payment_expires_at,
          order_id = v_order.id
      where code = v_discount_code
        and user_id = p_user_id;
  end if;

  return pg_catalog.to_jsonb(v_order);
end;
$$;

create or replace function public.cancel_program_order_setup(
  p_order_id uuid,
  p_provider_error text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order public.program_orders%rowtype;
begin
  select *
    into v_order
    from public.program_orders
    where id = p_order_id
    for update;

  if not found or v_order.status <> 'pending' then
    return false;
  end if;

  update public.program_orders
    set status = 'failed',
        provider_error = left(coalesce(p_provider_error, 'provider_setup_failed'), 500)
    where id = v_order.id;

  update public.tjfit_discount_codes
    set status = 'available',
        reserved_at = null,
        reservation_expires_at = null,
        order_id = null
    where order_id = v_order.id
      and status = 'reserved';

  return true;
end;
$$;

create or replace function public.fulfill_test_program_order(
  p_order_id uuid,
  p_user_id uuid,
  p_coins_earned integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order public.program_orders%rowtype;
  v_wallet public.tjfit_coin_wallets%rowtype;
begin
  if p_coins_earned < 0 then
    raise exception 'invalid_coin_amount';
  end if;

  select *
    into v_order
    from public.program_orders
    where id = p_order_id
      and user_id = p_user_id
    for update;

  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.provider <> 'test' then
    raise exception 'invalid_order_provider';
  end if;

  if v_order.status = 'paid' then
    select *
      into v_wallet
      from public.tjfit_coin_wallets
      where user_id = p_user_id;

    return pg_catalog.jsonb_build_object(
      'result', 'already_paid',
      'order_id', v_order.id,
      'order_status', v_order.status,
      'wallet', pg_catalog.to_jsonb(v_wallet)
    );
  end if;

  if v_order.status <> 'pending' then
    raise exception 'order_not_pending';
  end if;

  update public.program_orders
    set status = 'paid',
        paid_at = pg_catalog.now(),
        provider_error = null,
        tjfit_coins_earned = p_coins_earned
    where id = v_order.id;

  insert into public.tjfit_coin_wallets (
    user_id,
    balance,
    lifetime_earned,
    lifetime_spent,
    updated_at
  )
  values (p_user_id, p_coins_earned, p_coins_earned, 0, pg_catalog.now())
  on conflict (user_id) do update
    set balance = public.tjfit_coin_wallets.balance + excluded.balance,
        lifetime_earned = public.tjfit_coin_wallets.lifetime_earned + excluded.lifetime_earned,
        updated_at = pg_catalog.now()
  returning * into v_wallet;

  insert into public.tjfit_coin_ledger (
    user_id,
    delta,
    reason,
    order_id,
    metadata
  )
  values (
    p_user_id,
    p_coins_earned,
    'program_purchase',
    v_order.id,
    pg_catalog.jsonb_build_object('provider', 'test')
  );

  insert into public.program_entitlements (
    order_id,
    user_id,
    program_slug,
    metadata
  )
  values (
    v_order.id,
    p_user_id,
    v_order.program_slug,
    pg_catalog.jsonb_build_object('provider', 'test')
  )
  on conflict (order_id) do nothing;

  update public.tjfit_discount_codes
    set status = 'used',
        used_at = pg_catalog.now(),
        reserved_at = null,
        reservation_expires_at = null
    where order_id = v_order.id
      and user_id = p_user_id
      and status = 'reserved';

  return pg_catalog.jsonb_build_object(
    'result', 'paid',
    'order_id', v_order.id,
    'order_status', 'paid',
    'wallet', pg_catalog.to_jsonb(v_wallet)
  );
end;
$$;

create or replace function public.process_paytr_callback(
  p_merchant_oid text,
  p_status text,
  p_total_amount_minor bigint,
  p_payment_amount_minor bigint,
  p_currency text,
  p_test_mode boolean,
  p_failed_reason_code text,
  p_failed_reason_msg text,
  p_raw_payload jsonb,
  p_coins_earned integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order public.program_orders%rowtype;
  v_callback public.paytr_callbacks%rowtype;
  v_expected_amount_minor bigint;
begin
  if p_status not in ('success', 'failed') then
    raise exception 'invalid_callback_status';
  end if;
  if p_total_amount_minor < 0 or p_coins_earned < 0 then
    raise exception 'invalid_callback_amount';
  end if;

  select *
    into v_order
    from public.program_orders
    where provider_order_id = p_merchant_oid
    for update;

  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.provider <> 'paytr' then
    raise exception 'invalid_order_provider';
  end if;

  select *
    into v_callback
    from public.paytr_callbacks
    where merchant_oid = p_merchant_oid;

  if found then
    return pg_catalog.jsonb_build_object(
      'result', 'duplicate',
      'order_id', v_order.id,
      'order_status', v_order.status
    );
  end if;

  if p_test_mode <> v_order.paytr_test_mode then
    raise exception 'callback_test_mode_mismatch';
  end if;

  v_expected_amount_minor := v_order.final_amount_minor;

  if p_status = 'success' then
    if p_payment_amount_minor is null
      or p_payment_amount_minor <> v_expected_amount_minor
      or p_total_amount_minor < v_expected_amount_minor
    then
      raise exception 'callback_amount_mismatch';
    end if;
    if upper(coalesce(p_currency, '')) not in ('TL', 'TRY') then
      raise exception 'callback_currency_mismatch';
    end if;
  end if;

  insert into public.paytr_callbacks (
    merchant_oid,
    order_id,
    status,
    total_amount_minor,
    payment_amount_minor,
    currency,
    test_mode,
    failed_reason_code,
    failed_reason_msg,
    raw_payload
  )
  values (
    p_merchant_oid,
    v_order.id,
    p_status,
    p_total_amount_minor,
    p_payment_amount_minor,
    nullif(upper(p_currency), ''),
    p_test_mode,
    nullif(left(p_failed_reason_code, 50), ''),
    nullif(left(p_failed_reason_msg, 500), ''),
    coalesce(p_raw_payload, '{}'::jsonb)
  );

  if p_status = 'failed' then
    if v_order.status in ('pending', 'failed') then
      update public.program_orders
        set status = 'failed',
            provider_error = left(
              concat_ws(': ', nullif(p_failed_reason_code, ''), nullif(p_failed_reason_msg, '')),
              500
            )
        where id = v_order.id;

      update public.tjfit_discount_codes
        set status = 'available',
            reserved_at = null,
            reservation_expires_at = null,
            order_id = null
        where order_id = v_order.id
          and status = 'reserved';
    end if;

    return pg_catalog.jsonb_build_object(
      'result', case when v_order.status = 'paid' then 'already_paid' else 'failed' end,
      'order_id', v_order.id,
      'order_status', case when v_order.status = 'paid' then 'paid' else 'failed' end
    );
  end if;

  if v_order.status = 'paid' then
    return pg_catalog.jsonb_build_object(
      'result', 'already_paid',
      'order_id', v_order.id,
      'order_status', 'paid'
    );
  end if;
  if v_order.status <> 'pending'
    and not (
      v_order.status = 'failed'
      and v_order.provider_token_created_at is not null
    )
  then
    raise exception 'order_not_pending';
  end if;

  update public.program_orders
    set status = 'paid',
        paid_at = pg_catalog.now(),
        provider_error = null,
        tjfit_coins_earned = p_coins_earned
    where id = v_order.id;

  insert into public.tjfit_coin_wallets (
    user_id,
    balance,
    lifetime_earned,
    lifetime_spent,
    updated_at
  )
  values (
    v_order.user_id,
    p_coins_earned,
    p_coins_earned,
    0,
    pg_catalog.now()
  )
  on conflict (user_id) do update
    set balance = public.tjfit_coin_wallets.balance + excluded.balance,
        lifetime_earned = public.tjfit_coin_wallets.lifetime_earned + excluded.lifetime_earned,
        updated_at = pg_catalog.now();

  insert into public.tjfit_coin_ledger (
    user_id,
    delta,
    reason,
    order_id,
    metadata
  )
  values (
    v_order.user_id,
    p_coins_earned,
    'program_purchase',
    v_order.id,
    pg_catalog.jsonb_build_object(
      'provider', 'paytr',
      'merchantOid', p_merchant_oid,
      'totalAmountMinor', p_total_amount_minor
    )
  );

  insert into public.program_entitlements (
    order_id,
    user_id,
    program_slug,
    metadata
  )
  values (
    v_order.id,
    v_order.user_id,
    v_order.program_slug,
    pg_catalog.jsonb_build_object(
      'provider', 'paytr',
      'merchantOid', p_merchant_oid
    )
  )
  on conflict (order_id) do nothing;

  update public.tjfit_discount_codes
    set status = 'used',
        used_at = pg_catalog.now(),
        reserved_at = null,
        reservation_expires_at = null
    where order_id = v_order.id
      and user_id = v_order.user_id
      and status = 'reserved';

  return pg_catalog.jsonb_build_object(
    'result', 'paid',
    'order_id', v_order.id,
    'order_status', 'paid'
  );
end;
$$;

revoke all on function public.create_program_order(
  uuid, text, bigint, bigint, text, text, text, text, text, integer, integer, timestamptz, boolean
) from public, anon, authenticated;
revoke all on function public.cancel_program_order_setup(uuid, text)
  from public, anon, authenticated;
revoke all on function public.fulfill_test_program_order(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.process_paytr_callback(
  text, text, bigint, bigint, text, boolean, text, text, jsonb, integer
) from public, anon, authenticated;

grant execute on function public.create_program_order(
  uuid, text, bigint, bigint, text, text, text, text, text, integer, integer, timestamptz, boolean
) to service_role;
grant execute on function public.cancel_program_order_setup(uuid, text)
  to service_role;
grant execute on function public.fulfill_test_program_order(uuid, uuid, integer)
  to service_role;
grant execute on function public.process_paytr_callback(
  text, text, bigint, bigint, text, boolean, text, text, jsonb, integer
) to service_role;

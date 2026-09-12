-- USD money and Lemon receipts are independent of the legacy TRY order ledger.
-- No test receipt can be inserted into an entitlement table.
create table public.digital_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  program_slug text not null,
  product_kind text not null check (product_kind in ('bundle','tjai_pass')),
  amount_minor integer not null check (amount_minor in (1000,1999)),
  currency text not null default 'USD' check (currency = 'USD'),
  store_id text not null,
  product_id text not null,
  variant_id text not null,
  test_mode boolean not null,
  intake_id uuid,
  locale text not null check (locale in ('en','tr','ar','es','fr')),
  status text not null default 'pending' check (status in ('pending','paid','test_paid','refunded','review')),
  provider_order_id text,
  checkout_id text,
  checkout_url text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  check ((product_kind = 'tjai_pass' and program_slug = 'tjai-pass' and amount_minor = 1999 and intake_id is not null)
    or (product_kind = 'bundle' and program_slug <> 'tjai-pass' and amount_minor = 1000 and intake_id is null))
);
create index digital_checkout_intents_user_idx on public.digital_checkout_intents(user_id, created_at desc);

create table public.lemon_order_receipts (
  test_mode boolean not null,
  provider_order_id text not null,
  intent_id uuid not null,
  store_id text not null,
  product_id text not null,
  variant_id text not null,
  amount_minor integer not null,
  total_minor integer not null,
  refunded boolean not null default false,
  review_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (test_mode, provider_order_id)
);
create table public.lemon_payment_events (
  payload_sha256 text primary key check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  test_mode boolean not null,
  provider_order_id text not null,
  event_name text not null check (event_name in ('order_created','order_refunded')),
  refunded boolean not null,
  outcome text not null,
  created_at timestamptz not null default now()
);

create table public.digital_bundle_purchases (
  provider text not null default 'lemonsqueezy' check (provider = 'lemonsqueezy'),
  provider_order_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  intent_id uuid not null unique references public.digital_checkout_intents(id),
  program_slug text not null,
  status text not null check (status in ('active','refunded')),
  test_mode boolean not null default false check (test_mode = false),
  created_at timestamptz not null default now(),
  refunded_at timestamptz,
  primary key (provider, provider_order_id)
);
create table public.tjai_pass_purchases (
  provider text not null default 'lemonsqueezy' check (provider = 'lemonsqueezy'),
  provider_order_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  intent_id uuid not null unique references public.digital_checkout_intents(id),
  status text not null check (status in ('active','refunded')),
  test_mode boolean not null default false check (test_mode = false),
  created_at timestamptz not null default now(),
  refunded_at timestamptz,
  primary key (provider, provider_order_id)
);
create index digital_bundle_purchases_access_idx on public.digital_bundle_purchases(user_id,program_slug,status);
create index tjai_pass_purchases_access_idx on public.tjai_pass_purchases(user_id,status);

alter table public.digital_checkout_intents enable row level security;
alter table public.lemon_order_receipts enable row level security;
alter table public.lemon_payment_events enable row level security;
alter table public.digital_bundle_purchases enable row level security;
alter table public.tjai_pass_purchases enable row level security;
revoke all on public.digital_checkout_intents, public.lemon_order_receipts, public.lemon_payment_events,
  public.digital_bundle_purchases, public.tjai_pass_purchases from anon, authenticated;
grant select on public.digital_bundle_purchases, public.tjai_pass_purchases to authenticated;
grant all on public.digital_checkout_intents, public.lemon_order_receipts, public.lemon_payment_events,
  public.digital_bundle_purchases, public.tjai_pass_purchases to service_role;
create policy "Read own digital bundle purchases" on public.digital_bundle_purchases for select to authenticated using (auth.uid() = user_id);
create policy "Read own TJAI pass purchases" on public.tjai_pass_purchases for select to authenticated using (auth.uid() = user_id);

-- Called only after raw-body HMAC authentication. The SQL transaction owns the
-- event, durable order binding, refund tombstone, and access transition together.
create or replace function public.apply_lemon_order_event(p_event jsonb, p_payload_sha256 text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_intent public.digital_checkout_intents%rowtype;
  v_receipt public.lemon_order_receipts%rowtype;
  v_mode boolean := (p_event->>'testMode')::boolean;
  v_order text := p_event->>'orderId';
  v_intent_id uuid := (p_event->>'intentId')::uuid;
  v_refund boolean := (p_event->>'refunded')::boolean;
  v_outcome text;
  v_reason text;
begin
  if v_mode is null or v_refund is null or v_order is null or v_order !~ '^[1-9][0-9]{0,14}$'
    or v_intent_id is null or p_payload_sha256 is null or p_payload_sha256 !~ '^[0-9a-f]{64}$'
    or p_event->>'eventName' not in ('order_created','order_refunded') then
    raise exception 'invalid_payment_event';
  end if;
  -- All events for one provider order serialize, even when event payloads differ.
  perform pg_advisory_xact_lock(hashtextextended('lemon:' || v_mode::text || ':' || v_order, 0));
  select outcome into v_outcome from public.lemon_payment_events where payload_sha256 = p_payload_sha256;
  if found then return jsonb_build_object('status',v_outcome,'duplicate',true); end if;

  select * into v_receipt from public.lemon_order_receipts where test_mode=v_mode and provider_order_id=v_order for update;
  if found then
    -- A signed refund revokes its durable order binding. Never trust new account metadata to redirect it.
    if v_receipt.store_id is distinct from p_event->>'storeId' or v_receipt.product_id is distinct from p_event->>'productId'
      or v_receipt.variant_id is distinct from p_event->>'variantId' or v_receipt.amount_minor is distinct from (p_event->>'amountMinor')::integer then
      v_reason := 'order_binding_mismatch';
    end if;
    v_refund := v_refund or v_receipt.refunded;
    v_intent_id := v_receipt.intent_id;
    update public.lemon_order_receipts set refunded=v_refund, updated_at=now() where test_mode=v_mode and provider_order_id=v_order;
  else
    insert into public.lemon_order_receipts(test_mode,provider_order_id,intent_id,store_id,product_id,variant_id,amount_minor,total_minor,refunded)
    values (v_mode,v_order,v_intent_id,p_event->>'storeId',p_event->>'productId',p_event->>'variantId',
      (p_event->>'amountMinor')::integer,(p_event->>'totalMinor')::integer,v_refund);
  end if;

  select * into v_intent from public.digital_checkout_intents where id=v_intent_id for update;
  if not found then v_reason := coalesce(v_reason,'intent_missing');
  elsif v_intent.test_mode is distinct from v_mode or v_intent.store_id is distinct from p_event->>'storeId'
    or v_intent.product_id is distinct from p_event->>'productId' or v_intent.variant_id is distinct from p_event->>'variantId'
    or v_intent.amount_minor is distinct from (p_event->>'amountMinor')::integer
    or (not v_refund and (v_intent_id is distinct from (p_event->>'intentId')::uuid or lower(v_intent.email) is distinct from lower(p_event->>'email'))) then
    v_reason := coalesce(v_reason,'intent_binding_mismatch');
  elsif v_intent.provider_order_id is not null and v_intent.provider_order_id <> v_order then
    v_reason := coalesce(v_reason,'intent_already_paid_by_another_order');
  end if;

  -- Revocation uses only this receipt's provider/order; it cannot affect a newer purchase.
  if v_refund and not v_mode then
    update public.digital_bundle_purchases set status='refunded',refunded_at=coalesce(refunded_at,now())
      where provider='lemonsqueezy' and provider_order_id=v_order;
    update public.tjai_pass_purchases set status='refunded',refunded_at=coalesce(refunded_at,now())
      where provider='lemonsqueezy' and provider_order_id=v_order;
  end if;
  if v_reason is not null then
    v_outcome := 'review';
    update public.lemon_order_receipts set review_reason=v_reason where test_mode=v_mode and provider_order_id=v_order;
  else
    v_outcome := case when v_refund then 'refunded' when v_mode then 'test_paid' else 'paid' end;
    update public.digital_checkout_intents set status=v_outcome,provider_order_id=v_order where id=v_intent_id;
    if not v_mode and not v_refund then
      if v_intent.product_kind='tjai_pass' then
        insert into public.tjai_pass_purchases(provider_order_id,user_id,intent_id,status)
          values(v_order,v_intent.user_id,v_intent_id,'active') on conflict do nothing;
      else
        insert into public.digital_bundle_purchases(provider_order_id,user_id,intent_id,program_slug,status)
          values(v_order,v_intent.user_id,v_intent_id,v_intent.program_slug,'active') on conflict do nothing;
      end if;
    end if;
  end if;
  insert into public.lemon_payment_events(payload_sha256,test_mode,provider_order_id,event_name,refunded,outcome)
    values(p_payload_sha256,v_mode,v_order,p_event->>'eventName',v_refund,v_outcome);
  return jsonb_build_object('status',v_outcome,'duplicate',false);
end;
$$;
revoke all on function public.apply_lemon_order_event(jsonb,text) from public, anon, authenticated;
grant execute on function public.apply_lemon_order_event(jsonb,text) to service_role;

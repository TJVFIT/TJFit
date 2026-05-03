-- v5 payment automation — sync + credits + commissions + payouts.
--
-- Per docs/MASTER_PLAN_v4.md (TJAI architecture) +
-- v5 master prompt (admin/payment automation).
--
-- Additive only. Coach FKs reference auth.users(id) for now —
-- coach_profiles table doesn't exist yet (only coach_applications +
-- coach_student_links + coach_profile_views). When a richer
-- coach_profiles table lands, drop and re-add the FKs pointing
-- there; existing data survives.

-- ============================================================
-- 1. Bidirectional Gumroad sync infrastructure
-- ============================================================
create table if not exists product_gumroad_sync (
  id uuid primary key default gen_random_uuid(),
  product_type text not null check (
    product_type in ('program', 'diet', 'tjai_credits', 'subscription')
  ),
  product_id uuid not null,
  gumroad_product_id text unique,
  gumroad_permalink text,
  gumroad_product_url text,
  is_published boolean not null default false,
  last_synced_at timestamptz,
  last_sync_direction text check (
    last_sync_direction in ('to_gumroad', 'from_gumroad', 'manual')
  ),
  sync_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_type, product_id)
);

create index if not exists idx_product_gumroad_sync_lookup
  on product_gumroad_sync(product_type, product_id);

create table if not exists sync_log (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('to_gumroad', 'from_gumroad')),
  action text not null,
  product_type text,
  local_id uuid,
  gumroad_id text,
  status text not null check (status in ('success', 'failed', 'partial')),
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  triggered_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sync_log_recent on sync_log(created_at desc);
create index if not exists idx_sync_log_failures
  on sync_log(status, created_at desc)
  where status = 'failed';

alter table product_gumroad_sync enable row level security;
alter table sync_log enable row level security;

drop policy if exists product_gumroad_sync_admin_only on product_gumroad_sync;
create policy product_gumroad_sync_admin_only on product_gumroad_sync
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists sync_log_admin_only on sync_log;
create policy sync_log_admin_only on sync_log
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 2. TJAI credits system
-- ============================================================
-- Add credit balance column to profiles table (existing). The
-- column doesn't already exist — add idempotently.
alter table profiles
  add column if not exists tjai_credit_balance int not null default 0
  check (tjai_credit_balance >= 0);

create table if not exists tjai_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Positive = credit purchased / granted. Negative = credit used.
  amount int not null,
  balance_after int not null check (balance_after >= 0),
  reason text not null check (
    reason in ('purchase', 'generation', 'refund', 'admin_grant', 'expiration', 'reversal')
  ),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tjai_credit_txn_user
  on tjai_credit_transactions(user_id, created_at desc);

create table if not exists tjai_credit_packs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_i18n jsonb not null,
  credits int not null check (credits > 0),
  price_usd numeric(10, 2) not null check (price_usd > 0),
  -- Per-tier price overrides (Tier 1 = full, Tier 2 ~50%, Tier 3 ~30%).
  -- Shape: { "tier1": 8.00, "tier2": 4.00, "tier3": 2.50 }
  price_per_tier jsonb,
  is_published boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Seed the three canonical packs.
insert into tjai_credit_packs (slug, name_i18n, credits, price_usd, price_per_tier, display_order)
values
  ('plan-1', '{"en":"1 Plan","tr":"1 Plan","ar":"خطة واحدة","es":"1 Plan","fr":"1 Plan"}'::jsonb,
    1, 8.00,
    '{"tier1":8.00,"tier2":4.00,"tier3":2.50}'::jsonb, 1),
  ('plans-5', '{"en":"5 Plans","tr":"5 Plan","ar":"5 خطط","es":"5 Planes","fr":"5 Plans"}'::jsonb,
    5, 35.00,
    '{"tier1":35.00,"tier2":17.50,"tier3":11.00}'::jsonb, 2),
  ('plans-10', '{"en":"10 Plans","tr":"10 Plan","ar":"10 خطط","es":"10 Planes","fr":"10 Plans"}'::jsonb,
    10, 65.00,
    '{"tier1":65.00,"tier2":32.50,"tier3":20.00}'::jsonb, 3)
on conflict (slug) do nothing;

alter table tjai_credit_transactions enable row level security;
alter table tjai_credit_packs enable row level security;

drop policy if exists tjai_credit_txn_select_own on tjai_credit_transactions;
create policy tjai_credit_txn_select_own on tjai_credit_transactions
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Public read on packs (so the /ai page can list them anonymously).
drop policy if exists tjai_credit_packs_public_read on tjai_credit_packs;
create policy tjai_credit_packs_public_read on tjai_credit_packs
  for select using (is_published = true);

-- ============================================================
-- 3. Atomic credit consumption RPC
-- ============================================================
-- Locks the profile row, decrements balance, logs transaction,
-- returns the new balance. Fails closed if the user has < required.
-- Caller passes p_amount = 1 for a normal generation.

create or replace function consume_tjai_credit(
  p_user_id uuid,
  p_amount int default 1,
  p_reason text default 'generation',
  p_metadata jsonb default null
)
returns table(balance_after int, ok boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
  v_new_balance int;
begin
  if p_amount <= 0 then
    return query select 0::int, false, 'invalid_amount'::text;
    return;
  end if;

  select pr.tjai_credit_balance into v_balance
    from profiles pr
    where pr.id = p_user_id
    for update;

  if v_balance is null then
    return query select 0::int, false, 'no_profile'::text;
    return;
  end if;

  if v_balance < p_amount then
    return query select v_balance, false, 'insufficient_credits'::text;
    return;
  end if;

  v_new_balance := v_balance - p_amount;

  update profiles
    set tjai_credit_balance = v_new_balance
    where id = p_user_id;

  insert into tjai_credit_transactions (user_id, amount, balance_after, reason, metadata)
    values (p_user_id, -p_amount, v_new_balance, p_reason, p_metadata);

  return query select v_new_balance, true, 'ok'::text;
end;
$$;

grant execute on function consume_tjai_credit(uuid, int, text, jsonb)
  to authenticated, service_role;

-- Mirror grant for credit additions (purchase / refund / admin grant).
create or replace function grant_tjai_credit(
  p_user_id uuid,
  p_amount int,
  p_reason text,
  p_metadata jsonb default null
)
returns table(balance_after int, ok boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
  v_new_balance int;
begin
  if p_amount <= 0 then
    return query select 0::int, false;
    return;
  end if;

  select pr.tjai_credit_balance into v_balance
    from profiles pr
    where pr.id = p_user_id
    for update;

  if v_balance is null then
    return query select 0::int, false;
    return;
  end if;

  v_new_balance := v_balance + p_amount;

  update profiles
    set tjai_credit_balance = v_new_balance
    where id = p_user_id;

  insert into tjai_credit_transactions (user_id, amount, balance_after, reason, metadata)
    values (p_user_id, p_amount, v_new_balance, p_reason, p_metadata);

  return query select v_new_balance, true;
end;
$$;

grant execute on function grant_tjai_credit(uuid, int, text, jsonb) to service_role;

-- ============================================================
-- 4. Commission system (5-level hierarchy)
-- ============================================================
create table if not exists commission_settings (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global', 'product_type', 'product', 'coach')),
  -- For scope='product': product UUID. For scope='coach': coach (auth.users) UUID. Null otherwise.
  scope_id uuid,
  -- For scope='product_type': 'program' | 'diet'. Null otherwise.
  product_type text,
  coach_share_pct numeric(5, 2) not null check (coach_share_pct >= 0 and coach_share_pct <= 100),
  tjfit_share_pct numeric(5, 2) not null check (tjfit_share_pct >= 0 and tjfit_share_pct <= 100),
  effective_from timestamptz not null default now(),
  effective_until timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  check (coach_share_pct + tjfit_share_pct = 100)
);

create index if not exists idx_commission_lookup
  on commission_settings(scope, scope_id, product_type, effective_from desc);

-- Seed defaults: global 75/25, programs 75/25, diets 80/20.
insert into commission_settings (scope, coach_share_pct, tjfit_share_pct, notes)
values ('global', 75.00, 25.00, 'Global default split — most-recent overrides win below.')
on conflict do nothing;

insert into commission_settings (scope, product_type, coach_share_pct, tjfit_share_pct, notes)
values
  ('product_type', 'program', 75.00, 25.00, 'Programs split.'),
  ('product_type', 'diet', 80.00, 20.00, 'Diets split — recipe research is more authoring work.')
on conflict do nothing;

-- Per-sale commission record.
create table if not exists sale_commissions (
  id uuid primary key default gen_random_uuid(),
  gumroad_sale_id text unique not null,
  product_type text not null check (product_type in ('program', 'diet')),
  product_id uuid not null,
  coach_id uuid references auth.users(id) on delete set null,
  buyer_id uuid references auth.users(id) on delete set null,
  gross_amount_usd numeric(10, 2) not null,
  gumroad_fee_usd numeric(10, 2) not null,
  net_amount_usd numeric(10, 2) not null,
  coach_share_pct numeric(5, 2) not null,
  tjfit_share_pct numeric(5, 2) not null,
  coach_amount_usd numeric(10, 2) not null,
  tjfit_amount_usd numeric(10, 2) not null,
  -- Which commission_settings rule fired.
  applied_rule text not null check (
    applied_rule in ('global', 'product_type', 'per_product', 'per_coach', 'override')
  ),
  applied_rule_id uuid references commission_settings(id) on delete set null,
  payout_id uuid,
  status text not null default 'payable' check (
    status in ('pending', 'payable', 'paid', 'disputed', 'refunded')
  ),
  created_at timestamptz not null default now()
);

create index if not exists idx_sale_commissions_coach_status
  on sale_commissions(coach_id, status);
create index if not exists idx_sale_commissions_payout
  on sale_commissions(payout_id) where payout_id is not null;
create index if not exists idx_sale_commissions_pending
  on sale_commissions(status, created_at desc) where status = 'payable';

-- Coach payouts table (didn't exist yet despite v2 prompt assumption).
create table if not exists coach_payouts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_amount_usd numeric(10, 2) not null,
  sales_count int not null default 0,
  payout_method text check (
    payout_method in ('wise', 'paypal', 'bank_transfer', 'usdt', 'other')
  ),
  payout_reference text,
  report_pdf_url text,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'failed', 'cancelled')
  ),
  initiated_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (coach_id, period_start, period_end)
);

create index if not exists idx_coach_payouts_coach
  on coach_payouts(coach_id, period_end desc);

-- Add the FK from sale_commissions.payout_id now that coach_payouts exists.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'sale_commissions_payout_id_fkey'
  ) then
    alter table sale_commissions
      add constraint sale_commissions_payout_id_fkey
      foreign key (payout_id) references coach_payouts(id) on delete set null;
  end if;
end $$;

alter table commission_settings enable row level security;
alter table sale_commissions enable row level security;
alter table coach_payouts enable row level security;

drop policy if exists commission_settings_admin on commission_settings;
create policy commission_settings_admin on commission_settings
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists sale_commissions_select on sale_commissions;
create policy sale_commissions_select on sale_commissions
  for select using (
    auth.uid() = coach_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists coach_payouts_select on coach_payouts;
create policy coach_payouts_select on coach_payouts
  for select using (
    auth.uid() = coach_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 5. Extend payment_webhooks (from v2)
-- ============================================================
alter table payment_webhooks
  add column if not exists processing_error text;
alter table payment_webhooks
  add column if not exists retry_count int not null default 0;
-- payment_webhooks already has event_type / processed_at from v2.

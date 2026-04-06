create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null,
  signup_at timestamptz not null default now(),
  first_purchase_at timestamptz,
  coins_awarded_signup integer not null default 0,
  coins_awarded_purchase integer not null default 0,
  unique (referrer_id, referred_id)
);

create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  code text not null unique,
  platform text,
  follower_count integer,
  content_type text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  commission_rate numeric not null default 0.20,
  total_earned numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  order_id uuid references program_orders(id) on delete set null,
  purchase_amount numeric not null default 0,
  commission_amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','paid')),
  created_at timestamptz not null default now()
);

alter table referrals enable row level security;
alter table affiliates enable row level security;
alter table affiliate_conversions enable row level security;

drop policy if exists referrals_read_own on referrals;
create policy referrals_read_own on referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id);

drop policy if exists affiliates_read_own on affiliates;
create policy affiliates_read_own on affiliates
  for select using (auth.uid() = user_id);

drop policy if exists affiliates_insert_self on affiliates;
create policy affiliates_insert_self on affiliates
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists affiliate_conversions_read_affiliate on affiliate_conversions;
create policy affiliate_conversions_read_affiliate on affiliate_conversions
  for select using (exists (
    select 1 from affiliates a where a.id = affiliate_id and a.user_id = auth.uid()
  ));


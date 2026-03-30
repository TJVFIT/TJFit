create table if not exists program_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text not null,
  amount_try integer not null check (amount_try >= 0),
  final_amount_try integer not null check (final_amount_try >= 0),
  currency text not null default 'TRY',
  provider text not null default 'paddle',
  provider_order_id text unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  discount_code text,
  discount_percent integer not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  tjfit_coins_earned integer not null default 0,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists tjfit_coin_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_earned integer not null default 0 check (lifetime_earned >= 0),
  lifetime_spent integer not null default 0 check (lifetime_spent >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists tjfit_coin_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  order_id uuid references program_orders(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists tjfit_discount_offers (
  key text primary key,
  title text not null,
  coin_cost integer not null check (coin_cost > 0),
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  active boolean not null default true
);

create table if not exists tjfit_discount_codes (
  code text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_key text not null references tjfit_discount_offers(key) on delete restrict,
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  status text not null default 'available' check (status in ('available', 'used', 'expired')),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  order_id uuid references program_orders(id) on delete set null
);

insert into tjfit_discount_offers (key, title, coin_cost, discount_percent, active)
values
  ('save_5', 'Save 5% Off', 50, 5, true),
  ('save_10', 'Save 10% Off', 90, 10, true),
  ('save_15', 'Save 15% Off', 130, 15, true)
on conflict (key) do update
set
  title = excluded.title,
  coin_cost = excluded.coin_cost,
  discount_percent = excluded.discount_percent,
  active = excluded.active;

alter table program_orders enable row level security;
alter table tjfit_coin_wallets enable row level security;
alter table tjfit_coin_ledger enable row level security;
alter table tjfit_discount_offers enable row level security;
alter table tjfit_discount_codes enable row level security;

create policy "Users can read own orders"
  on program_orders for select
  using (auth.uid() = user_id);

create policy "Users can read own wallet"
  on tjfit_coin_wallets for select
  using (auth.uid() = user_id);

create policy "Users can read own ledger"
  on tjfit_coin_ledger for select
  using (auth.uid() = user_id);

create policy "Users can read active discount offers"
  on tjfit_discount_offers for select
  using (active = true);

create policy "Users can read own discount codes"
  on tjfit_discount_codes for select
  using (auth.uid() = user_id);

create table if not exists user_discount_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  product_type text not null default 'any',
  coins_spent integer not null check (coins_spent > 0),
  redeemed_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz,
  status text not null default 'available' check (status in ('available','used','expired'))
);

create table if not exists tjcoin_reward_config (
  key text primary key,
  amount integer not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table tjfit_coin_ledger
  add column if not exists category text default 'general';

alter table user_discount_codes enable row level security;
alter table tjcoin_reward_config enable row level security;

drop policy if exists user_discount_codes_read_own on user_discount_codes;
create policy user_discount_codes_read_own on user_discount_codes
  for select using (auth.uid() = user_id);

drop policy if exists user_discount_codes_insert_own on user_discount_codes;
create policy user_discount_codes_insert_own on user_discount_codes
  for insert with check (auth.uid() = user_id);

drop policy if exists tjcoin_reward_config_read_all on tjcoin_reward_config;
create policy tjcoin_reward_config_read_all on tjcoin_reward_config
  for select using (true);

insert into tjcoin_reward_config (key, amount, active)
values
  ('program_purchase', 50, true),
  ('diet_purchase', 50, true),
  ('bundle_purchase', 120, true),
  ('program_completed', 200, true),
  ('week_completed', 25, true),
  ('daily_streak_maintained', 5, true),
  ('streak_7_day', 50, true),
  ('streak_30_day', 200, true),
  ('streak_100_day', 500, true),
  ('community_post', 3, true),
  ('community_post_liked', 1, true),
  ('blog_post_approved', 100, true),
  ('blog_post_featured', 250, true),
  ('blog_post_100_views', 25, true),
  ('blog_post_500_views', 75, true),
  ('blog_post_1000_views', 150, true),
  ('referral_signup', 30, true),
  ('referral_purchase', 75, true),
  ('workout_logged', 5, true),
  ('pro_subscription_month', 30, true),
  ('apex_subscription_month', 75, true)
on conflict (key) do update
set amount = excluded.amount, active = excluded.active, updated_at = now();

insert into tjfit_discount_offers (key, title, coin_cost, discount_percent, active)
values
  ('program_10', '10% off programs', 300, 10, true),
  ('program_20', '20% off programs', 600, 20, true),
  ('diet_10', '10% off diets', 300, 10, true),
  ('diet_20', '20% off diets', 600, 20, true),
  ('bundle_10', '10% off bundle', 400, 10, true),
  ('any_15', '15% off any product', 700, 15, true),
  ('any_25', '25% off any product', 1200, 25, true)
on conflict (key) do update
set title = excluded.title, coin_cost = excluded.coin_cost, discount_percent = excluded.discount_percent, active = excluded.active;


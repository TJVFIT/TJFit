create table if not exists user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null default 'core' check (tier in ('core','pro','apex')),
  paddle_subscription_id text,
  status text not null default 'active' check (status in ('active','cancelled','paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_user_subscriptions_user_id on user_subscriptions(user_id);

create table if not exists tjai_trial_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  messages_used integer not null default 0,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  last_reset_at timestamptz not null default now()
);

alter table user_subscriptions enable row level security;
alter table tjai_trial_usage enable row level security;

drop policy if exists user_subscriptions_read_own on user_subscriptions;
create policy user_subscriptions_read_own on user_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists tjai_trial_usage_read_own on tjai_trial_usage;
create policy tjai_trial_usage_read_own on tjai_trial_usage
  for select using (auth.uid() = user_id);

drop policy if exists tjai_trial_usage_insert_own on tjai_trial_usage;
create policy tjai_trial_usage_insert_own on tjai_trial_usage
  for insert with check (auth.uid() = user_id);

drop policy if exists tjai_trial_usage_update_own on tjai_trial_usage;
create policy tjai_trial_usage_update_own on tjai_trial_usage
  for update using (auth.uid() = user_id);


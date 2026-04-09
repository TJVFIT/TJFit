-- TJAI complete fix and access hardening

-- Public catalog visibility
do $$
begin
  if to_regclass('public.programs') is not null then
    execute 'alter table public.programs enable row level security';
    execute 'drop policy if exists "Public reads programs" on public.programs';
    execute 'drop policy if exists "Public can read programs" on public.programs';
    execute 'create policy "Public reads programs" on public.programs for select using (true)';
  end if;
end $$;

do $$
begin
  if to_regclass('public.diets') is not null then
    execute 'alter table public.diets enable row level security';
    execute 'drop policy if exists "Public reads diets" on public.diets';
    execute 'drop policy if exists "Public can read diets" on public.diets';
    execute 'create policy "Public reads diets" on public.diets for select using (true)';
  end if;
end $$;

-- Saved TJAI plans
create table if not exists public.saved_tjai_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  answers_json jsonb,
  plan_json jsonb,
  goal text,
  daily_calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  water_ml integer,
  training_days_per_week integer,
  training_location text,
  metrics_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.saved_tjai_plans
  add column if not exists answers_json jsonb,
  add column if not exists plan_json jsonb,
  add column if not exists goal text,
  add column if not exists daily_calories integer,
  add column if not exists protein_g integer,
  add column if not exists carbs_g integer,
  add column if not exists fat_g integer,
  add column if not exists water_ml integer,
  add column if not exists training_days_per_week integer,
  add column if not exists training_location text,
  add column if not exists metrics_json jsonb,
  add column if not exists updated_at timestamptz default now();

alter table public.saved_tjai_plans enable row level security;
drop policy if exists "Users own plans" on public.saved_tjai_plans;
drop policy if exists "Users own their plans" on public.saved_tjai_plans;
drop policy if exists users_read_own_plans on public.saved_tjai_plans;
drop policy if exists users_insert_own_plans on public.saved_tjai_plans;
drop policy if exists users_delete_own_plans on public.saved_tjai_plans;
create policy "Users own plans" on public.saved_tjai_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- TJAI chat messages
create table if not exists public.tjai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_tjai_chat_messages_user_conversation_created
  on public.tjai_chat_messages(user_id, conversation_id, created_at desc);

alter table public.tjai_chat_messages enable row level security;
drop policy if exists "Users own messages" on public.tjai_chat_messages;
drop policy if exists "Users own chat messages" on public.tjai_chat_messages;
drop policy if exists "Users own tjai chat messages" on public.tjai_chat_messages;
create policy "Users own messages" on public.tjai_chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chat preferences
create table if not exists public.user_chat_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  preference_key text not null,
  preference_value text not null,
  source text default 'chat',
  updated_at timestamptz default now(),
  primary key (user_id, preference_key)
);

alter table public.user_chat_preferences
  add column if not exists source text default 'chat';

alter table public.user_chat_preferences enable row level security;
drop policy if exists "Users own preferences" on public.user_chat_preferences;
create policy "Users own preferences" on public.user_chat_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Re-engagement emails
create table if not exists public.reengagement_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  type text not null,
  sent_at timestamptz default now()
);

-- One-time TJAI plan purchases
create table if not exists public.tjai_plan_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paddle_transaction_id text unique not null,
  plan_id uuid,
  pdf_downloaded boolean default false,
  purchased_at timestamptz default now()
);

alter table public.tjai_plan_purchases
  add column if not exists paddle_transaction_id text,
  add column if not exists plan_id uuid,
  add column if not exists pdf_downloaded boolean default false,
  add column if not exists purchased_at timestamptz default now();

create unique index if not exists idx_tjai_plan_purchases_transaction
  on public.tjai_plan_purchases(paddle_transaction_id);

alter table public.tjai_plan_purchases enable row level security;
drop policy if exists "Users own purchases" on public.tjai_plan_purchases;
drop policy if exists "Users own plan purchases" on public.tjai_plan_purchases;
create policy "Users own purchases" on public.tjai_plan_purchases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Biggest upgrade foundation migration (safe to rerun)

-- Suggestions system
create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null default 'feature',
  status text not null default 'under_review',
  vote_count integer default 0,
  admin_response text,
  created_at timestamptz default now()
);

create table if not exists suggestion_votes (
  user_id uuid not null references auth.users(id) on delete cascade,
  suggestion_id uuid not null references suggestions(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, suggestion_id)
);

-- Equipment store waitlist
create table if not exists store_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- Program previews tracking
create table if not exists program_preview_views (
  user_id uuid references auth.users(id) on delete set null,
  program_id uuid not null,
  viewed_at timestamptz default now(),
  session_id text
);

-- Messaging fix
alter table messages add column if not exists read_at timestamptz;

-- Subscription management
create table if not exists user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null default 'core',
  paddle_subscription_id text unique,
  paddle_customer_id text,
  status text default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancels_at timestamptz,
  paused_until timestamptz,
  created_at timestamptz default now()
);

-- Profile columns (safe add)
alter table profiles add column if not exists privacy_settings jsonb default '{"show_streak":true,"show_coins":true,"show_programs":true,"show_posts":true}'::jsonb;
alter table profiles add column if not exists banner_color text default '#111215';
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists display_badge_key text;
alter table profiles add column if not exists motivation_photo_url text;
alter table profiles add column if not exists accepting_clients boolean default true;
alter table profiles add column if not exists featured_program_id uuid;
alter table profiles add column if not exists specialty_tags text[];
alter table profiles add column if not exists certifications text[];
alter table profiles add column if not exists about_me text;
alter table profiles add column if not exists referral_code text;
alter table profiles add column if not exists current_streak integer default 0;
alter table profiles add column if not exists longest_streak integer default 0;
alter table profiles add column if not exists last_activity_date date;
alter table profiles add column if not exists tjxp integer default 0;
alter table profiles add column if not exists level integer default 1;
alter table profiles add column if not exists booking_url text;
alter table profiles add column if not exists subscription_tier text default 'core';

create unique index if not exists profiles_referral_code_unique_idx
  on profiles (referral_code)
  where referral_code is not null;

-- Generate referral codes for users who do not have one
update profiles
set referral_code = 'TJ-' || upper(substring(coalesce(username, id::text), 1, 4)) || '-' || substring(md5(random()::text), 1, 4)
where referral_code is null;

-- RLS enable
alter table suggestions enable row level security;
alter table suggestion_votes enable row level security;
alter table store_waitlist enable row level security;
alter table user_subscriptions enable row level security;

-- Policies (safe create)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'suggestions' and policyname = 'Anyone reads suggestions') then
    create policy "Anyone reads suggestions" on suggestions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'suggestions' and policyname = 'Auth users submit suggestions') then
    create policy "Auth users submit suggestions" on suggestions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'suggestion_votes' and policyname = 'Auth users vote') then
    create policy "Auth users vote" on suggestion_votes for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_subscriptions' and policyname = 'Users own subscriptions') then
    create policy "Users own subscriptions" on user_subscriptions for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'store_waitlist' and policyname = 'Public joins waitlist') then
    create policy "Public joins waitlist" on store_waitlist for insert with check (true);
  end if;
end $$;

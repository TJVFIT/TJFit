-- Phase 3B + 3C + 3D + Phase 4 + TJAI standalone schema upgrades

-- Coach profile additions
alter table if exists profiles add column if not exists specialty_tags text[];
alter table if exists profiles add column if not exists certifications text[];
alter table if exists profiles add column if not exists about_me text;
alter table if exists profiles add column if not exists accepting_clients boolean default true;
alter table if exists profiles add column if not exists featured_program_id uuid;

-- Streak tracking
alter table if exists profiles add column if not exists current_streak integer default 0;
alter table if exists profiles add column if not exists longest_streak integer default 0;
alter table if exists profiles add column if not exists last_activity_date date;

-- Referral codes
alter table if exists profiles add column if not exists referral_code text;
create unique index if not exists idx_profiles_referral_code_unique on profiles(referral_code) where referral_code is not null;

update profiles
set referral_code = 'TJ-' || upper(substring(coalesce(username, replace(id::text, '-', '')) from 1 for 4)) || '-' || substring(md5(random()::text) from 1 for 4)
where referral_code is null;

-- Program reviews adjustments (table may already exist)
create table if not exists program_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid,
  rating smallint not null check (rating between 1 and 5),
  review_text text,
  is_anonymous boolean default false,
  is_hidden boolean default false,
  helpful_count integer default 0,
  created_at timestamptz default now(),
  unique (user_id, program_id)
);
alter table if exists program_reviews add column if not exists program_id uuid;
alter table if exists program_reviews add column if not exists helpful_count integer default 0;
alter table if exists program_reviews enable row level security;
drop policy if exists "Reviews visible to all" on program_reviews;
create policy "Reviews visible to all" on program_reviews for select using (not is_hidden);
drop policy if exists "Users insert own reviews" on program_reviews;
create policy "Users insert own reviews" on program_reviews for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own reviews" on program_reviews;
create policy "Users update own reviews" on program_reviews for update using (auth.uid() = user_id);

-- Program bundles adjustments
create table if not exists program_bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  program_id uuid,
  diet_id uuid,
  discount_percent integer default 30,
  paddle_price_id text,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table if exists program_bundles add column if not exists program_id uuid;
alter table if exists program_bundles add column if not exists diet_id uuid;

-- Program certificates adjustments
create table if not exists program_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid,
  program_name text,
  completed_at timestamptz default now(),
  certificate_url text
);
alter table if exists program_certificates add column if not exists program_id uuid;
alter table if exists program_certificates add column if not exists program_name text;
alter table if exists program_certificates enable row level security;
drop policy if exists "Users own certificates" on program_certificates;
create policy "Users own certificates" on program_certificates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Workout logs
create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid,
  week_number integer,
  day_label text,
  exercise_name text not null,
  sets_data jsonb not null,
  logged_at timestamptz default now()
);
alter table if exists workout_logs enable row level security;
drop policy if exists "Users own workout logs" on workout_logs;
create policy "Users own workout logs" on workout_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Personal records
create table if not exists personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  weight_kg numeric(6,2),
  reps integer,
  achieved_at timestamptz default now(),
  unique (user_id, exercise_name)
);
alter table if exists personal_records enable row level security;
drop policy if exists "Users own records" on personal_records;
create policy "Users own records" on personal_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Water logs
create table if not exists daily_water_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount_ml integer default 0,
  primary key (user_id, date)
);
alter table if exists daily_water_logs enable row level security;
drop policy if exists "Users own water logs" on daily_water_logs;
create policy "Users own water logs" on daily_water_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Referrals
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null,
  signup_at timestamptz default now(),
  first_purchase_at timestamptz,
  coins_awarded_signup boolean default false,
  coins_awarded_purchase boolean default false,
  unique (referred_id)
);
alter table if exists referrals enable row level security;
drop policy if exists "Users see own referrals" on referrals;
create policy "Users see own referrals" on referrals for select using (auth.uid() = referrer_id);

-- Affiliates
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  code text unique,
  platform text,
  follower_count integer,
  status text default 'pending',
  commission_rate numeric default 0.20,
  paypal_email text,
  total_earned numeric default 0,
  created_at timestamptz default now()
);
create unique index if not exists idx_affiliates_email_unique on affiliates(email);
alter table if exists affiliates enable row level security;
drop policy if exists "Affiliates see own record" on affiliates;
create policy "Affiliates see own record" on affiliates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Public can apply" on affiliates;
create policy "Public can apply" on affiliates for insert with check (true);

create table if not exists affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id),
  order_id text,
  purchase_amount numeric,
  commission_amount numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

-- TJAI one-time purchases
create table if not exists tjai_plan_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paddle_transaction_id text unique not null,
  plan_id uuid,
  pdf_downloaded boolean default false,
  purchased_at timestamptz default now()
);
alter table if exists tjai_plan_purchases enable row level security;
drop policy if exists "Users own plan purchases" on tjai_plan_purchases;
create policy "Users own plan purchases" on tjai_plan_purchases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Dashboard greetings cache
create table if not exists dashboard_greetings (
  user_id uuid not null references auth.users(id) on delete cascade,
  greeting_text text not null,
  generated_at timestamptz default now(),
  primary key (user_id)
);
alter table if exists dashboard_greetings enable row level security;
drop policy if exists "Users own greetings" on dashboard_greetings;
create policy "Users own greetings" on dashboard_greetings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Coach profile views tracking
create table if not exists coach_profile_views (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  viewer_ip text,
  viewed_at timestamptz default now()
);

-- TJAI chat history
create table if not exists tjai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);
create index if not exists idx_tjai_chat_messages_user_conversation_created
  on tjai_chat_messages(user_id, conversation_id, created_at desc);
alter table if exists tjai_chat_messages enable row level security;
drop policy if exists "Users own tjai chat messages" on tjai_chat_messages;
create policy "Users own tjai chat messages" on tjai_chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- TJAI weekly insight cache
create table if not exists tjai_weekly_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  insight_text text not null,
  created_at timestamptz default now(),
  unique(user_id, week_start)
);
alter table if exists tjai_weekly_insights enable row level security;
drop policy if exists "Users own weekly insights" on tjai_weekly_insights;
create policy "Users own weekly insights" on tjai_weekly_insights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

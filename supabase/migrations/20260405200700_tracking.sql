create table if not exists daily_water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount_ml integer not null check (amount_ml >= 0),
  logged_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text,
  week_number integer,
  day_label text,
  exercise_name text,
  sets_data jsonb not null default '[]'::jsonb,
  logged_at timestamptz not null default now()
);

alter table daily_water_logs enable row level security;
alter table workout_logs enable row level security;

drop policy if exists daily_water_logs_read_own on daily_water_logs;
create policy daily_water_logs_read_own on daily_water_logs
  for select using (auth.uid() = user_id);
drop policy if exists daily_water_logs_insert_own on daily_water_logs;
create policy daily_water_logs_insert_own on daily_water_logs
  for insert with check (auth.uid() = user_id);
drop policy if exists daily_water_logs_update_own on daily_water_logs;
create policy daily_water_logs_update_own on daily_water_logs
  for update using (auth.uid() = user_id);

drop policy if exists workout_logs_read_own on workout_logs;
create policy workout_logs_read_own on workout_logs
  for select using (auth.uid() = user_id);
drop policy if exists workout_logs_insert_own on workout_logs;
create policy workout_logs_insert_own on workout_logs
  for insert with check (auth.uid() = user_id);


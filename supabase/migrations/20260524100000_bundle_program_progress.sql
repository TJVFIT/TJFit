-- Interactive bundle program: enrollments + per-set workout logs + grocery checks.
-- All tables are user-scoped via RLS.

create table if not exists public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bundle_slug text not null,
  started_at timestamptz not null default now(),
  current_week int not null default 1,
  updated_at timestamptz not null default now(),
  unique (user_id, bundle_slug)
);

create index if not exists program_enrollments_user_idx
  on public.program_enrollments(user_id);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bundle_slug text not null,
  week int not null,
  day text not null,
  exercise text not null,
  set_index int not null,
  reps int,
  weight numeric(6,2),
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, bundle_slug, week, day, exercise, set_index)
);

create index if not exists workout_logs_user_bundle_week_idx
  on public.workout_logs(user_id, bundle_slug, week);

create table if not exists public.grocery_checks (
  user_id uuid not null references auth.users(id) on delete cascade,
  bundle_slug text not null,
  item_key text not null,
  checked boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, bundle_slug, item_key)
);

alter table public.program_enrollments enable row level security;
alter table public.workout_logs enable row level security;
alter table public.grocery_checks enable row level security;

create policy "enrollments_self" on public.program_enrollments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_logs_self" on public.workout_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "grocery_checks_self" on public.grocery_checks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

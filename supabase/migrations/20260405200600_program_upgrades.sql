create table if not exists program_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  is_anonymous boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists program_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text not null,
  completed_at timestamptz not null default now(),
  certificate_url text
);

create table if not exists program_bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  program_slug text not null,
  diet_slug text not null,
  discount_percent integer not null default 30 check (discount_percent > 0 and discount_percent <= 100),
  paddle_price_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists program_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_slug text not null,
  week_number integer not null,
  day_label text not null,
  completed_at timestamptz,
  is_complete boolean not null default false,
  unique (user_id, program_slug, week_number, day_label)
);

alter table program_reviews enable row level security;
alter table program_certificates enable row level security;
alter table program_bundles enable row level security;
alter table program_progress enable row level security;

drop policy if exists program_reviews_read_visible on program_reviews;
create policy program_reviews_read_visible on program_reviews
  for select using (is_hidden = false);
drop policy if exists program_reviews_insert_own on program_reviews;
create policy program_reviews_insert_own on program_reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists program_certificates_read_own on program_certificates;
create policy program_certificates_read_own on program_certificates
  for select using (auth.uid() = user_id);

drop policy if exists program_bundles_read_active on program_bundles;
create policy program_bundles_read_active on program_bundles
  for select using (is_active = true);

drop policy if exists program_progress_read_own on program_progress;
create policy program_progress_read_own on program_progress
  for select using (auth.uid() = user_id);
drop policy if exists program_progress_insert_own on program_progress;
create policy program_progress_insert_own on program_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists program_progress_update_own on program_progress;
create policy program_progress_update_own on program_progress
  for update using (auth.uid() = user_id);


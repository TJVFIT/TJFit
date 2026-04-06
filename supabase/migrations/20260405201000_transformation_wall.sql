create table if not exists user_transformations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  before_image_url text not null,
  after_image_url text not null,
  program_slug text,
  duration_label text,
  weight_change text,
  story text,
  show_username boolean not null default true,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  likes_count integer not null default 0,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table user_transformations enable row level security;

drop policy if exists transformations_read_approved on user_transformations;
create policy transformations_read_approved on user_transformations
  for select using (status = 'approved' or auth.uid() = user_id);
drop policy if exists transformations_insert_own on user_transformations;
create policy transformations_insert_own on user_transformations
  for insert with check (auth.uid() = user_id);
drop policy if exists transformations_update_own_pending on user_transformations;
create policy transformations_update_own_pending on user_transformations
  for update using (auth.uid() = user_id and status = 'pending');


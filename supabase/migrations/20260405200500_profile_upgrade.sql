create table if not exists user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table if exists profiles
  add column if not exists referral_code text unique,
  add column if not exists banner_color text,
  add column if not exists display_badge text,
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0,
  add column if not exists last_activity_date date;

alter table user_follows enable row level security;
drop policy if exists user_follows_read_all on user_follows;
create policy user_follows_read_all on user_follows for select using (true);
drop policy if exists user_follows_insert_own on user_follows;
create policy user_follows_insert_own on user_follows for insert with check (auth.uid() = follower_id);
drop policy if exists user_follows_delete_own on user_follows;
create policy user_follows_delete_own on user_follows for delete using (auth.uid() = follower_id);


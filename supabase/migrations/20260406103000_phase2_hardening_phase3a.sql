-- Phase 2 hardening + Phase 3A foundation

alter table if exists community_challenges
  add column if not exists settled boolean not null default false;

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

create table if not exists reaction_coin_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  coins_earned_today integer not null default 0,
  primary key (user_id, date)
);

create table if not exists pending_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('success', 'coins', 'achievement', 'streak')),
  message text not null,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_pending_notifications_user_seen_created
  on pending_notifications(user_id, seen, created_at desc);

alter table if exists community_blog_posts
  add column if not exists draft_id uuid;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'community_blog_posts_status_check'
  ) then
    alter table community_blog_posts drop constraint community_blog_posts_status_check;
  end if;
end $$;

alter table if exists community_blog_posts
  add constraint community_blog_posts_status_check
  check (status in ('pending', 'published', 'rejected', 'admin_draft'));

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'community_blog_posts_author_type_check'
  ) then
    alter table community_blog_posts drop constraint community_blog_posts_author_type_check;
  end if;
end $$;

alter table if exists community_blog_posts
  alter column author_type set default 'user';

alter table if exists community_blog_posts
  add constraint community_blog_posts_author_type_check
  check (author_type in ('user', 'coach', 'admin', 'team', 'ai'));

alter table if exists profiles
  add column if not exists privacy_settings jsonb not null default '{"show_streak":true,"show_coins":true,"show_programs":true,"show_posts":true}'::jsonb,
  add column if not exists banner_color text default '#111215',
  add column if not exists display_badge_key text;

create table if not exists user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table user_badges enable row level security;
alter table reaction_coin_log enable row level security;
alter table pending_notifications enable row level security;
alter table user_follows enable row level security;

drop policy if exists user_badges_select_own on user_badges;
create policy user_badges_select_own
  on user_badges for select
  using (auth.uid() = user_id);

drop policy if exists user_badges_insert_service on user_badges;
create policy user_badges_insert_service
  on user_badges for insert
  with check (true);

drop policy if exists reaction_coin_log_service_all on reaction_coin_log;
create policy reaction_coin_log_service_all
  on reaction_coin_log for all
  using (true)
  with check (true);

drop policy if exists pending_notifications_owner_all on pending_notifications;
create policy pending_notifications_owner_all
  on pending_notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_follows_read_all on user_follows;
create policy user_follows_read_all
  on user_follows for select
  using (true);

drop policy if exists user_follows_insert_own on user_follows;
create policy user_follows_insert_own
  on user_follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists user_follows_delete_own on user_follows;
create policy user_follows_delete_own
  on user_follows for delete
  using (auth.uid() = follower_id);

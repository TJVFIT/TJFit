create table if not exists leaderboard_weekly_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  coins_earned integer not null default 0,
  streak_days integer not null default 0,
  blog_views integer not null default 0,
  posts_count integer not null default 0,
  programs_done integer not null default 0,
  is_coach boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_leaderboard_weekly_week_coins on leaderboard_weekly_snapshots(week_start, coins_earned desc);
create index if not exists idx_leaderboard_weekly_week_streak on leaderboard_weekly_snapshots(week_start, streak_days desc);
create index if not exists idx_leaderboard_weekly_user_week on leaderboard_weekly_snapshots(user_id, week_start desc);

alter table leaderboard_weekly_snapshots enable row level security;

drop policy if exists leaderboard_read_all on leaderboard_weekly_snapshots;
create policy leaderboard_read_all on leaderboard_weekly_snapshots
  for select using (true);


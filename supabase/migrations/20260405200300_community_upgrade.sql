create table if not exists community_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  metric_type text not null,
  start_date date not null,
  end_date date not null,
  coin_prize_1st integer not null default 500,
  coin_prize_2nd integer not null default 250,
  coin_prize_3rd integer not null default 100,
  coin_completion_reward integer not null default 50,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists challenge_participants (
  challenge_id uuid not null references community_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  total_logged numeric not null default 0,
  primary key (challenge_id, user_id)
);

create table if not exists challenge_logs (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references community_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric not null,
  logged_at timestamptz not null default now()
);

create table if not exists community_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id uuid not null references community_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists community_spotlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_text text not null,
  quote text,
  week_of date not null,
  featured_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table community_challenges enable row level security;
alter table challenge_participants enable row level security;
alter table challenge_logs enable row level security;
alter table community_groups enable row level security;
alter table group_members enable row level security;
alter table community_spotlights enable row level security;

drop policy if exists community_challenges_read_all on community_challenges;
create policy community_challenges_read_all on community_challenges for select using (true);
drop policy if exists challenge_participants_read_all on challenge_participants;
create policy challenge_participants_read_all on challenge_participants for select using (true);
drop policy if exists challenge_participants_insert_own on challenge_participants;
create policy challenge_participants_insert_own on challenge_participants for insert with check (auth.uid() = user_id);
drop policy if exists challenge_logs_read_all on challenge_logs;
create policy challenge_logs_read_all on challenge_logs for select using (true);
drop policy if exists challenge_logs_insert_own on challenge_logs;
create policy challenge_logs_insert_own on challenge_logs for insert with check (auth.uid() = user_id);
drop policy if exists community_groups_read_all on community_groups;
create policy community_groups_read_all on community_groups for select using (true);
drop policy if exists group_members_read_all on group_members;
create policy group_members_read_all on group_members for select using (true);
drop policy if exists group_members_insert_own on group_members;
create policy group_members_insert_own on group_members for insert with check (auth.uid() = user_id);
drop policy if exists community_spotlights_read_all on community_spotlights;
create policy community_spotlights_read_all on community_spotlights for select using (true);


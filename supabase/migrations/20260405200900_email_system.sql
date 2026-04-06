create table if not exists user_email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weekly_program boolean not null default true,
  achievements boolean not null default true,
  blog_updates boolean not null default true,
  streak_milestones boolean not null default true,
  referrals boolean not null default true,
  platform_news boolean not null default true,
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists email_sequences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence_name text not null,
  current_step integer not null default 0,
  next_send_at timestamptz not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, sequence_name)
);

alter table user_email_preferences enable row level security;
alter table email_sequences enable row level security;

drop policy if exists user_email_preferences_read_own on user_email_preferences;
create policy user_email_preferences_read_own on user_email_preferences
  for select using (auth.uid() = user_id);
drop policy if exists user_email_preferences_insert_own on user_email_preferences;
create policy user_email_preferences_insert_own on user_email_preferences
  for insert with check (auth.uid() = user_id);
drop policy if exists user_email_preferences_update_own on user_email_preferences;
create policy user_email_preferences_update_own on user_email_preferences
  for update using (auth.uid() = user_id);

drop policy if exists email_sequences_read_own on email_sequences;
create policy email_sequences_read_own on email_sequences
  for select using (auth.uid() = user_id);


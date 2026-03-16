-- Profiles table: links auth.users to role (coach). Admin is determined by NEXT_PUBLIC_ADMIN_EMAILS env.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'coach'))
);

-- Trigger: create profile when user signs up (for future coach onboarding)
-- For now, profiles are inserted manually when promoting a user to coach.

-- Enable RLS
alter table profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Service role can do everything (for API/admin)
-- No insert policy for anon = only service role or trigger can insert
-- Expand profiles.role to include standard end users.
alter table profiles
  drop constraint if exists profiles_role_check;

alter table profiles
  add constraint profiles_role_check
  check (role in ('admin', 'coach', 'user'));

-- Progress tracking (v1): body metrics, workout logs, milestones.
create table if not exists progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  weight_kg numeric(6,2),
  body_fat_percent numeric(5,2),
  waist_cm numeric(6,2),
  chest_cm numeric(6,2),
  hips_cm numeric(6,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_progress_entries_user_date
  on progress_entries (user_id, entry_date desc);

create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_date date not null default current_date,
  exercise text not null,
  sets int,
  reps int,
  weight_kg numeric(6,2),
  duration_minutes int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workout_logs_user_date
  on workout_logs (user_id, workout_date desc);

create table if not exists progress_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_value text,
  status text not null default 'active' check (status in ('active','completed','paused')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_progress_milestones_user
  on progress_milestones (user_id, status);

alter table progress_entries enable row level security;
alter table workout_logs enable row level security;
alter table progress_milestones enable row level security;

create policy "Owner can read progress entries"
  on progress_entries for select using (auth.uid() = user_id);
create policy "Owner can insert progress entries"
  on progress_entries for insert with check (auth.uid() = user_id);
create policy "Owner can update progress entries"
  on progress_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can delete progress entries"
  on progress_entries for delete using (auth.uid() = user_id);

create policy "Owner can read workout logs"
  on workout_logs for select using (auth.uid() = user_id);
create policy "Owner can insert workout logs"
  on workout_logs for insert with check (auth.uid() = user_id);
create policy "Owner can update workout logs"
  on workout_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can delete workout logs"
  on workout_logs for delete using (auth.uid() = user_id);

create policy "Owner can read milestones"
  on progress_milestones for select using (auth.uid() = user_id);
create policy "Owner can insert milestones"
  on progress_milestones for insert with check (auth.uid() = user_id);
create policy "Owner can update milestones"
  on progress_milestones for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can delete milestones"
  on progress_milestones for delete using (auth.uid() = user_id);

-- Chat foundation: strict coach-student pair messaging.
create table if not exists user_public_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_key_jwk jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists coach_student_links (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused','ended')),
  created_at timestamptz not null default now(),
  unique (coach_id, student_id)
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  coach_student_link_id uuid not null references coach_student_links(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  encrypted_conversation_key text not null,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message_type text not null default 'text' check (message_type in ('text','image','file','link','call_event')),
  ciphertext text not null,
  nonce text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_created_at
  on messages (conversation_id, created_at asc);

create table if not exists message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  encrypted_name text,
  created_at timestamptz not null default now()
);

create table if not exists call_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  started_by uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('voice','video')),
  status text not null default 'ringing' check (status in ('ringing','active','ended','missed')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists call_events (
  id uuid primary key default gen_random_uuid(),
  call_session_id uuid not null references call_sessions(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('offer','answer','ice','end','ring')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table coach_student_links enable row level security;
alter table user_public_keys enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table message_attachments enable row level security;
alter table call_sessions enable row level security;
alter table call_events enable row level security;

create policy "Users can read public keys"
  on user_public_keys for select
  using (true);

create policy "Users can upsert own public key"
  on user_public_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can update own public key"
  on user_public_keys for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Participants can read coach-student links"
  on coach_student_links for select
  using (auth.uid() = coach_id or auth.uid() = student_id);

create policy "Admins and coach can insert links"
  on coach_student_links for insert
  with check (auth.uid() = coach_id);

create policy "Participants can read conversations"
  on conversations for select
  using (
    exists (
      select 1
      from coach_student_links csl
      where csl.id = conversations.coach_student_link_id
        and (auth.uid() = csl.coach_id or auth.uid() = csl.student_id)
    )
  );

create policy "Participants can read participants"
  on conversation_participants for select
  using (
    exists (
      select 1
      from conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
        and cp.user_id = auth.uid()
    )
  );

create policy "Participants can read messages"
  on messages for select
  using (
    exists (
      select 1
      from conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = auth.uid()
    )
  );

create policy "Participants can send messages"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = auth.uid()
    )
  );

create policy "Participants can read attachments"
  on message_attachments for select
  using (
    exists (
      select 1
      from messages m
      join conversation_participants cp on cp.conversation_id = m.conversation_id
      where m.id = message_attachments.message_id
        and cp.user_id = auth.uid()
    )
  );

create policy "Participants can manage calls"
  on call_sessions for all
  using (
    exists (
      select 1
      from conversation_participants cp
      where cp.conversation_id = call_sessions.conversation_id
        and cp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from conversation_participants cp
      where cp.conversation_id = call_sessions.conversation_id
        and cp.user_id = auth.uid()
    )
  );

create policy "Participants can manage call events"
  on call_events for all
  using (
    exists (
      select 1
      from call_sessions cs
      join conversation_participants cp on cp.conversation_id = cs.conversation_id
      where cs.id = call_events.call_session_id
        and cp.user_id = auth.uid()
    )
  )
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from call_sessions cs
      join conversation_participants cp on cp.conversation_id = cs.conversation_id
      where cs.id = call_events.call_session_id
        and cp.user_id = auth.uid()
    )
  );

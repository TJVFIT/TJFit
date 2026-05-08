-- Email sequence engine v1.
-- Preserve the older per-user email_sequences table from 20260405200900 if present.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'email_sequences'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_sequences'
      and column_name = 'trigger_event'
  ) then
    alter table public.email_sequences rename to legacy_email_sequences;
  end if;
end $$;

create table if not exists email_sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_event text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique (name),
  unique (trigger_event, name)
);

create table if not exists email_sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references email_sequences(id) on delete cascade,
  step_order integer not null,
  delay_hours integer not null,
  template_key text not null,
  subject_key text not null,
  is_active boolean default true,
  unique (sequence_id, step_order)
);

create table if not exists email_sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  sequence_id uuid references email_sequences(id) on delete cascade,
  current_step integer default 0,
  next_send_at timestamptz,
  status text default 'active' check (status in ('active', 'completed', 'cancelled', 'failed')),
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  unique (user_id, sequence_id)
);

create table if not exists email_sequence_log (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references email_sequence_enrollments(id) on delete cascade,
  step_id uuid references email_sequence_steps(id),
  sent_at timestamptz default now(),
  resend_message_id text,
  status text check (status in ('sent', 'failed', 'bounced')),
  error_message text
);

alter table profiles add column if not exists last_seen_at timestamptz;

create index if not exists idx_email_sequences_trigger_active
  on email_sequences(trigger_event, is_active);
create index if not exists idx_email_sequence_steps_sequence_order
  on email_sequence_steps(sequence_id, step_order)
  where is_active = true;
create index if not exists idx_email_sequence_enrollments_due
  on email_sequence_enrollments(status, next_send_at)
  where status = 'active';
create index if not exists idx_email_sequence_enrollments_user_status
  on email_sequence_enrollments(user_id, status);
create index if not exists idx_email_sequence_log_enrollment_step_recent
  on email_sequence_log(enrollment_id, step_id, sent_at desc);
create index if not exists idx_profiles_last_seen_at
  on profiles(last_seen_at);

alter table email_sequences enable row level security;
alter table email_sequence_steps enable row level security;
alter table email_sequence_enrollments enable row level security;
alter table email_sequence_log enable row level security;

drop policy if exists email_sequences_service_role_all on email_sequences;
create policy email_sequences_service_role_all on email_sequences
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists email_sequence_steps_service_role_all on email_sequence_steps;
create policy email_sequence_steps_service_role_all on email_sequence_steps
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists email_sequence_enrollments_service_role_all on email_sequence_enrollments;
create policy email_sequence_enrollments_service_role_all on email_sequence_enrollments
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists email_sequence_log_service_role_all on email_sequence_log;
create policy email_sequence_log_service_role_all on email_sequence_log
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists email_sequence_enrollments_read_own on email_sequence_enrollments;
create policy email_sequence_enrollments_read_own on email_sequence_enrollments
  for select using (auth.uid() = user_id);

drop policy if exists email_sequence_log_read_own on email_sequence_log;
create policy email_sequence_log_read_own on email_sequence_log
  for select using (
    exists (
      select 1
      from email_sequence_enrollments e
      where e.id = email_sequence_log.enrollment_id
        and e.user_id = auth.uid()
    )
  );

create or replace function public.enroll_user_in_email_sequence(
  p_user_id uuid,
  p_trigger_event text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sequence_id uuid;
  v_first_delay integer;
  v_enrollment_id uuid;
begin
  select s.id
    into v_sequence_id
    from email_sequences s
    where s.trigger_event = p_trigger_event
      and s.is_active = true
    order by s.created_at asc
    limit 1;

  if v_sequence_id is null then
    return null;
  end if;

  select st.delay_hours
    into v_first_delay
    from email_sequence_steps st
    where st.sequence_id = v_sequence_id
      and st.is_active = true
    order by st.step_order asc
    limit 1;

  if v_first_delay is null then
    return null;
  end if;

  insert into email_sequence_enrollments (
    user_id,
    sequence_id,
    current_step,
    next_send_at,
    status,
    enrolled_at
  )
  values (
    p_user_id,
    v_sequence_id,
    0,
    now() + make_interval(hours => v_first_delay),
    'active',
    now()
  )
  on conflict (user_id, sequence_id) do update
    set status = email_sequence_enrollments.status
    where email_sequence_enrollments.status <> 'active'
  returning id into v_enrollment_id;

  if v_enrollment_id is null then
    select id
      into v_enrollment_id
      from email_sequence_enrollments
      where user_id = p_user_id
        and sequence_id = v_sequence_id
        and status = 'active';
  end if;

  return v_enrollment_id;
end;
$$;

grant execute on function public.enroll_user_in_email_sequence(uuid, text) to service_role;

create or replace function public.claim_due_email_sequence_enrollments(
  p_limit integer default 100
)
returns table (
  id uuid,
  user_id uuid,
  sequence_id uuid,
  current_step integer,
  next_send_at timestamptz,
  sequence_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with due as (
    select e.id
    from email_sequence_enrollments e
    where e.status = 'active'
      and e.next_send_at <= now()
    order by e.next_send_at asc
    limit least(coalesce(p_limit, 100), 100)
    for update skip locked
  ),
  leased as (
    update email_sequence_enrollments e
      set next_send_at = now() + interval '15 minutes'
      from due
      where e.id = due.id
      returning e.id, e.user_id, e.sequence_id, e.current_step, e.next_send_at
  )
  select l.id, l.user_id, l.sequence_id, l.current_step, l.next_send_at, s.name
  from leased l
  join email_sequences s on s.id = l.sequence_id;
end;
$$;

grant execute on function public.claim_due_email_sequence_enrollments(integer) to service_role;

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text := 'tjfit_' || substr(md5(new.id::text), 1, 20);
begin
  insert into public.profiles (id, email, role, username, username_normalized, display_name, last_seen_at)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    'user',
    base,
    lower(base),
    nullif(trim(split_part(lower(coalesce(new.email, '')), '@', 1)), ''),
    now()
  )
  on conflict (id) do update
    set email = excluded.email
  where public.profiles.role <> 'coach' and public.profiles.role <> 'admin';

  perform public.enroll_user_in_email_sequence(new.id, 'signup');
  return new;
end;
$$;

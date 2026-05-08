-- Coach request workflow.
-- coach_student_links has status check ('active','paused','ended') and INSERT
-- policy requires auth.uid() = coach_id, so students can't self-insert a
-- pending link there. Separate table for the request lifecycle; on approval,
-- the API inserts into coach_student_links with status='active'.

create table if not exists coach_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  message text,
  goal text check (goal in ('fat_loss','muscle_gain','strength','general','other')),
  status text not null default 'pending' check (status in ('pending','approved','declined','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists idx_coach_requests_coach_status
  on coach_requests (coach_id, status, created_at desc);
create index if not exists idx_coach_requests_student_status
  on coach_requests (student_id, status, created_at desc);

-- One pending request per student-coach pair at a time.
create unique index if not exists uniq_pending_request_per_pair
  on coach_requests (student_id, coach_id)
  where status = 'pending';

alter table coach_requests enable row level security;

drop policy if exists "Students insert own requests" on coach_requests;
create policy "Students insert own requests"
  on coach_requests for insert
  with check (auth.uid() = student_id);

drop policy if exists "Student or coach can read" on coach_requests;
create policy "Student or coach can read"
  on coach_requests for select
  using (auth.uid() = student_id or auth.uid() = coach_id);

drop policy if exists "Coach updates own incoming" on coach_requests;
create policy "Coach updates own incoming"
  on coach_requests for update
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

drop policy if exists "Student cancels own pending" on coach_requests;
create policy "Student cancels own pending"
  on coach_requests for update
  using (auth.uid() = student_id and status = 'pending')
  with check (auth.uid() = student_id and status in ('pending','cancelled'));

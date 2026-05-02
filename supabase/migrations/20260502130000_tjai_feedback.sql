-- TJAI adaptive feedback loop (master upgrade prompt 6.4).
--
-- After every workout the user completes, a 1-tap question appears:
-- "How was that?" with three options (too_easy / right / too_hard).
-- The response is stored here. After 2 weeks of feedback rows TJAI
-- can suggest a regen modifier ("want me to make week 3+ harder?").
--
-- This table is the substrate. The UI prompt + the regen suggestion
-- logic are separate (`<WorkoutFeedbackPrompt />` and the existing
-- TJAI weekly check-in surface).

create table if not exists tjai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Optional FK — `set null` so historical feedback survives if the
  -- workout log is later removed.
  workout_log_id uuid references workout_logs(id) on delete set null,
  -- Free-form context tag so the same row shape can capture other
  -- adaptive moments (post-meal, post-day, etc.) without a schema
  -- change. Default 'workout' covers the immediate use case.
  context text not null default 'workout',
  rating text not null check (rating in ('too_easy', 'right', 'too_hard')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tjai_feedback_user_recent
  on tjai_feedback(user_id, created_at desc);

create index if not exists idx_tjai_feedback_workout_log
  on tjai_feedback(workout_log_id)
  where workout_log_id is not null;

alter table tjai_feedback enable row level security;

drop policy if exists tjai_feedback_select_own on tjai_feedback;
create policy tjai_feedback_select_own on tjai_feedback
  for select using (auth.uid() = user_id);

drop policy if exists tjai_feedback_insert_own on tjai_feedback;
create policy tjai_feedback_insert_own on tjai_feedback
  for insert with check (auth.uid() = user_id);

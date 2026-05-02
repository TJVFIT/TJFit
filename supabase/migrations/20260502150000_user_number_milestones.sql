-- Earned-number milestones (master upgrade prompt v3, Phase 5.4).
--
-- When a user hits a milestone (first workout, first 7-day streak,
-- first program complete, etc.), the corresponding number on the
-- page does ONE special thing for ~3 seconds and never repeats.
-- Then it settles forever as a slightly-warmer permanent state.
--
-- This table is the durable record. Rows are inserted by the
-- workflow that detects the milestone (workout-complete handler,
-- streak-tick cron, etc.) and read by the `<NumberDisplay
-- earned />` primitive on render.
--
-- Composite primary key on (user_id, milestone_key) means each
-- milestone fires at most once per user — re-running the detector
-- is idempotent.

create table if not exists user_number_milestones (
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Snake_case identifier — match the keys used by the consumer
  -- helper in src/lib/milestones.ts. Examples:
  --   'first_workout', 'first_streak_7', 'first_streak_30',
  --   'first_program_complete', 'first_diet_complete',
  --   'first_tjai_plan', 'first_apex_session'
  milestone_key text not null,
  reached_at timestamptz not null default now(),
  primary key (user_id, milestone_key)
);

create index if not exists idx_user_milestones_recent
  on user_number_milestones(user_id, reached_at desc);

alter table user_number_milestones enable row level security;

drop policy if exists user_milestones_select_own on user_number_milestones;
create policy user_milestones_select_own on user_number_milestones
  for select using (auth.uid() = user_id);

-- Inserts go through the service role only (workout completion
-- handler, cron job). No user-facing insert policy — milestones are
-- earned, not self-claimed.

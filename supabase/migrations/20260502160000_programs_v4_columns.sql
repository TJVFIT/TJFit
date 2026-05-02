-- v4 product-build columns + program_completions table.
--
-- Per docs/MASTER_PLAN_v4.md Part 1.3 (programs schema additions).
-- Additive only: every column uses `if not exists`, the new table
-- uses `if not exists`. Safe to run multiple times.
--
-- Notes:
--   * `trainer_id` references `auth.users(id)` rather than a
--     `coach_profiles` table because the latter doesn't exist yet
--     in the schema. When a richer coach profile table lands, drop
--     and re-add this FK pointing there. Existing data survives.
--   * `equipment_modes` is a JSONB array (e.g. `["full_gym",
--     "half_equipped","bodyweight"]`) used by the Phone-in-Pocket
--     program for its three-version toggling.
--   * `program_completions` is the substrate for testimonials,
--     ratings, and the "first 100 users get free Apex" testimonial
--     trade — we need a row to exist before consent can be given.

-- ============================================================
-- 1. Programs table — v4 columns
-- ============================================================
alter table programs
  add column if not exists program_type text;
-- Suggested values: 'comeback' / 'ramadan' / 'phone_in_pocket' /
-- 'body_recomp' / 'real_schedule_father' / 'real_schedule_student' /
-- 'strength_specific' / 'general'

alter table programs
  add column if not exists target_audience_i18n jsonb;

alter table programs
  add column if not exists experience_required text
    check (experience_required is null or experience_required in ('beginner','intermediate','advanced','any'));

alter table programs
  add column if not exists equipment_modes jsonb;

alter table programs
  add column if not exists prerequisites_i18n jsonb;

alter table programs
  add column if not exists results_target_i18n jsonb;

alter table programs
  add column if not exists trainer_id uuid references auth.users(id) on delete set null;

alter table programs
  add column if not exists testimonials_count int not null default 0;

alter table programs
  add column if not exists average_rating numeric(3,2);

alter table programs
  add column if not exists total_completions int not null default 0;

create index if not exists idx_programs_program_type
  on programs(program_type)
  where program_type is not null;

create index if not exists idx_programs_trainer
  on programs(trainer_id)
  where trainer_id is not null;

-- ============================================================
-- 2. program_completions — start / complete tracking + ratings
-- ============================================================
create table if not exists program_completions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  weeks_completed int not null default 0,
  rating int check (rating is null or (rating between 1 and 5)),
  testimonial_text text,
  testimonial_consent boolean not null default false,
  -- Per-program one-active-attempt-at-a-time. Users can complete a
  -- program multiple times — each attempt has a distinct row when
  -- the previous one has `completed_at` set.
  unique (program_id, user_id, started_at)
);

create index if not exists idx_program_completions_user
  on program_completions(user_id, started_at desc);

create index if not exists idx_program_completions_program
  on program_completions(program_id, completed_at desc nulls last)
  where completed_at is not null;

create index if not exists idx_program_completions_consented_testimonials
  on program_completions(program_id, rating)
  where testimonial_consent = true and rating is not null;

alter table program_completions enable row level security;

drop policy if exists program_completions_select_own on program_completions;
create policy program_completions_select_own on program_completions
  for select using (auth.uid() = user_id);

drop policy if exists program_completions_insert_own on program_completions;
create policy program_completions_insert_own on program_completions
  for insert with check (auth.uid() = user_id);

drop policy if exists program_completions_update_own on program_completions;
create policy program_completions_update_own on program_completions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read of consented testimonials for the /programs catalog
-- + the /transformations wall to surface real social proof.
drop policy if exists program_completions_select_consented_testimonials on program_completions;
create policy program_completions_select_consented_testimonials on program_completions
  for select using (
    testimonial_consent = true
    and rating is not null
    and testimonial_text is not null
  );

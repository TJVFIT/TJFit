-- Sync legacy `exercise` column with newer `exercise_name` column.
--
-- Earlier migrations created `workout_logs.exercise`; a later
-- migration (20260407150000_launch_polish_indexes) added
-- `exercise_name`. Different code paths read different columns:
-- `/api/tjai/chat`, `/api/progress/workouts`, `/api/progress/records`,
-- `/api/tjai/evaluate-progress` read `exercise`; `/api/tjai/progress`
-- and `tjai-plan-store` read `exercise_name`. Workouts logged via
-- one column were invisible to readers of the other.
--
-- This migration:
--   1. One-time backfills both columns from each other (idempotent).
--   2. Installs a BEFORE INSERT/UPDATE trigger that keeps the two
--      columns in lockstep going forward.
-- Long-term cleanup (drop `exercise`, migrate all writers to
-- `exercise_name`) is a follow-up, but data is now consistent
-- regardless of which column a reader picks.

-- 1. Backfill (only fills nulls — never overwrites existing data).
update workout_logs
   set exercise_name = exercise
 where exercise_name is null and exercise is not null;

update workout_logs
   set exercise = exercise_name
 where exercise is null and exercise_name is not null;

-- 2. Sync trigger.
create or replace function sync_workout_log_exercise_columns()
returns trigger
language plpgsql
as $$
begin
  if new.exercise_name is null and new.exercise is not null then
    new.exercise_name := new.exercise;
  elsif new.exercise is null and new.exercise_name is not null then
    new.exercise := new.exercise_name;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_workout_log_exercise_columns_trigger on workout_logs;
create trigger sync_workout_log_exercise_columns_trigger
  before insert or update on workout_logs
  for each row execute function sync_workout_log_exercise_columns();

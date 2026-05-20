-- Server-side aggregation for /api/progress/records.
--
-- The route previously loaded ALL of a user's workout_logs rows (no limit)
-- and grouped+maxed them in JS. For a power user with thousands of logs
-- that's a lot of payload + memory. This RPC pushes the aggregation into
-- Postgres so the route only receives one row per distinct exercise.
--
-- Grouping is case-insensitive (so "Bench Press" and "bench press" merge);
-- the returned exercise label uses min() to pick a stable representative
-- of whatever case the user actually typed.

create or replace function tjfit_workout_records(p_user_id uuid)
returns table (
  exercise text,
  max_weight_kg numeric,
  max_reps numeric,
  max_duration_minutes numeric,
  total_sets bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with normalized as (
    select
      trim(coalesce(w.exercise, w.exercise_name)) as raw_name,
      lower(trim(coalesce(w.exercise, w.exercise_name))) as exercise_key,
      w.weight_kg,
      w.reps,
      w.duration_minutes
    from workout_logs w
    where w.user_id = p_user_id
      and trim(coalesce(w.exercise, w.exercise_name)) is not null
      and length(trim(coalesce(w.exercise, w.exercise_name))) > 0
  )
  select
    min(raw_name) as exercise,
    max(weight_kg) as max_weight_kg,
    max(reps) as max_reps,
    max(duration_minutes) as max_duration_minutes,
    count(*) as total_sets
  from normalized
  group by exercise_key
  order by exercise_key;
$$;

revoke all on function tjfit_workout_records(uuid) from public;
grant execute on function tjfit_workout_records(uuid) to authenticated, service_role;

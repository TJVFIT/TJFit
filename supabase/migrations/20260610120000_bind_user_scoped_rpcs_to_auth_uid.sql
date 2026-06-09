-- Bind user-scoped SECURITY DEFINER RPCs to the calling user.
--
-- tjfit_workout_records and tjfit_toggle_suggestion_vote trusted their
-- p_user_id parameter, so any authenticated user could read another user's
-- workout PRs or toggle suggestion votes as them via /rest/v1/rpc. Both API
-- routes already pass auth.user.id, so requiring p_user_id = auth.uid() is
-- transparent to the app; service_role keeps unrestricted access for
-- admin/backfill use.
--
-- tjfit_replace_meal is invoked only via the service-role client
-- (api/tjai/replace-meal), so authenticated EXECUTE is revoked outright.

create or replace function public.tjfit_workout_records(p_user_id uuid)
returns table(
  exercise text,
  max_weight_kg numeric,
  max_reps numeric,
  max_duration_minutes numeric,
  total_sets bigint
)
language sql
stable security definer
set search_path = public
as $$
  with normalized as (
    select
      trim(coalesce(w.exercise, w.exercise_name)) as raw_name,
      lower(trim(coalesce(w.exercise, w.exercise_name))) as exercise_key,
      w.weight_kg, w.reps, w.duration_minutes
    from workout_logs w
    where w.user_id = p_user_id
      and (p_user_id = auth.uid() or auth.role() = 'service_role')
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

create or replace function public.tjfit_toggle_suggestion_vote(p_user_id uuid, p_suggestion_id uuid)
returns table(voted boolean, vote_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare v_existing record; v_new_count int;
begin
  if p_user_id is distinct from auth.uid()
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'tjfit_toggle_suggestion_vote: p_user_id must match the authenticated user';
  end if;
  if p_user_id is null or p_suggestion_id is null then
    return query select false, 0; return;
  end if;
  perform 1 from suggestions where id = p_suggestion_id for update;
  if not found then return query select false, 0; return; end if;
  select user_id into v_existing from suggestion_votes
    where user_id = p_user_id and suggestion_id = p_suggestion_id for update;
  if found then
    delete from suggestion_votes where user_id = p_user_id and suggestion_id = p_suggestion_id;
    update suggestions set vote_count = greatest(0, coalesce(vote_count, 0) - 1)
      where id = p_suggestion_id returning suggestions.vote_count into v_new_count;
    return query select false, coalesce(v_new_count, 0); return;
  end if;
  insert into suggestion_votes (user_id, suggestion_id) values (p_user_id, p_suggestion_id);
  update suggestions set vote_count = coalesce(vote_count, 0) + 1
    where id = p_suggestion_id returning suggestions.vote_count into v_new_count;
  return query select true, coalesce(v_new_count, 0);
end;
$$;

revoke execute on function public.tjfit_replace_meal(uuid, uuid, integer, integer, integer, jsonb) from authenticated;

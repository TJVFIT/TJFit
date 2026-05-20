-- Atomic in-place replacement of a single meal inside saved_tjai_plans.plan_json.
--
-- The previous route did read-modify-write on the WHOLE plan_json blob.
-- Two simultaneous meal replacements (e.g. user editing Day-1 Lunch while
-- a background job updates Day-3 Dinner) both read the same starting JSON,
-- each mutated locally, then both wrote back the full blob — the earlier
-- write's change was silently lost. This RPC uses jsonb_set on a precise
-- path so concurrent updates target different cells and don't trample each
-- other.

create or replace function tjfit_replace_meal(
  p_user_id uuid,
  p_plan_id uuid,
  p_week_index int,
  p_day_index int,
  p_meal_index int,
  p_meal jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_path text[];
  v_exists int;
  v_updated int;
begin
  if p_week_index < 0 or p_day_index < 0 or p_meal_index < 0 then
    return false;
  end if;

  -- Verify the plan exists, belongs to the caller, and the target path is
  -- valid. Without this check jsonb_set would silently create the path
  -- rather than fail — leaving the document with a stray meal at the
  -- nonexistent index.
  select count(*) into v_exists
    from saved_tjai_plans
    where id = p_plan_id
      and user_id = p_user_id
      and plan_json #> array['diet','weeks',p_week_index::text,'days',p_day_index::text,'meals',p_meal_index::text] is not null;

  if v_exists = 0 then
    return false;
  end if;

  v_path := array['diet','weeks',p_week_index::text,'days',p_day_index::text,'meals',p_meal_index::text];

  update saved_tjai_plans
    set plan_json = jsonb_set(plan_json, v_path, p_meal, false),
        updated_at = now()
    where id = p_plan_id
      and user_id = p_user_id;

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

revoke all on function tjfit_replace_meal(uuid, uuid, int, int, int, jsonb) from public;
grant execute on function tjfit_replace_meal(uuid, uuid, int, int, int, jsonb) to authenticated, service_role;

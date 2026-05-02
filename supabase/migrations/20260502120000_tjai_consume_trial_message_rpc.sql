-- Atomic trial-message increment for /api/tjai/chat.
--
-- Previous flow had a TOCTOU split: /chat read the count and gated
-- access while a separate /api/tjai/trial-consume-message route
-- (called optimistically by the client) bumped the count. Blocking
-- that client fetch in DevTools granted unlimited free messages.
--
-- This RPC closes the gap: gate + bump happen in one transaction,
-- locked via SELECT FOR UPDATE so concurrent requests cannot
-- overshoot the limit by more than one in flight at a time.

create or replace function consume_trial_message(
  p_user_id uuid,
  p_limit int
)
returns table(messages_used int, ok boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used int;
  v_ends_at timestamptz;
begin
  select tu.messages_used, tu.trial_ends_at
    into v_used, v_ends_at
    from tjai_trial_usage tu
    where tu.user_id = p_user_id
    for update;

  if v_used is null then
    -- Caller (signup / first-quiz flow) is responsible for seeding
    -- the row. Refuse rather than silently insert so the trial-
    -- bootstrap contract elsewhere stays the source of truth.
    return query select 0::int, false, 'no_trial_row'::text;
    return;
  end if;

  if v_ends_at is not null and v_ends_at < now() then
    return query select v_used, false, 'expired'::text;
    return;
  end if;

  if v_used >= p_limit then
    return query select v_used, false, 'limit_reached'::text;
    return;
  end if;

  update tjai_trial_usage
    set messages_used = v_used + 1
    where user_id = p_user_id;

  return query select (v_used + 1)::int, true, 'ok'::text;
end;
$$;

grant execute on function consume_trial_message(uuid, int) to authenticated, service_role;

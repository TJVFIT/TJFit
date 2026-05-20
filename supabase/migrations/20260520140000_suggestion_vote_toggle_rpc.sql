-- Atomic suggestion vote toggle.
--
-- The previous /api/suggestions/[id]/vote route was broken in two ways:
--  1. The "increment" branch ran `update({ vote_count: 0 })` — literally
--     zeroing the counter on every new vote.
--  2. The "decrement" branch called rpc("decrement_suggestion_votes") which
--     was never created — silent no-op.
-- So vote_count was unmaintained across the app's lifetime. This RPC fixes
-- both branches atomically and locks the suggestion row for the txn so
-- concurrent toggles don't drift the counter.

create or replace function tjfit_toggle_suggestion_vote(
  p_user_id uuid,
  p_suggestion_id uuid
)
returns table (
  voted boolean,
  vote_count int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing record;
  v_new_count int;
begin
  if p_user_id is null or p_suggestion_id is null then
    return query select false, 0;
    return;
  end if;

  -- Lock the suggestion row so concurrent toggles serialize on counter writes.
  perform 1
    from suggestions
    where id = p_suggestion_id
    for update;
  if not found then
    return query select false, 0;
    return;
  end if;

  select user_id into v_existing
    from suggestion_votes
    where user_id = p_user_id and suggestion_id = p_suggestion_id
    for update;

  if found then
    -- Unvote
    delete from suggestion_votes
      where user_id = p_user_id and suggestion_id = p_suggestion_id;
    update suggestions
      set vote_count = greatest(0, coalesce(vote_count, 0) - 1)
      where id = p_suggestion_id
      returning vote_count into v_new_count;
    return query select false, coalesce(v_new_count, 0);
    return;
  end if;

  -- Vote
  insert into suggestion_votes (user_id, suggestion_id)
    values (p_user_id, p_suggestion_id);
  update suggestions
    set vote_count = coalesce(vote_count, 0) + 1
    where id = p_suggestion_id
    returning vote_count into v_new_count;
  return query select true, coalesce(v_new_count, 0);
end;
$$;

revoke all on function tjfit_toggle_suggestion_vote(uuid, uuid) from public;
grant execute on function tjfit_toggle_suggestion_vote(uuid, uuid) to authenticated, service_role;

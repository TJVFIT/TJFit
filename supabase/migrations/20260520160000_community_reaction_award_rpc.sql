-- Atomic community blog reaction award.
--
-- The /api/community/reactions route had three issues:
--  1. A reactor could react to the same post many times, each triggering a
--     coin grant + notification, with no per-(reactor, post) uniqueness.
--  2. The author's daily cap was checked TOCTOU-style (read counter, JS
--     compare, then upsert) so concurrent reactions could exceed it.
--  3. awardTJCoin ran BEFORE the counter bump, so an upsert failure left
--     the coin awarded without the counter incrementing — retry awarded it
--     again.
-- This RPC consolidates the whole flow under one transaction with row locks.

create or replace function tjfit_award_reaction(
  p_reactor_id uuid,
  p_author_id uuid,
  p_post_id uuid,
  p_daily_cap int default 10
)
returns table (
  awarded boolean,
  reason text,
  coins_earned_today int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_current int;
  v_existing bigint;
begin
  if p_reactor_id is null or p_author_id is null or p_post_id is null then
    return query select false, 'invalid_input'::text, 0;
    return;
  end if;

  if p_reactor_id = p_author_id then
    return query select false, 'self_reaction'::text, 0;
    return;
  end if;

  -- Reactor idempotency: if this user has already triggered an award on this
  -- post, skip the second grant. Uses the ledger as source of truth so we
  -- don't need a separate reactions table.
  select count(*) into v_existing
    from tjfit_coin_ledger
    where reason = 'post_received_reaction'
      and metadata ->> 'postId' = p_post_id::text
      and metadata ->> 'reactorId' = p_reactor_id::text;
  if v_existing > 0 then
    return query select false, 'already_reacted'::text, 0;
    return;
  end if;

  -- Lock or create today's cap row for the author.
  insert into reaction_coin_log (user_id, date, coins_earned_today)
    values (p_author_id, v_today, 0)
    on conflict (user_id, date) do nothing;

  select coins_earned_today into v_current
    from reaction_coin_log
    where user_id = p_author_id and date = v_today
    for update;

  if v_current >= p_daily_cap then
    return query select false, 'daily_cap_reached'::text, v_current;
    return;
  end if;

  -- Bump counter and credit coin together. ledger insert + counter update
  -- + wallet update share the same txn frame.
  update reaction_coin_log
    set coins_earned_today = coins_earned_today + 1
    where user_id = p_author_id and date = v_today;

  insert into tjfit_coin_ledger (user_id, delta, reason, metadata)
    values (
      p_author_id,
      1,
      'post_received_reaction',
      jsonb_build_object('postId', p_post_id, 'reactorId', p_reactor_id)
    );

  insert into tjfit_coin_wallets (user_id)
    values (p_author_id)
    on conflict (user_id) do nothing;

  update tjfit_coin_wallets
    set balance = balance + 1,
        lifetime_earned = lifetime_earned + 1,
        updated_at = now()
    where user_id = p_author_id;

  return query select true, 'ok'::text, (v_current + 1);
end;
$$;

revoke all on function tjfit_award_reaction(uuid, uuid, uuid, int) from public;
grant execute on function tjfit_award_reaction(uuid, uuid, uuid, int) to service_role;

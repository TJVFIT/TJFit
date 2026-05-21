-- Atomic TJFITcoin redeem → discount-code generation.
--
-- Background: /api/coins/redeem used 4 separate Supabase calls — wallet
-- update, discount_codes insert, user_discount_codes insert, ledger insert.
-- The wallet was debited FIRST and if any subsequent insert failed, the
-- coins were lost without the user receiving a discount code. The route
-- even returned "your coins have not been deducted" which was untrue.
-- This RPC moves the whole sequence into one transaction so any failure
-- rolls back the wallet debit.

create or replace function tjfit_redeem_discount(
  p_user_id uuid,
  p_offer_key text,
  p_code text,
  p_ttl_days int default 7
)
returns table (
  ok boolean,
  reason text,
  balance int,
  lifetime_earned int,
  lifetime_spent int,
  discount_percent int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer record;
  v_balance int;
  v_lifetime_earned int;
  v_lifetime_spent int;
  v_expires_at timestamptz;
begin
  if p_user_id is null or p_offer_key is null or p_code is null then
    return query select false, 'invalid_input'::text, 0, 0, 0, 0;
    return;
  end if;

  select key, coin_cost, discount_percent, active
    into v_offer
    from tjfit_discount_offers
    where key = p_offer_key;

  if not found or not v_offer.active then
    return query select false, 'offer_not_found'::text, 0, 0, 0, 0;
    return;
  end if;

  -- Ensure wallet row exists, then lock it for the duration of the txn.
  insert into tjfit_coin_wallets (user_id) values (p_user_id)
    on conflict (user_id) do nothing;

  select balance, lifetime_earned, lifetime_spent
    into v_balance, v_lifetime_earned, v_lifetime_spent
    from tjfit_coin_wallets
    where user_id = p_user_id
    for update;

  if v_balance is null then
    return query select false, 'wallet_missing'::text, 0, 0, 0, 0;
    return;
  end if;

  if v_balance < v_offer.coin_cost then
    return query select
      false,
      'insufficient_balance'::text,
      v_balance,
      v_lifetime_earned,
      v_lifetime_spent,
      v_offer.discount_percent;
    return;
  end if;

  -- All writes share the same txn frame so an insert failure rolls back the
  -- wallet debit. Discount code primary-key uniqueness handles dup-code
  -- collisions (caller retries with a new code if rare collision occurs).
  update tjfit_coin_wallets
    set balance = v_balance - v_offer.coin_cost,
        lifetime_spent = v_lifetime_spent + v_offer.coin_cost,
        updated_at = now()
    where user_id = p_user_id;

  insert into tjfit_discount_codes (code, user_id, offer_key, discount_percent, status)
    values (p_code, p_user_id, v_offer.key, v_offer.discount_percent, 'available');

  v_expires_at := now() + make_interval(days => greatest(1, p_ttl_days));

  -- user_discount_codes is a secondary log; skip silently if the table or
  -- columns drift — primary discount_codes is the source of truth.
  begin
    insert into user_discount_codes (
      user_id, code, discount_percent, product_type, coins_spent,
      redeemed_at, expires_at, status
    ) values (
      p_user_id, p_code, v_offer.discount_percent,
      case
        when v_offer.key like '%diet%' then 'diet'
        when v_offer.key like '%program%' then 'program'
        when v_offer.key like '%bundle%' then 'bundle'
        else 'any'
      end,
      v_offer.coin_cost,
      now(),
      v_expires_at,
      'available'
    );
  exception when others then
    -- non-fatal
    null;
  end;

  insert into tjfit_coin_ledger (user_id, delta, reason, metadata)
    values (
      p_user_id,
      -v_offer.coin_cost,
      'discount_code_redeem',
      jsonb_build_object(
        'offerKey', v_offer.key,
        'discountPercent', v_offer.discount_percent,
        'code', p_code
      )
    );

  return query select
    true,
    'ok'::text,
    (v_balance - v_offer.coin_cost),
    v_lifetime_earned,
    (v_lifetime_spent + v_offer.coin_cost),
    v_offer.discount_percent;
end;
$$;

revoke all on function tjfit_redeem_discount(uuid, text, text, int) from public;
grant execute on function tjfit_redeem_discount(uuid, text, text, int) to service_role;

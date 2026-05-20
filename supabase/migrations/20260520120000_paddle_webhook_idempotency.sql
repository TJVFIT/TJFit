-- Paddle webhook idempotency + atomic coin grant
-- Background: Paddle re-delivers webhooks on transient failures. Without event-id
-- dedup, subscription.renewed sends duplicate emails. The previous
-- fulfillProgramOrderPaid path also had a torn-write hazard: order was marked
-- paid before the (non-atomic) wallet/ledger writes, so any failure between
-- those steps could lose coins permanently (next retry early-bails as
-- alreadyPaid). This migration adds atomic grant via SQL function.

create table if not exists paddle_webhook_events (
  event_id text primary key,
  event_type text not null,
  occurred_at timestamptz,
  received_at timestamptz not null default now(),
  result jsonb not null default '{}'::jsonb
);

create index if not exists idx_paddle_webhook_events_received_at
  on paddle_webhook_events(received_at desc);

alter table paddle_webhook_events enable row level security;
-- No policies: service role bypasses RLS; clients have no business reading this.

-- Idempotency guard for program-purchase coin grants. Allows multiple non-order
-- ledger entries (referrals, daily quests, etc) but enforces one per order.
create unique index if not exists uniq_coin_ledger_order_reason
  on tjfit_coin_ledger (order_id, reason)
  where order_id is not null;

-- Atomic coin grant. Returns true when this call performed the grant, false if
-- a prior call already did. Both branches leave the wallet and ledger
-- consistent — the ledger insert and wallet update share a single statement
-- frame, so a partial write cannot leave the wallet credited without a ledger
-- row (or vice versa).
create or replace function tjfit_grant_program_purchase_coins(
  p_user_id uuid,
  p_order_id uuid,
  p_amount integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  if p_amount <= 0 then
    return false;
  end if;

  insert into tjfit_coin_ledger (user_id, delta, reason, order_id, metadata)
  values (
    p_user_id,
    p_amount,
    'program_purchase',
    p_order_id,
    jsonb_build_object('source', 'checkout_fulfill', 'coinsPerProgram', p_amount)
  )
  on conflict (order_id, reason) where order_id is not null do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  insert into tjfit_coin_wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  update tjfit_coin_wallets
  set
    balance = balance + p_amount,
    lifetime_earned = lifetime_earned + p_amount,
    updated_at = now()
  where user_id = p_user_id;

  return true;
end;
$$;

revoke all on function tjfit_grant_program_purchase_coins(uuid, uuid, integer) from public;
grant execute on function tjfit_grant_program_purchase_coins(uuid, uuid, integer) to service_role;

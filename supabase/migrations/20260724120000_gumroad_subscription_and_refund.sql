-- Gumroad fulfillment trio — schema support for subscription + refund paths.
--
-- Context: Paddle was removed (commit 44f26a7); Gumroad is the merchant of
-- record. Two gaps blocked money-critical fulfillment:
--
--   1. user_subscriptions could only correlate to a Paddle subscription id.
--      Gumroad subscription lifecycle webhooks (subscription_updated /
--      _restarted / _ended, cancellation) carry a Gumroad `subscription_id`,
--      so we need a column to match those events back to the row that the
--      first-charge `sale` event created. Idempotent upserts still key on the
--      existing unique (user_id) index; this column is the lifecycle match key.
--
--   2. program_orders.status only allowed ('pending','paid','failed'). The
--      refund webhook must mark a fulfilled order refunded to revoke the
--      in-app entitlement (hasPurchasedProgram gates on status='paid'), so
--      'refunded' has to be a legal terminal state.
--
-- Additive + idempotent. Safe to run against a live DB.

-- ── 1. Gumroad subscription id on user_subscriptions ──────────────────────
alter table user_subscriptions
  add column if not exists gumroad_subscription_id text;

-- Non-unique index: a resubscribe can legitimately reuse the row (upsert on
-- user_id), and we only ever read the newest match. Unique would make a
-- restart-after-cancel collide.
create index if not exists idx_user_subscriptions_gumroad_sub
  on user_subscriptions(gumroad_subscription_id)
  where gumroad_subscription_id is not null;

-- ── 2. Allow 'refunded' as a program_orders terminal status ───────────────
do $$
declare
  v_constraint text;
begin
  select conname into v_constraint
    from pg_constraint
    where conrelid = 'public.program_orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
      and pg_get_constraintdef(oid) ilike '%pending%';

  if v_constraint is not null then
    execute format('alter table public.program_orders drop constraint %I', v_constraint);
  end if;

  alter table public.program_orders
    add constraint program_orders_status_check
    check (status in ('pending', 'paid', 'failed', 'refunded'));
exception
  when duplicate_object then
    -- constraint already re-added by a prior run — nothing to do.
    null;
end $$;

-- v2 operations schemas (master upgrade prompt v2 — phases 2.6, 7.4, 7.5).
--
-- Four additive tables for the business backbone:
--   * coupons + coupon_redemptions  (Phase 7.4 promo system)
--   * admin_audit_log               (Phase 7.5 immutable action log)
--   * manual_purchase_requests      (Phase 2.6 fallback when Gumroad fails)
--   * payment_webhooks              (Phase 2.3 raw webhook log for debugging
--                                     + idempotency dedup)

-- ============================================================
-- 1. Coupons / promo codes (Phase 7.4)
-- ============================================================
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  applies_to text not null check (applies_to in ('programs','diets','pro','apex','tjai_plan','all')),
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  -- Influencer / affiliate attribution: each coupon optionally tied
  -- to a referrer who earns commission on redemption.
  referrer_id uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_coupons_code on coupons(code);
create index if not exists idx_coupons_referrer on coupons(referrer_id) where referrer_id is not null;

create table if not exists coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text,
  -- Cents on the dollar discounted, captured at redemption time so
  -- analytics and accounting work even if the coupon is later edited.
  discount_amount_usd numeric(10,2),
  redeemed_at timestamptz not null default now(),
  unique(coupon_id, user_id, order_id)
);

create index if not exists idx_coupon_redemptions_user on coupon_redemptions(user_id, redeemed_at desc);
create index if not exists idx_coupon_redemptions_coupon on coupon_redemptions(coupon_id, redeemed_at desc);

alter table coupons enable row level security;
alter table coupon_redemptions enable row level security;

-- Public can read coupons by code (so checkout can validate them);
-- only service role / admins write. Redemptions are private to the user.
drop policy if exists coupons_read_public on coupons;
create policy coupons_read_public on coupons
  for select using (true);

drop policy if exists coupon_redemptions_select_own on coupon_redemptions;
create policy coupon_redemptions_select_own on coupon_redemptions
  for select using (auth.uid() = user_id);

-- Inserts on coupon_redemptions go through the service role only
-- (called from checkout fulfillment). No user-facing insert policy.

-- ============================================================
-- 2. Admin audit log (Phase 7.5) — append-only
-- ============================================================
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  -- Snake_case verb_noun, e.g. 'refund_issued', 'access_granted',
  -- 'user_suspended', 'coupon_created', 'coach_approved'.
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_actor on admin_audit_log(actor_id, created_at desc);
create index if not exists idx_admin_audit_action on admin_audit_log(action, created_at desc);
create index if not exists idx_admin_audit_target on admin_audit_log(target_type, target_id, created_at desc);

alter table admin_audit_log enable row level security;

-- Admins only read (the admin dashboard surfaces this). NO update or
-- delete policy — log is permanent. Inserts happen through the
-- service role.
drop policy if exists admin_audit_select_admin on admin_audit_log;
create policy admin_audit_select_admin on admin_audit_log
  for select using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- 3. Manual purchase fallback (Phase 2.6)
-- ============================================================
create table if not exists manual_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  product_kind text not null check (product_kind in ('program','diet','tjai_plan','pro','apex','bundle')),
  product_slug text,
  amount_usd numeric(10,2),
  preferred_method text check (preferred_method in ('paypal','wise','bank_transfer','usdt','iyzico','other')),
  user_notes text,
  status text not null default 'pending' check (
    status in ('pending','contacted','payment_received','fulfilled','cancelled','refunded')
  ),
  admin_notes text,
  fulfilled_by uuid references auth.users(id) on delete set null,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_manual_purchase_status on manual_purchase_requests(status, created_at desc);
create index if not exists idx_manual_purchase_user on manual_purchase_requests(user_id, created_at desc) where user_id is not null;
create index if not exists idx_manual_purchase_email on manual_purchase_requests(email);

alter table manual_purchase_requests enable row level security;

drop policy if exists manual_purchase_select_own on manual_purchase_requests;
create policy manual_purchase_select_own on manual_purchase_requests
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','support'))
  );

drop policy if exists manual_purchase_insert_own on manual_purchase_requests;
create policy manual_purchase_insert_own on manual_purchase_requests
  for insert with check (
    -- Allow logged-in users to file their own request, or anyone
    -- (anonymous) to file by email.
    auth.uid() = user_id or user_id is null
  );

-- ============================================================
-- 4. Payment webhooks (Phase 2.3) — raw payload log + idempotency
-- ============================================================
create table if not exists payment_webhooks (
  id uuid primary key default gen_random_uuid(),
  -- Provider that sent the webhook: 'gumroad' | 'paddle' | 'stripe'
  provider text not null,
  -- Provider's own event ID (used for idempotency dedup).
  event_id text not null,
  event_type text,
  raw_payload jsonb not null,
  signature text,
  signature_valid boolean,
  -- Processing status:
  --   received   = stored, not yet routed
  --   processed  = routed to handler successfully
  --   failed     = handler error; review needed
  --   ignored    = recognised event type but no action required
  status text not null default 'received' check (
    status in ('received','processed','failed','ignored')
  ),
  handler_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, event_id)
);

create index if not exists idx_payment_webhooks_status on payment_webhooks(status, created_at desc);
create index if not exists idx_payment_webhooks_provider_event on payment_webhooks(provider, event_type, created_at desc);

alter table payment_webhooks enable row level security;

-- Admins only — webhook payloads can contain emails / IDs we don't
-- want exposed to other users.
drop policy if exists payment_webhooks_select_admin on payment_webhooks;
create policy payment_webhooks_select_admin on payment_webhooks
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

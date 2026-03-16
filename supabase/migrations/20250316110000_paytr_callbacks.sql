-- Idempotency table for PayTR payment callbacks
create table if not exists paytr_callbacks (
  merchant_oid text primary key,
  status text not null,
  total_amount text not null,
  raw_payload jsonb,
  processed_at timestamptz default now()
);

-- Only service role can access (no RLS policies for anon)
alter table paytr_callbacks enable row level security;

-- No policies = deny all for anon; service role bypasses RLS

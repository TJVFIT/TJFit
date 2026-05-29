-- TJFITV.10X PR8 — data flywheel event stream + plan learning metadata.
--
-- tjai_events is a privacy-minimized, append-only behavioral event log: scalar
-- metadata only, no raw chat text and no raw plan JSON. It lets TJAI learn like a
-- coaching org (aggregate patterns, repeated failure modes, eval seeds) rather
-- than a self-modifying bot. Service role writes; admins read; users never see
-- cross-user rows.

create table if not exists public.tjai_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event text not null,
  occurred_at timestamptz not null default now(),
  locale text,
  tier text,
  plan_id uuid,
  conversation_id uuid,
  prompt_version text,
  policy_version text,
  model_provider text,
  model_name text,
  intent text,
  risk_level text,
  outcome text,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.tjai_events enable row level security;

drop policy if exists "Service role manages tjai_events" on public.tjai_events;
create policy "Service role manages tjai_events" on public.tjai_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "Admins read tjai_events" on public.tjai_events;
create policy "Admins read tjai_events" on public.tjai_events
  for select using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create index if not exists idx_tjai_events_created on public.tjai_events(occurred_at desc);
create index if not exists idx_tjai_events_event_created on public.tjai_events(event, occurred_at desc);
create index if not exists idx_tjai_events_user_created on public.tjai_events(user_id, occurred_at desc);

-- Persist the derived readiness profile, prompt version, and validation summary
-- alongside each generated plan so cohort learning can join outcomes to the
-- inputs and policy version that produced them. User-owned rows (existing RLS
-- on saved_tjai_plans is unchanged).
alter table public.saved_tjai_plans
  add column if not exists readiness_json jsonb,
  add column if not exists prompt_version text,
  add column if not exists validation_json jsonb;

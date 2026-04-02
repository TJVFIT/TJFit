-- Coach acceptance of platform terms (versioned). Admins are not required to accept via this table.
create table if not exists public.coach_terms_acceptance (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users (id) on delete cascade,
  accepted_at timestamptz not null default now(),
  terms_version text not null,
  ip_address text
);

create index if not exists coach_terms_acceptance_coach_id_idx on public.coach_terms_acceptance (coach_id);
create index if not exists coach_terms_acceptance_coach_accepted_idx
  on public.coach_terms_acceptance (coach_id, accepted_at desc);

alter table public.coach_terms_acceptance enable row level security;

create policy "Coaches can read own terms acceptance"
  on public.coach_terms_acceptance
  for select
  using (auth.uid() = coach_id);

create policy "Coaches can insert own terms acceptance"
  on public.coach_terms_acceptance
  for insert
  with check (auth.uid() = coach_id);

comment on table public.coach_terms_acceptance is 'Versioned coach terms acceptance; compare terms_version to server COACH_TERMS_VERSION.';

create table if not exists marketing_subscribers (
  email text primary key,
  locale text not null default 'en',
  source text not null default 'guest-onboarding',
  opted_in boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table marketing_subscribers enable row level security;

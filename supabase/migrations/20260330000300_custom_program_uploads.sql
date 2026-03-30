create table if not exists custom_programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  kind text not null check (kind in ('diet', 'program')),
  price_try integer not null check (price_try in (350, 400)),
  difficulty text not null default 'Beginner to Advanced',
  duration text not null default '12 weeks',
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  uploader_role text not null check (uploader_role in ('coach', 'admin')),
  pdf_path text not null,
  pdf_size_bytes bigint not null default 0,
  source_pdf_text text not null default '',
  localized_title jsonb not null default '{}'::jsonb,
  localized_description jsonb not null default '{}'::jsonb,
  localized_pdf_text jsonb not null default '{}'::jsonb,
  translation_status text not null default 'completed' check (translation_status in ('pending', 'completed', 'failed')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_custom_programs_active_created
  on custom_programs (active, created_at desc);

create index if not exists idx_custom_programs_uploaded_by_active
  on custom_programs (uploaded_by, active);

alter table custom_programs enable row level security;

create policy "Public can read active custom programs"
  on custom_programs for select
  using (active = true);

create policy "Uploader can read own custom programs"
  on custom_programs for select
  using (auth.uid() = uploaded_by);

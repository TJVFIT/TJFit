-- Free catalog slugs (mirrors static programs with is_free in app). Used for admin/reporting and RLS extensions.
create table if not exists public.program_catalog_flags (
  slug text primary key,
  is_free boolean not null default false
);

insert into public.program_catalog_flags (slug, is_free)
values
  ('home-fat-loss-starter', true),
  ('gym-muscle-starter', true),
  ('clean-cut-starter', true),
  ('lean-bulk-starter', true)
on conflict (slug) do update
set is_free = excluded.is_free;

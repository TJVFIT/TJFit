-- program_preview_views (append-only preview-tracking log) had no primary key
-- (performance advisor lint no_primary_key). A surrogate identity PK is
-- non-breaking: no code inserts an id column (verified — table is referenced
-- only via the FK index, not in src/). Replication and admin tooling require
-- a PK.
alter table public.program_preview_views
  add column if not exists id bigint generated always as identity;

alter table public.program_preview_views
  add constraint program_preview_views_pkey primary key (id);

-- Transformation wall photos — storage bucket for user_transformations
-- (before_image_url / after_image_url, migration 20260405201000).
--
-- ADDITIVE ONLY. This migration is not applied by the authoring agent — an
-- owner runs it against prod. Ships alongside code that already handles a
-- not-yet-applied bucket via isMissingSchemaMigrationError -> 503
-- (DATABASE_SCHEMA_NOT_READY), so the app degrades gracefully until this runs.
--
-- Visibility decision: mirrors the 'avatars' bucket
-- (20260602120000_create_missing_storage_buckets.sql), the closest sibling —
-- both are user-uploaded personal-photo content written through an
-- owner-scoped "<uid>/..." folder policy. avatars is public=true with NO
-- storage.objects SELECT policy: objects are served via the public CDN URL
-- (getPublicUrl) at an unguessable per-upload path, and we deliberately do
-- NOT add a broad SELECT policy because that would let any client LIST every
-- object in the bucket (advisor lint 0025 public_bucket_allows_listing) --
-- e.g. enumerate every user's photo paths -- which nothing here needs.
-- Approval status is enforced at the application layer (the GET list route
-- only returns approved rows' URLs) and by user_transformations RLS
-- (read approved-or-own), not by storage visibility; the bucket itself has
-- the same "public but unguessable path, no listing" shape as avatars. That
-- is the SAFEST sibling available in this codebase for owner-uploaded photos
-- that a signed-URL upload flow writes into per-user folders — a fully
-- private bucket would require a service-role signed-read on every list
-- render, which no existing sibling does and which the API layer already
-- guards against for status leakage.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('transformation-photos', 'transformation-photos', true, 8388608, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

-- Authenticated users may write only within their own "<uid>/..." folder,
-- matching the upload-url route's storagePath `${userId}/{before|after}-...`.
create policy "transformation photos owner insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'transformation-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "transformation photos owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'transformation-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'transformation-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "transformation photos owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'transformation-photos' and (storage.foldername(name))[1] = auth.uid()::text);

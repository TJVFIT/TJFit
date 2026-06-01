-- The app references two storage buckets that were never created on this
-- project (only 'secure-chat' existed): 'avatars' (signup avatar upload,
-- src/app/[locale]/signup uses getPublicUrl) and 'community-blog-images'
-- (BLOG_BUCKET, admin blog cover images). Without them, avatar uploads
-- silently fail (guarded -> users get no profile picture) and blog image
-- uploads error. Create both as public-read buckets.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/webp','image/jpeg','image/png']),
  ('community-blog-images', 'community-blog-images', true, 10485760, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

-- Both buckets are public=true, so objects are served via the public CDN URL
-- (getPublicUrl) without any storage.objects SELECT policy. We deliberately do
-- NOT add a broad SELECT policy: it would let clients LIST every object
-- (advisor lint 0025 public_bucket_allows_listing) — e.g. enumerate all users'
-- avatar paths — without enabling anything the app needs.

-- AVATARS: authenticated users may write only within their own "<uid>/..."
-- folder (matches the signup upload path `${userId}/avatar-*.webp`).
create policy "avatars owner insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- COMMUNITY-BLOG-IMAGES: writes go through the service-role admin client
-- (api/blog/posts, api/community/blogs), which bypasses RLS, so no
-- anon/authenticated write policy is granted. Public reads use the public CDN
-- URL (no SELECT policy needed, per the note above).

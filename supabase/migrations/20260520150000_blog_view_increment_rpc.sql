-- Atomic blog view increment.
--
-- The /api/blog/posts/[id] route previously read views, incremented JS-side,
-- then wrote back — losing increments under concurrent loads. This RPC bumps
-- the counter in a single UPDATE so concurrent calls each commit cleanly.
-- (Spam protection is a separate concern handled at the route layer.)

create or replace function increment_blog_view_count(p_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new int;
begin
  update community_blog_posts
    set views = coalesce(views, 0) + 1
    where id = p_id and status = 'published'
    returning views into v_new;
  return coalesce(v_new, 0);
end;
$$;

revoke all on function increment_blog_view_count(uuid) from public;
grant execute on function increment_blog_view_count(uuid) to anon, authenticated, service_role;

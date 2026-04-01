-- Member search: substring match (no user-supplied LIKE wildcards) + can_message from messaging_allowed.

create or replace function public.search_profiles(search_query text, result_limit int default 24)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio_preview text,
  is_private boolean,
  can_message boolean
)
language sql
security definer
set search_path = public
stable
as $$
  with q as (
    select nullif(trim(search_query), '') as needle
  )
  select
    p.id,
    p.username,
    coalesce(nullif(trim(p.display_name), ''), p.username) as display_name,
    p.avatar_url,
    case
      when p.is_private = false then left(p.bio, 200)
      else ''
    end as bio_preview,
    p.is_private,
    public.messaging_allowed(auth.uid(), p.id) as can_message
  from profiles p, q
  where auth.uid() is not null
    and q.needle is not null
    and p.id <> auth.uid()
    and p.is_searchable = true
    and char_length(q.needle) >= 2
    and (
      position(lower(q.needle) in p.username_normalized) > 0
      or position(lower(q.needle) in lower(coalesce(p.display_name, ''))) > 0
    )
  order by
    case when p.username_normalized like lower(q.needle) || '%' then 0 else 1 end,
    p.username_normalized asc
  limit coalesce(nullif(result_limit, 0), 24);
$$;

grant execute on function public.search_profiles(text, int) to authenticated;

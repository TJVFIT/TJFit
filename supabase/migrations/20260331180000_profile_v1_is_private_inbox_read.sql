-- V1 profile naming + coaches_only + inbox read cursor + conversation metadata
-- Keeps E2E message payload (ciphertext); preview is a non-content placeholder only.

-- ---------------------------------------------------------------------------
-- Profiles: is_private, is_searchable (rename), drop account_visibility
-- ---------------------------------------------------------------------------
alter table profiles add column if not exists is_private boolean;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'account_visibility'
  ) then
    execute $u$update profiles set is_private = (account_visibility = 'private') where is_private is null$u$;
  end if;
end$$;

update profiles set is_private = false where is_private is null;

alter table profiles alter column is_private set not null;
alter table profiles alter column is_private set default false;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'searchable'
  ) then
    alter table profiles rename column searchable to is_searchable;
  end if;
end$$;

alter table profiles drop column if exists account_visibility;

alter table profiles drop constraint if exists profiles_message_privacy_check;

update profiles set message_privacy = 'coaches_only' where message_privacy = 'staff_only';

alter table profiles
  add constraint profiles_message_privacy_check check (
    message_privacy in ('everyone', 'nobody', 'coaches_only', 'connections_only', 'approved_only')
  );

-- ---------------------------------------------------------------------------
-- Conversations: created_by
-- ---------------------------------------------------------------------------
alter table conversations add column if not exists created_by uuid references auth.users (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Participants: last_read_at
-- ---------------------------------------------------------------------------
alter table conversation_participants add column if not exists last_read_at timestamptz;

-- ---------------------------------------------------------------------------
-- messaging_allowed: coaches_only
-- ---------------------------------------------------------------------------
create or replace function public.messaging_allowed(sender_id uuid, recipient_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  pol text;
  sender_role text;
begin
  if sender_id is null or recipient_id is null then
    return false;
  end if;
  if sender_id = recipient_id then
    return false;
  end if;

  select message_privacy into pol from profiles where id = recipient_id;
  if pol is null then
    return false;
  end if;

  if pol = 'nobody' then
    return false;
  end if;

  if pol = 'everyone' then
    return true;
  end if;

  if pol = 'coaches_only' then
    select role into sender_role from profiles where id = sender_id;
    return coalesce(sender_role, '') in ('coach', 'admin');
  end if;

  if pol = 'connections_only' then
    return exists (
      select 1
      from coach_student_links csl
      where csl.status = 'active'
        and (
          (csl.coach_id = sender_id and csl.student_id = recipient_id)
          or (csl.student_id = sender_id and csl.coach_id = recipient_id)
        )
    );
  end if;

  if pol = 'approved_only' then
    return exists (
      select 1
      from message_allowances ma
      where ma.granter_id = recipient_id
        and ma.grantee_id = sender_id
    );
  end if;

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- Direct conversation: set created_by
-- ---------------------------------------------------------------------------
create or replace function public.create_direct_conversation(
  peer_id uuid,
  initiator_wrapped_key text,
  peer_wrapped_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  cid uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if peer_id = me then
    raise exception 'invalid peer';
  end if;
  if initiator_wrapped_key is null or initiator_wrapped_key = ''
    or peer_wrapped_key is null or peer_wrapped_key = ''
  then
    raise exception 'missing keys';
  end if;

  if not public.messaging_allowed(me, peer_id) then
    raise exception 'messaging not allowed';
  end if;

  select c.id into cid
  from conversations c
  where c.conversation_type = 'direct'
    and exists (
      select 1 from conversation_participants p
      where p.conversation_id = c.id and p.user_id = me
    )
    and exists (
      select 1 from conversation_participants p2
      where p2.conversation_id = c.id and p2.user_id = peer_id
    )
  limit 1;

  if cid is not null then
    return cid;
  end if;

  insert into conversations (conversation_type, coach_student_link_id, created_by)
  values ('direct', null, me)
  returning id into cid;

  insert into conversation_participants (conversation_id, user_id, encrypted_conversation_key)
  values
    (cid, me, initiator_wrapped_key),
    (cid, peer_id, peer_wrapped_key);

  return cid;
end;
$$;

-- ---------------------------------------------------------------------------
-- Search: is_searchable + is_private in result
-- ---------------------------------------------------------------------------
create or replace function public.search_profiles(search_query text, result_limit int default 24)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio_preview text,
  is_private boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.username,
    coalesce(nullif(trim(p.display_name), ''), p.username) as display_name,
    p.avatar_url,
    case
      when p.is_private = false then left(p.bio, 200)
      else ''
    end as bio_preview,
    p.is_private
  from profiles p
  where auth.uid() is not null
    and p.id <> auth.uid()
    and p.is_searchable = true
    and (
      p.username_normalized like lower(trim(search_query)) || '%'
      or coalesce(p.display_name, '') ilike '%' || trim(search_query) || '%'
    )
  order by p.username_normalized asc
  limit coalesce(nullif(result_limit, 0), 24);
$$;

-- ---------------------------------------------------------------------------
-- Profile card
-- ---------------------------------------------------------------------------
create or replace function public.get_profile_card(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v profiles%rowtype;
  viewer uuid := auth.uid();
  can_msg boolean;
begin
  select * into v from profiles where username_normalized = lower(trim(p_username));
  if not found then
    return null::jsonb;
  end if;

  if viewer = v.id then
    return jsonb_build_object(
      'self', true,
      'id', v.id,
      'username', v.username,
      'display_name', coalesce(nullif(trim(v.display_name), ''), v.username),
      'avatar_url', v.avatar_url,
      'bio', v.bio,
      'is_private', v.is_private,
      'is_searchable', v.is_searchable,
      'message_privacy', v.message_privacy,
      'role', v.role
    );
  end if;

  if viewer is null then
    return jsonb_build_object(
      'self', false,
      'id', v.id,
      'username', v.username,
      'display_name', coalesce(nullif(trim(v.display_name), ''), v.username),
      'avatar_url', v.avatar_url,
      'bio', case when v.is_private = false then v.bio else '' end,
      'is_private', v.is_private,
      'limited', true,
      'can_message', false,
      'role', case when v.role in ('coach', 'admin') then v.role else 'user' end
    );
  end if;

  can_msg := public.messaging_allowed(viewer, v.id);

  return jsonb_build_object(
    'self', false,
    'id', v.id,
    'username', v.username,
    'display_name', coalesce(nullif(trim(v.display_name), ''), v.username),
    'avatar_url', v.avatar_url,
    'bio', case when v.is_private = false then v.bio else '' end,
    'is_private', v.is_private,
    'limited', v.is_private = true,
    'can_message', can_msg,
    'role', case when v.role in ('coach', 'admin') then v.role else 'user' end
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Inbox list with last activity + unread (E2E: preview is placeholder only)
-- ---------------------------------------------------------------------------
create or replace function public.list_my_conversations_with_peers()
returns table (
  conversation_id uuid,
  conv_created_at timestamptz,
  conversation_type text,
  peer_id uuid,
  peer_username text,
  peer_display_name text,
  peer_avatar_url text,
  last_message_at timestamptz,
  last_message_preview text,
  unread_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id,
    c.created_at,
    c.conversation_type,
    p2.user_id,
    pr.username,
    coalesce(nullif(trim(pr.display_name), ''), pr.username) as dn,
    pr.avatar_url,
    stats.last_at,
    case
      when stats.last_at is null then null::text
      else 'encrypted'::text
    end as last_message_preview,
    coalesce(unread.cnt, 0)::bigint
  from conversations c
  join conversation_participants p1
    on p1.conversation_id = c.id and p1.user_id = auth.uid()
  join conversation_participants p2
    on p2.conversation_id = c.id and p2.user_id <> auth.uid()
  join profiles pr on pr.id = p2.user_id
  left join lateral (
    select max(m.created_at) as last_at
    from messages m
    where m.conversation_id = c.id
  ) stats on true
  left join lateral (
    select count(*)::bigint as cnt
    from messages m
    where m.conversation_id = c.id
      and m.sender_id <> auth.uid()
      and (p1.last_read_at is null or m.created_at > p1.last_read_at)
  ) unread on true
  order by coalesce(stats.last_at, c.created_at) desc;
$$;

-- ---------------------------------------------------------------------------
-- Mark read
-- ---------------------------------------------------------------------------
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1 from conversation_participants
    where conversation_id = p_conversation_id and user_id = auth.uid()
  ) then
    return;
  end if;

  update conversation_participants cp
  set last_read_at = now()
  where cp.conversation_id = p_conversation_id
    and cp.user_id = auth.uid();
end;
$$;

grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- New signups: shorter default username (<= 20 chars for validation)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text := 'u' || substr(replace(new.id::text, '-', ''), 1, 15);
begin
  insert into public.profiles (id, email, role, username, username_normalized, display_name)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    'user',
    base,
    lower(base),
    nullif(trim(split_part(lower(coalesce(new.email, '')), '@', 1)), '')
  )
  on conflict (id) do update
    set email = excluded.email
  where public.profiles.role <> 'coach' and public.profiles.role <> 'admin';
  return new;
end;
$$;

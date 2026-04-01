-- Social identity + username-based discovery + direct messaging (V1)
-- Preserves coach_student_link conversations; adds conversation_type = 'direct'.

-- ---------------------------------------------------------------------------
-- Profiles: username, display, avatar, bio, privacy
-- ---------------------------------------------------------------------------
alter table profiles
  add column if not exists username text,
  add column if not exists username_normalized text,
  add column if not exists display_name text default '',
  add column if not exists avatar_url text,
  add column if not exists bio text default '',
  add column if not exists account_visibility text not null default 'public'
    check (account_visibility in ('public', 'private')),
  add column if not exists searchable boolean not null default true,
  add column if not exists message_privacy text not null default 'everyone'
    check (message_privacy in ('everyone', 'nobody', 'staff_only', 'connections_only', 'approved_only')),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists uniq_profiles_username_normalized on profiles (username_normalized)
  where username_normalized is not null;

create unique index if not exists uniq_profiles_username on profiles (username)
  where username is not null;

create index if not exists idx_profiles_username_normalized_prefix on profiles (username_normalized text_pattern_ops);

-- Backfill usernames for existing rows
update profiles
set
  username = coalesce(
    username,
    'tjfit_' || substr(md5(id::text), 1, 20)
  ),
  username_normalized = coalesce(
    username_normalized,
    lower('tjfit_' || substr(md5(id::text), 1, 20))
  ),
  display_name = case
    when coalesce(display_name, '') = '' then split_part(email, '@', 1)
    else display_name
  end
where username is null or username_normalized is null;

-- Resolve rare collisions
update profiles p
set
  username = p.username || '_' || substr(replace(p.id::text, '-', ''), 1, 6),
  username_normalized = lower(p.username || '_' || substr(replace(p.id::text, '-', ''), 1, 6))
from (
  select username_normalized
  from profiles
  group by username_normalized
  having count(*) > 1
) d
where p.username_normalized = d.username_normalized;

alter table profiles alter column username set not null;
alter table profiles alter column username_normalized set not null;

-- ---------------------------------------------------------------------------
-- Message allowances (approved_only)
-- ---------------------------------------------------------------------------
create table if not exists message_allowances (
  id uuid primary key default gen_random_uuid(),
  granter_id uuid not null references auth.users (id) on delete cascade,
  grantee_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (granter_id, grantee_id)
);

create index if not exists idx_message_allowances_grantee on message_allowances (grantee_id);

alter table message_allowances enable row level security;

create policy "read own allowances as granter or grantee"
  on message_allowances for select
  using (auth.uid() = granter_id or auth.uid() = grantee_id);

create policy "insert allowance as granter"
  on message_allowances for insert
  with check (auth.uid() = granter_id);

create policy "delete own allowance as granter"
  on message_allowances for delete
  using (auth.uid() = granter_id);

-- ---------------------------------------------------------------------------
-- Conversations: direct threads (nullable coach_student_link_id)
-- ---------------------------------------------------------------------------
alter table conversations
  add column if not exists conversation_type text not null default 'coach_student'
    check (conversation_type in ('coach_student', 'direct'));

alter table conversations alter column coach_student_link_id drop not null;

alter table conversations drop constraint if exists conversations_type_link_check;

alter table conversations
  add constraint conversations_type_link_check check (
    (conversation_type = 'coach_student' and coach_student_link_id is not null)
    or (conversation_type = 'direct' and coach_student_link_id is null)
  );

create index if not exists idx_conversations_type on conversations (conversation_type);

-- ---------------------------------------------------------------------------
-- RLS: conversations — participant-based read (coach + direct)
-- ---------------------------------------------------------------------------
drop policy if exists "Participants can read conversations" on conversations;

create policy "Participants can read conversations"
  on conversations for select
  using (
    exists (
      select 1
      from conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
  );

-- Coach/student can create coach_student conversation
create policy "Members insert coach_student conversation"
  on conversations for insert
  with check (
    conversation_type = 'coach_student'
    and coach_student_link_id is not null
    and exists (
      select 1
      from coach_student_links csl
      where csl.id = coach_student_link_id
        and csl.status = 'active'
        and (auth.uid() = csl.coach_id or auth.uid() = csl.student_id)
    )
  );

-- ---------------------------------------------------------------------------
-- RLS: conversation_participants — inserts for coach threads + self
-- ---------------------------------------------------------------------------
create policy "Insert self as participant"
  on conversation_participants for insert
  with check (user_id = auth.uid());

create policy "Coach student link peer insert"
  on conversation_participants for insert
  with check (
    exists (
      select 1
      from conversations c
      join coach_student_links csl on csl.id = c.coach_student_link_id
      where c.id = conversation_participants.conversation_id
        and c.conversation_type = 'coach_student'
        and csl.status = 'active'
        and (
          (auth.uid() = csl.coach_id and user_id = csl.student_id)
          or (auth.uid() = csl.student_id and user_id = csl.coach_id)
        )
    )
  );

-- ---------------------------------------------------------------------------
-- Functions: messaging rules + direct conversation
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

  if pol = 'staff_only' then
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

  insert into conversations (conversation_type, coach_student_link_id)
  values ('direct', null)
  returning id into cid;

  insert into conversation_participants (conversation_id, user_id, encrypted_conversation_key)
  values
    (cid, me, initiator_wrapped_key),
    (cid, peer_id, peer_wrapped_key);

  return cid;
end;
$$;

grant execute on function public.create_direct_conversation(uuid, text, text) to authenticated;

create or replace function public.search_profiles(search_query text, result_limit int default 24)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio_preview text,
  account_visibility text
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
      when p.account_visibility = 'public' then left(p.bio, 200)
      else ''
    end as bio_preview,
    p.account_visibility
  from profiles p
  where auth.uid() is not null
    and p.id <> auth.uid()
    and p.searchable = true
    and (
      p.username_normalized like lower(trim(search_query)) || '%'
      or coalesce(p.display_name, '') ilike '%' || trim(search_query) || '%'
    )
  order by p.username_normalized asc
  limit coalesce(nullif(result_limit, 0), 24);
$$;

grant execute on function public.search_profiles(text, int) to authenticated;

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
      'account_visibility', v.account_visibility,
      'searchable', v.searchable,
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
      'bio', case when v.account_visibility = 'public' then v.bio else '' end,
      'account_visibility', v.account_visibility,
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
    'bio', case when v.account_visibility = 'public' then v.bio else '' end,
    'account_visibility', v.account_visibility,
    'limited', v.account_visibility = 'private',
    'can_message', can_msg,
    'role', case when v.role in ('coach', 'admin') then v.role else 'user' end
  );
end;
$$;

grant execute on function public.get_profile_card(text) to authenticated;
grant execute on function public.get_profile_card(text) to anon;

create or replace function public.list_my_conversations_with_peers()
returns table (
  conversation_id uuid,
  conv_created_at timestamptz,
  conversation_type text,
  peer_id uuid,
  peer_username text,
  peer_display_name text,
  peer_avatar_url text
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
    pr.avatar_url
  from conversations c
  join conversation_participants p1
    on p1.conversation_id = c.id and p1.user_id = auth.uid()
  join conversation_participants p2
    on p2.conversation_id = c.id and p2.user_id <> auth.uid()
  join profiles pr on pr.id = p2.user_id
  order by c.created_at desc;
$$;

grant execute on function public.list_my_conversations_with_peers() to authenticated;

create or replace function public.get_conversation_peer(p_conversation_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id', pr.id,
    'username', pr.username,
    'display_name', coalesce(nullif(trim(pr.display_name), ''), pr.username),
    'avatar_url', pr.avatar_url,
    'conversation_type', c.conversation_type
  )
  from conversations c
  join conversation_participants p1
    on p1.conversation_id = c.id and p1.user_id = auth.uid()
  join conversation_participants p2
    on p2.conversation_id = c.id and p2.user_id <> auth.uid()
  join profiles pr on pr.id = p2.user_id
  where c.id = p_conversation_id
  limit 1;
$$;

grant execute on function public.get_conversation_peer(uuid) to authenticated;

-- Keep profiles updated_at fresh
create or replace function public.touch_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
before update on profiles
for each row execute function public.touch_profiles_updated_at();

-- Normalize username on write
create or replace function public.normalize_profile_username()
returns trigger
language plpgsql
as $$
begin
  if new.username is not null then
    new.username_normalized := lower(trim(new.username));
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_normalize_username on profiles;
create trigger profiles_normalize_username
before insert or update of username on profiles
for each row execute function public.normalize_profile_username();

-- ---------------------------------------------------------------------------
-- Profiles RLS: own read/update; optional read for conversation peers (safe subset via RPC only — search uses RPC)
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read own profile" on profiles;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users update own profile fields"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Signup trigger must populate username (NOT NULL)
create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text := 'tjfit_' || substr(md5(new.id::text), 1, 20);
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

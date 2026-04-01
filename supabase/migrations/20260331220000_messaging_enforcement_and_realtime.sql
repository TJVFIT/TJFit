-- Server-side messaging rules: enforce recipient message_privacy on every insert (not only at conversation creation).
-- Realtime: expose messages to postgres_changes (RLS still applies per subscriber).

-- ---------------------------------------------------------------------------
-- Shared: raise descriptive exception when sender may not message recipient
-- ---------------------------------------------------------------------------
create or replace function public.raise_if_messaging_blocked(sender_id uuid, recipient_id uuid)
returns void
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  pol text;
begin
  if public.messaging_allowed(sender_id, recipient_id) then
    return;
  end if;

  select message_privacy into pol from profiles where id = recipient_id;

  if pol = 'nobody' then
    raise exception 'MESSAGING_DISABLED' using errcode = 'P0001';
  elsif pol = 'coaches_only' then
    raise exception 'MESSAGING_COACHES_ONLY' using errcode = 'P0001';
  elsif pol = 'approved_only' then
    raise exception 'MESSAGING_REQUIRES_APPROVAL' using errcode = 'P0001';
  elsif pol = 'connections_only' then
    raise exception 'MESSAGING_CONNECTIONS_ONLY' using errcode = 'P0001';
  else
    raise exception 'MESSAGING_NOT_ALLOWED' using errcode = 'P0001';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Direct conversation: reuse same error codes as message send
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

  perform public.raise_if_messaging_blocked(me, peer_id);

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

grant execute on function public.create_direct_conversation(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- API helper: enforce privacy before creating coach/student threads from the app
-- ---------------------------------------------------------------------------
create or replace function public.assert_can_message_peer(peer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if peer_id = me then
    raise exception 'invalid peer';
  end if;
  perform public.raise_if_messaging_blocked(me, peer_id);
end;
$$;

grant execute on function public.assert_can_message_peer(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Before insert on messages: participant + privacy (2-party threads only)
-- ---------------------------------------------------------------------------
create or replace function public.messages_before_insert_enforce()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  peer uuid;
  n int;
begin
  if auth.uid() is not null and new.sender_id is distinct from auth.uid() then
    raise exception 'MESSAGING_SENDER_MISMATCH' using errcode = 'P0001';
  end if;

  select count(*)::int into n
  from conversation_participants
  where conversation_id = new.conversation_id;

  if n < 2 then
    raise exception 'MESSAGING_INVALID_CONVERSATION' using errcode = 'P0001';
  end if;

  if n > 2 then
    raise exception 'MESSAGING_UNSUPPORTED_GROUP' using errcode = 'P0001';
  end if;

  select cp.user_id into peer
  from conversation_participants cp
  where cp.conversation_id = new.conversation_id
    and cp.user_id <> new.sender_id
  limit 1;

  if peer is null then
    raise exception 'MESSAGING_PEER_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform public.raise_if_messaging_blocked(new.sender_id, peer);
  return new;
end;
$$;

drop trigger if exists messages_before_insert_enforce on messages;
create trigger messages_before_insert_enforce
before insert on messages
for each row execute function public.messages_before_insert_enforce();

-- ---------------------------------------------------------------------------
-- Realtime (Supabase): allow postgres_changes subscriptions; RLS filters rows
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
    ) then
      execute 'alter publication supabase_realtime add table public.messages';
    end if;
  end if;
end$$;

comment on table messages is 'E2E ciphertext; RLS + insert trigger enforce participant + recipient message_privacy. Subscribe via Realtime postgres_changes.';

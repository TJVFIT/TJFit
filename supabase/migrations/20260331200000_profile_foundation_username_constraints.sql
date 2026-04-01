-- Profile foundation: created_at, strict username format, uniqueness, DB validation (aligned with app).
-- Preserves rows; fixes legacy usernames longer than 20 chars (e.g. tjfit_ + md5).

-- ---------------------------------------------------------------------------
-- created_at
-- ---------------------------------------------------------------------------
alter table profiles add column if not exists created_at timestamptz;

update profiles
set created_at = coalesce(created_at, updated_at, now())
where created_at is null;

update profiles set created_at = now() where created_at is null;

alter table profiles alter column created_at set default now();
alter table profiles alter column created_at set not null;

-- ---------------------------------------------------------------------------
-- Normalize invalid legacy usernames to u + 19 hex chars (20 total, unique per id)
-- ---------------------------------------------------------------------------
update profiles
set
  username = 'u' || left(replace(id::text, '-', ''), 19),
  username_normalized = lower('u' || left(replace(id::text, '-', ''), 19))
where
  username !~ '^[a-zA-Z0-9_.]{3,20}$'
  or char_length(username) > 20
  or char_length(coalesce(username_normalized, '')) > 20;

-- Resolve any duplicate username_normalized (should be extremely rare)
do $$
declare
  dup_id uuid;
begin
  loop
    select p1.id into dup_id
    from profiles p1
    join profiles p2 on p1.username_normalized = p2.username_normalized and p1.id <> p2.id
    order by p1.created_at, p1.id
    limit 1;
    exit when dup_id is null;
    update profiles
    set
      username = 'u' || left(replace(id::text, '-', ''), 19),
      username_normalized = lower('u' || left(replace(id::text, '-', ''), 19))
    where id = dup_id;
  end loop;
end$$;

-- ---------------------------------------------------------------------------
-- Replace partial unique indexes with table constraints (username always NOT NULL)
-- ---------------------------------------------------------------------------
drop index if exists uniq_profiles_username_normalized;
drop index if exists uniq_profiles_username;

do $$
begin
  alter table profiles add constraint profiles_username_normalized_key unique (username_normalized);
exception
  when duplicate_object then null;
end$$;

do $$
begin
  alter table profiles add constraint profiles_username_key unique (username);
exception
  when duplicate_object then null;
end$$;

-- ---------------------------------------------------------------------------
-- Enforce format + normalized = lower(username)
-- ---------------------------------------------------------------------------
alter table profiles drop constraint if exists profiles_username_format_check;
alter table profiles drop constraint if exists profiles_username_normalized_match_check;

alter table profiles
  add constraint profiles_username_format_check check (username ~ '^[a-zA-Z0-9_.]{3,20}$');

alter table profiles
  add constraint profiles_username_normalized_match_check check (username_normalized = lower(username));

-- ---------------------------------------------------------------------------
-- Single trigger: validate + reserved list + set username_normalized
-- (replaces profiles_normalize_username + normalize_profile_username)
-- ---------------------------------------------------------------------------
drop trigger if exists profiles_normalize_username on profiles;
drop function if exists public.normalize_profile_username();

create or replace function public.profiles_username_enforce()
returns trigger
language plpgsql
as $$
declare
  t text;
  reserved text[] := array[
    'admin', 'support', 'tjfit', 'system', 'help', 'api', 'root', 'null', 'undefined', 'www', 'mail'
  ];
begin
  if tg_op = 'UPDATE' and new.username is not distinct from old.username then
    return new;
  end if;

  if new.username is null or trim(new.username) = '' then
    raise exception 'username_required' using errcode = '23514';
  end if;
  t := trim(new.username);
  if t !~ '^[a-zA-Z0-9_.]{3,20}$' then
    raise exception 'invalid_username_format' using errcode = '23514';
  end if;
  if lower(t) = any (reserved) then
    raise exception 'reserved_username' using errcode = '23514';
  end if;
  new.username := t;
  new.username_normalized := lower(t);
  return new;
end;
$$;

create trigger profiles_username_enforce
before insert or update of username on profiles
for each row execute function public.profiles_username_enforce();

-- ---------------------------------------------------------------------------
-- Profile card: expose timestamps to account owner
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
      'role', v.role,
      'created_at', to_jsonb(v.created_at),
      'updated_at', to_jsonb(v.updated_at)
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

grant execute on function public.get_profile_card(text) to authenticated;
grant execute on function public.get_profile_card(text) to anon;

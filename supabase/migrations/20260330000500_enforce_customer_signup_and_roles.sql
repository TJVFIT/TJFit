-- Ensure profiles email uniqueness for safer role promotion by email.
create unique index if not exists uniq_profiles_email on profiles (email);

-- On every auth signup, create a default profile as normal user.
create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, lower(coalesce(new.email, '')), 'user')
  on conflict (id) do update
    set email = excluded.email
  where public.profiles.role <> 'coach' and public.profiles.role <> 'admin';
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user_profile();

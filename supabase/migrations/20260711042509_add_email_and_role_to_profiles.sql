-- Migration: add_email_and_role_to_profiles
-- Version 20260711042509 — mirrors the migration already applied to project
-- tawearmezcvqlwgomktc. Adds email + role to profiles, keeps email in sync
-- with auth.users, and locks role/email so the client can't self-escalate.
-- Idempotent (safe to re-run).

-- add columns
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text not null default 'user';

-- constrain role to known values
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

-- backfill email for any existing rows from auth.users
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is distinct from u.email;

-- populate email at signup time too
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end; $$;

-- keep profiles.email in sync if the user's auth email changes
create or replace function public.handle_user_email_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email, updated_at = now() where id = new.id;
  end if;
  return new;
end; $$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_update();

-- prevent self-escalation: the existing "update own" RLS policy governs which
-- ROW a user can touch, not which COLUMN — without this, a signed-in user
-- could PATCH their own profile row and set role='admin'. Restrict the
-- authenticated role's UPDATE grant to only the fields the client should
-- ever change; email/role become read-only from the client's perspective.
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, updated_at) on public.profiles to authenticated;

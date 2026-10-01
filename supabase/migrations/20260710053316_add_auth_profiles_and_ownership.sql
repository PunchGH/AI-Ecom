-- Migration: add_auth_profiles_and_ownership
-- Version 20260710053316 — mirrors the migration already applied to project
-- tawearmezcvqlwgomktc. Adds per-user profiles, ownership on trend_searches,
-- and an avatars storage bucket. Idempotent (safe to re-run).

-- profiles: one row per auth user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- auto-create a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ownership on trend_searches
alter table public.trend_searches add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- replace the flagged permissive policies with owner-scoped ones
drop policy if exists "public read trend_searches" on public.trend_searches;
drop policy if exists "public insert trend_searches" on public.trend_searches;
drop policy if exists "trend_searches: select own" on public.trend_searches;
create policy "trend_searches: select own" on public.trend_searches for select to authenticated using (auth.uid() = user_id);
drop policy if exists "trend_searches: insert own" on public.trend_searches;
create policy "trend_searches: insert own" on public.trend_searches for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "trend_searches: delete own" on public.trend_searches;
create policy "trend_searches: delete own" on public.trend_searches for delete to authenticated using (auth.uid() = user_id);

-- avatars storage bucket
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
drop policy if exists "avatars: public read" on storage.objects;
create policy "avatars: public read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars: owner insert" on storage.objects;
create policy "avatars: owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars: owner update" on storage.objects;
create policy "avatars: owner update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars: owner delete" on storage.objects;
create policy "avatars: owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

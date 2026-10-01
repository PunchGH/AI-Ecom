-- Migration: harden_avatars_and_handle_new_user
-- Version 20260711041321 — mirrors the migration already applied to project
-- tawearmezcvqlwgomktc. Resolves two security-advisor warnings introduced by
-- the previous auth/profiles migration. Idempotent (safe to re-run).

-- Public buckets serve objects via a dedicated public URL endpoint that
-- bypasses RLS entirely, so this SELECT policy was redundant and only
-- served to let anyone list every file in the bucket.
drop policy if exists "avatars: public read" on storage.objects;

-- This trigger function should only ever run via the AFTER INSERT trigger
-- on auth.users, never called directly through the PostgREST RPC endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

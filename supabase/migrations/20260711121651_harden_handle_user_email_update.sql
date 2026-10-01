-- Migration: harden_handle_user_email_update
-- Version 20260711121651 — mirrors the migration already applied to project
-- tawearmezcvqlwgomktc. This trigger function should only ever run via the
-- AFTER UPDATE OF email trigger on auth.users, never called directly through
-- the PostgREST RPC endpoint. Matches the hardening already applied to
-- handle_new_user() in harden_avatars_and_handle_new_user.sql. Idempotent.

revoke execute on function public.handle_user_email_update() from public, anon, authenticated;

-- Migration: add_trend_type_to_trend_searches
-- Version 20260711045837 — mirrors the migration already applied to project
-- tawearmezcvqlwgomktc. Nullable; computed server-side by the trends edge
-- function going forward. Idempotent (safe to re-run).

alter table public.trend_searches add column if not exists trend_type text;

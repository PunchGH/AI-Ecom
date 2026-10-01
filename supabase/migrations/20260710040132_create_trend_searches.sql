-- Migration: create_trend_searches
-- Version 20260710040132 — mirrors the migration already applied to project
-- tawearmezcvqlwgomktc. Idempotent, so re-applying against the live DB is a no-op.

create table if not exists public.trend_searches (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  interest_over_time jsonb,
  interest_by_region jsonb,
  related_queries jsonb,
  related_topics jsonb,
  avg_interest numeric,
  peak_interest integer,
  created_at timestamptz not null default now()
);

create index if not exists trend_searches_keyword_idx on public.trend_searches (keyword);
create index if not exists trend_searches_created_at_idx on public.trend_searches (created_at desc);

alter table public.trend_searches enable row level security;

drop policy if exists "public read trend_searches" on public.trend_searches;
create policy "public read trend_searches"
  on public.trend_searches for select
  to anon, authenticated
  using (true);

drop policy if exists "public insert trend_searches" on public.trend_searches;
create policy "public insert trend_searches"
  on public.trend_searches for insert
  to anon, authenticated
  with check (true);

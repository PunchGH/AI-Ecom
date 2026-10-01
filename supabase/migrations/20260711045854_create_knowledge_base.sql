-- Migration: create_knowledge_base
-- Version 20260711045854 — mirrors the migration already applied to project
-- tawearmezcvqlwgomktc. A small, admin-managed reference table the AI
-- assistant draws on. Read-only from the client (no insert/update/delete
-- grants to anon/authenticated), matching the profiles.role/email lockdown
-- pattern. Idempotent (safe to re-run).

create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  topic text not null unique,
  content text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.knowledge_base enable row level security;
drop policy if exists "public read knowledge_base" on public.knowledge_base;
create policy "public read knowledge_base" on public.knowledge_base
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.knowledge_base from anon, authenticated;

insert into public.knowledge_base (topic, content, sort_order) values
  ('evergreen-explained', 'Evergreen products (e.g. bikes, shaving machines) hold fairly steady Google Trends interest all year — no big seasonal swing. Safe to source and stock any time.', 10),
  ('seasonal-explained', 'Seasonal products (e.g. Santa hats) stay low most of the year and spike sharply around a specific date. Source well ahead of the spike; demand outside that window is minimal.', 20),
  ('trending-explained', 'Trending products show a strong sustained rise in interest without a seasonal spike shape — could be an emerging fad. Higher upside, but less proven than evergreen demand.', 30),
  ('declining-explained', 'Declining products show a strong sustained drop in interest. Treat as a warning sign before committing inventory.', 40),
  ('volatile-explained', 'Volatile products don''t fit a clean evergreen/seasonal/trending/declining pattern — interest is noisy without one dominant story. Read with extra caution.', 50),
  ('reading-momentum', 'Momentum compares the average interest of the most recent quarter of the 12-month window to the first quarter, as a signed percentage.', 60),
  ('reading-interest-scale', 'Google Trends interest is a 0-100 relative popularity index for a keyword and time range — it is not absolute search volume or sales.', 70),
  ('reading-regions', 'Interest-by-region shows where a keyword is relatively most searched, useful for prioritizing which market to target first.', 80),
  ('sourcing-timing-tip', 'Seasonal products need lead time before their peak; evergreen products can be sourced anytime; trending products carry more fad risk and shorter windows to capitalize.', 90),
  ('compare-tip', 'Use Compare to run up to 5 products side by side and see which has the strongest momentum, highest average interest, or most favorable trend type before committing.', 100)
on conflict (topic) do nothing;

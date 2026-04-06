-- ================================
-- Migration: 00001_create_exams
-- ================================

create extension if not exists "uuid-ossp";

create table if not exists exams (
  id          uuid primary key default gen_random_uuid(),
  level       text not null check (level in ('N1','N2','N3','N4','N5')),
  year        integer not null check (year >= 2010 and year <= 2030),
  month       text not null check (month in ('july','december')),
  status      text not null default 'draft'
                check (status in ('draft','published','archived')),
  source_json jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (level, year, month)
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger exams_updated_at
  before update on exams
  for each row execute function update_updated_at();

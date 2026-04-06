-- ================================
-- Migration: 00002_create_sections
-- ================================

create table if not exists sections (
  id           uuid primary key default uuid_generate_v4(),
  exam_id      uuid not null references exams(id) on delete cascade,
  type         text not null check (type in ('vocabulary','grammar_reading','listening')),
  time_limit   integer not null check (time_limit > 0),
  instructions text,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_sections_exam_id on sections(exam_id);

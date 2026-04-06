-- ================================
-- Migration: 00004_create_questions
-- ================================

create table if not exists questions (
  id              uuid primary key default gen_random_uuid(),
  group_id        uuid not null references question_groups(id) on delete cascade,
  question_number integer not null,
  question_text   text not null,
  underline_word  text,           -- for vocab reading questions
  options         jsonb not null, -- [{number: 1, text: "..."}, ...]
  correct_answer  integer not null check (correct_answer between 1 and 4),
  explanation     text,           -- shown in review mode
  order_index     integer not null default 0,
  created_at      timestamptz not null default now()
);

create index idx_questions_group_id on questions(group_id);
create index idx_questions_number on questions(question_number);

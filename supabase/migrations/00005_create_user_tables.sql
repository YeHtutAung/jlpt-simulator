-- ================================
-- Migration: 00005_create_user_tables
-- ================================

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Student',
  role         text not null default 'user' check (role in ('user','admin')),
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Exam attempts
create table if not exists attempts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  exam_id      uuid not null references exams(id) on delete cascade,
  mode         text not null check (mode in ('full_exam','practice')),
  status       text not null default 'in_progress'
                 check (status in ('in_progress','completed','abandoned')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  score_json   jsonb,
  created_at   timestamptz not null default now()
);

create index idx_attempts_user_id on attempts(user_id);
create index idx_attempts_exam_id on attempts(exam_id);
create index idx_attempts_status on attempts(status);

-- User answers
create table if not exists user_answers (
  id              uuid primary key default uuid_generate_v4(),
  attempt_id      uuid not null references attempts(id) on delete cascade,
  question_id     uuid not null references questions(id) on delete cascade,
  selected_option integer check (selected_option between 1 and 4),
  is_correct      boolean,
  time_spent      integer default 0,  -- seconds
  flagged         boolean default false,
  answered_at     timestamptz default now(),

  unique (attempt_id, question_id)
);

create index idx_user_answers_attempt_id on user_answers(attempt_id);
create index idx_user_answers_question_id on user_answers(question_id);

-- ================================
-- Migration: 00006_rls_policies
-- Row Level Security for all tables
-- ================================

alter table exams            enable row level security;
alter table sections         enable row level security;
alter table question_groups  enable row level security;
alter table questions        enable row level security;
alter table profiles         enable row level security;
alter table attempts         enable row level security;
alter table user_answers     enable row level security;

-- ── Helper: is current user an admin ──────────────────────

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ── exams ─────────────────────────────────────────────────

-- Anyone can read published exams
create policy "exams_select_published"
  on exams for select
  using (status = 'published');

-- Admins can read all exams
create policy "exams_select_admin"
  on exams for select
  using (is_admin());

-- Only admins can insert/update/delete
create policy "exams_insert_admin"
  on exams for insert
  with check (is_admin());

create policy "exams_update_admin"
  on exams for update
  using (is_admin());

create policy "exams_delete_admin"
  on exams for delete
  using (is_admin());

-- ── sections ──────────────────────────────────────────────

create policy "sections_select_all"
  on sections for select
  using (
    exists (
      select 1 from exams
      where exams.id = sections.exam_id
        and (exams.status = 'published' or is_admin())
    )
  );

create policy "sections_write_admin"
  on sections for all
  using (is_admin())
  with check (is_admin());

-- ── question_groups ───────────────────────────────────────

create policy "question_groups_select_all"
  on question_groups for select
  using (
    exists (
      select 1 from sections
      join exams on exams.id = sections.exam_id
      where sections.id = question_groups.section_id
        and (exams.status = 'published' or is_admin())
    )
  );

create policy "question_groups_write_admin"
  on question_groups for all
  using (is_admin())
  with check (is_admin());

-- ── questions ─────────────────────────────────────────────
-- IMPORTANT: correct_answer is NOT exposed via RLS to regular users
-- Scoring is done server-side via Edge Function

create policy "questions_select_no_answer"
  on questions for select
  using (
    exists (
      select 1 from question_groups
      join sections on sections.id = question_groups.section_id
      join exams on exams.id = sections.exam_id
      where question_groups.id = questions.group_id
        and (exams.status = 'published' or is_admin())
    )
  );

create policy "questions_write_admin"
  on questions for all
  using (is_admin())
  with check (is_admin());

-- ── profiles ──────────────────────────────────────────────

-- Users can only read/update their own profile
create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id or is_admin());

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can see all
create policy "profiles_admin_all"
  on profiles for all
  using (is_admin());

-- ── attempts ──────────────────────────────────────────────

create policy "attempts_select_own"
  on attempts for select
  using (auth.uid() = user_id or is_admin());

create policy "attempts_insert_own"
  on attempts for insert
  with check (auth.uid() = user_id);

create policy "attempts_update_own"
  on attempts for update
  using (auth.uid() = user_id);

-- ── user_answers ──────────────────────────────────────────

create policy "user_answers_select_own"
  on user_answers for select
  using (
    exists (
      select 1 from attempts
      where attempts.id = user_answers.attempt_id
        and (attempts.user_id = auth.uid() or is_admin())
    )
  );

create policy "user_answers_insert_own"
  on user_answers for insert
  with check (
    exists (
      select 1 from attempts
      where attempts.id = user_answers.attempt_id
        and attempts.user_id = auth.uid()
    )
  );

create policy "user_answers_update_own"
  on user_answers for update
  using (
    exists (
      select 1 from attempts
      where attempts.id = user_answers.attempt_id
        and attempts.user_id = auth.uid()
    )
  );

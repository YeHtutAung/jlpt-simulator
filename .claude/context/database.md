# Database Context

## Clients
`packages/web/src/lib/supabase.ts` | `packages/admin/src/lib/supabase.ts`
Generated types: `supabase/types.ts` — regenerate after every migration: `npm run db:types`

## Schema
```
exams → sections → question_groups → questions
auth.users → profiles → attempts → user_answers → questions
```

## Tables

### exams
| col | type | notes |
|---|---|---|
| id | uuid PK | |
| level | text | N1–N5 |
| year | int | 2010–2030 |
| month | text | july/december |
| status | text | draft/published/archived |
| source_json | jsonb | full exam JSON backup |
| created_at/updated_at | timestamptz | |
Unique: (level, year, month)

### sections
id uuid PK | exam_id FK | type text (vocabulary/grammar_reading/listening) | time_limit int (minutes) | instructions text? | order_index int

### question_groups
id uuid PK | section_id FK | group_key text (e.g. n5-2017-v-g1) | group_type text | instructions text? | passage_text text? | image_type text (svg/storage/none) | image_data text | image_alt text | audio_url text | order_index int

### questions
id uuid PK | group_id FK | question_number int | question_text text | underline_word text? | options jsonb ([{number:1,text:"…"}]) | correct_answer int (1–4) | explanation text? | order_index int | image_type text? | image_data text? | image_alt text? | image_position text? DEFAULT 'above' (above/below/side_by_side)

### profiles
id uuid PK→auth.users | display_name text | role text (user/admin) | avatar_url text?
Auto-created on signup via trigger `handle_new_user`

### attempts
id uuid PK | user_id FK→profiles | exam_id FK→exams | mode text (full_exam/practice) | status text (in_progress/completed/abandoned) | started_at timestamptz | completed_at timestamptz? | score_json jsonb?

score_json: `{total_correct, total_questions, total_percentage, sections:[{section_type, correct, total, percentage, time_spent}], completed_at}`

### user_answers
id uuid PK | attempt_id FK | question_id FK | selected_option int? (1–4, null=skipped) | is_correct bool | time_spent int (seconds) | flagged bool
Unique: (attempt_id, question_id)

## ⚠️ correct_answer never exposed to client during active exam — Edge Function scores server-side

## RLS
exams/sections/question_groups/questions: SELECT all (published), INSERT/UPDATE/DELETE admin
questions: correct_answer hidden from users during exam
profiles: SELECT/UPDATE own row; admin sees all
attempts/user_answers: SELECT/INSERT/UPDATE own rows only

## Storage
`audio/{level}/{year}/{month}/*.mp3` | `images/{level}/{year}/{month}/*.png`

## Migrations (all applied ✅)
00001 create_exams | 00002 create_sections | 00003 create_question_groups | 00004 create_questions | 00005 create_user_tables | 00006 rls_policies | 00007 storage_buckets | 00008 fix_profiles_insert | 00009 fix_trigger_search_path | 00008 questions_image (applied via db query --linked)

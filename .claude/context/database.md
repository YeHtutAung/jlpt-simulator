# Database Context

---

## Connection

- **Client file:** `packages/web/src/lib/supabase.ts`
- **Admin client:** `packages/admin/src/lib/supabase.ts`
- **Generated types:** `supabase/types.ts`
  - Regenerate after every migration: `npm run db:types`

---

## Schema Overview

```
exams
  └── sections (1:many)
        └── question_groups (1:many)
              └── questions (1:many)

auth.users
  └── profiles (1:1)
        └── attempts (1:many)
              └── user_answers (1:many)
                    └── questions (many:1)
```

---

## Table Details

### exams
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| level | text | N1/N2/N3/N4/N5 |
| year | integer | 2010–2030 |
| month | text | july/december |
| status | text | draft/published/archived |
| source_json | jsonb | Full exam JSON backup |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-updated |

Unique constraint: (level, year, month)

### sections
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| exam_id | uuid | FK → exams |
| type | text | vocabulary/grammar_reading/listening |
| time_limit | integer | minutes |
| instructions | text | nullable |
| order_index | integer | display order |

### question_groups
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| section_id | uuid | FK → sections |
| group_key | text | e.g. "n5-2017-v-g1" |
| group_type | text | see QuestionGroupType |
| instructions | text | nullable |
| passage_text | text | nullable, reading passages |
| image_type | text | svg/storage/none |
| image_data | text | SVG string OR storage URL |
| image_alt | text | accessibility |
| audio_url | text | Supabase storage URL |
| order_index | integer | |

### questions
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| group_id | uuid | FK → question_groups |
| question_number | integer | official question number |
| question_text | text | |
| underline_word | text | nullable, for vocab section |
| options | jsonb | [{number:1, text:"..."}, ...] |
| correct_answer | integer | 1–4 |
| explanation | text | nullable, for review mode |
| order_index | integer | |

### profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, FK → auth.users |
| display_name | text | |
| role | text | user/admin |
| avatar_url | text | nullable |

Auto-created on signup via trigger `on_auth_user_created`

### attempts
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| exam_id | uuid | FK → exams |
| mode | text | full_exam/practice |
| status | text | in_progress/completed/abandoned |
| started_at | timestamptz | |
| completed_at | timestamptz | nullable |
| score_json | jsonb | nullable until completed |

score_json structure:
```json
{
  "total_correct": 25,
  "total_questions": 33,
  "total_percentage": 76,
  "sections": [
    {
      "section_type": "vocabulary",
      "correct": 10,
      "total": 13,
      "percentage": 77,
      "time_spent": 890
    }
  ],
  "completed_at": "2024-01-15T10:30:00Z"
}
```

### user_answers
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| attempt_id | uuid | FK → attempts |
| question_id | uuid | FK → questions |
| selected_option | integer | 1–4, nullable if skipped |
| is_correct | boolean | |
| time_spent | integer | seconds on this question |
| flagged | boolean | user flagged for review |

Unique constraint: (attempt_id, question_id)

---

## RLS Policies (00006 migration — not yet applied)

```
exams:          SELECT for all (published only), INSERT/UPDATE/DELETE for admin
sections:       SELECT for all, INSERT/UPDATE/DELETE for admin
question_groups: SELECT for all, INSERT/UPDATE/DELETE for admin
questions:      SELECT for all (no correct_answer exposed to users!), admin sees all
profiles:       SELECT/UPDATE own row only, admin sees all
attempts:       SELECT/INSERT/UPDATE own rows only
user_answers:   SELECT/INSERT/UPDATE own rows only
```

⚠️ IMPORTANT: `correct_answer` in questions table must NOT be
exposed in the public API during an active exam.
Use an Edge Function for scoring instead.

---

## Storage Buckets (00007 migration — not yet applied)

```
audio/
  └── {level}/{year}/{month}/{filename}.mp3
      e.g. audio/n5/2017/december/listening_q1.mp3

images/
  └── {level}/{year}/{month}/{filename}.png
      e.g. images/n5/2017/december/scene_q5.png
```

---

## Migration State

| Migration | Status |
|---|---|
| 00001_create_exams | ✅ Written |
| 00002_create_sections | ✅ Written |
| 00003_create_question_groups | ✅ Written |
| 00004_create_questions | ✅ Written |
| 00005_create_user_tables | ✅ Written |
| 00006_rls_policies | ⏳ TODO |
| 00007_storage_buckets | ⏳ TODO |

Applied to local: ❌ Not yet (Supabase not initialized)
Applied to production: ❌ Not yet

# Decision 001 — Database Schema Design

**Date:** Session 1
**Status:** Finalized

---

## Decision

Use a normalized relational schema with 6 core tables:
`exams → sections → question_groups → questions`
plus `profiles → attempts → user_answers`

---

## Why question_groups exists

JLPT questions don't always stand alone. Many share:
- A reading passage (reading comprehension)
- An audio clip (listening section)
- An image (picture-based questions)

`question_groups` is the container that holds shared context
for 1 or more questions.

## Why source_json is stored in exams table

Full exam JSON is stored as a jsonb backup in `exams.source_json`.
This means:
- Easy re-seeding if individual tables get corrupted
- Single source of truth for the original paper
- Can re-parse/re-import without the original PDF

## Why correct_answer is in questions table

Even though it's sensitive during active exams, storing it
server-side in the DB is correct. RLS + Edge Functions
prevent it from being exposed to clients during active sessions.
Scoring happens server-side only.

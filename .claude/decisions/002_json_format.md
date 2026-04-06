# Decision 002 — Exam JSON Format

**Date:** Session 1
**Status:** Finalized

---

## Decision

All exam papers are stored and transported as a single
standardized JSON object matching the `ExamSchema` Zod schema
defined in `packages/shared/src/schemas/exam.schema.ts`.

---

## Why a single JSON per exam

- One file per paper = easy to version, review, share
- Validated by Zod before import = no corrupt data
- Self-describing = includes meta, sections, groups, questions
- Portable = can seed any DB from the JSON alone

## JSON top-level structure

```json
{
  "meta": { "level", "year", "month", "status" },
  "sections": [
    {
      "type": "vocabulary|grammar_reading|listening",
      "time_limit": 25,
      "question_groups": [
        {
          "id": "n5-2017-v-g1",
          "type": "text_only|audio_with_image|...",
          "questions": [...]
        }
      ]
    }
  ]
}
```

## Adding new question types

When a new JLPT format introduces a new question type:
1. Add new value to `QuestionGroupType` in `exam.types.ts`
2. Add to Zod schema in `exam.schema.ts`
3. Add rendering logic in `ImageRenderer.tsx` or new component
4. Document in this file

DO NOT change existing type values — that breaks old data.

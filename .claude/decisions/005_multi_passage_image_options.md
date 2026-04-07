# D005 — Multi-Passage Groups + Image Options (S12, ✅ final)

## multi_passage group type
For もんだい4 (N5 grammar/reading): 3 short passages, 1 question each.
- Seed JSON: `type: "multi_passage"`, `passages: [{label, text, questions[]}]`
- DB: questions link to `group_passages` table via `passage_id` FK
- Edge fn: joins passage data into each question (`passage_text`, `passage_label`)
- Frontend: `QuestionCard` shows per-question passage via `PassageReader` (label + text)

## Image options (Option A)
For Q28 (room layout): 4 image options instead of text.
- `ExamOption.image_type?: ImageSourceType` + `image_data?: string`
- `options.text` defaults to `""` when image is provided (Zod schema relaxed from `min(1)` to `default("")`)
- `OptionButton`: renders `dangerouslySetInnerHTML` (DOMPurify) for `svg`, `<img>` for `storage`
- No DB migration needed — `options` column is already `jsonb`

## DB (migrations 00010, 00011)
```sql
-- 00010
CREATE TABLE group_passages (id, group_id FK, label, passage_text, order_index)
ALTER TABLE questions ADD COLUMN passage_id uuid FK → group_passages

-- 00011
ALTER TABLE question_groups ADD CONSTRAINT group_type CHECK (..., 'multi_passage', ...)
```

## Q28 correct_answer note
Original seed had correct_answer: 3 (1 chair, books on floor) — contradicts passage (いすが二つ).
Changed to correct_answer: 2 (2 chairs, books on floor) to match passage content.
Verify against real exam when available.

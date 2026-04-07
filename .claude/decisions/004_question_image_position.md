# D004 — Question-Level Image Position (S11, ✅ final)

## Two image levels
- Group: `question_groups.image_*` — shared across all questions in group ✅ (existing)
- Question: `questions.image_*` + `image_position` — per-question image with layout (S11)

## image_position values
`above` (default): image → text → options
`below`: text → image → options
`side_by_side`: text|image flex row on md+, stacks vertically on mobile (<md)

## Usage
N5 2017 Vocab Q27 — apple box SVG, `above`
N5 2017 Vocab Q28 — desk+glasses SVG, `above`

## DB (migration 00008_questions_image)
```sql
ADD COLUMN image_type text CHECK (IN ('svg','storage','none'))
ADD COLUMN image_data text
ADD COLUMN image_alt text
ADD COLUMN image_position text DEFAULT 'above' CHECK (IN ('above','below','side_by_side'))
```

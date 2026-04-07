# Decision 004 — Question-Level Image Position

**Date:** Session 11
**Status:** Finalized

---

## Context

Some JLPT questions (not question groups) have their own images — e.g. N5 2017 Vocab Q27 (apple box) and Q28 (desk scene). These images need to appear at a specific position relative to the question text and options.

---

## Decision

Images exist at **two levels**:

1. **Group level** (`question_groups.image_*`) — shared image for all questions in the group (already implemented)
2. **Question level** (`questions.image_*`) — image belonging to a single question, with a layout position

---

## Question-level `image_position` values

| Value | Layout |
|---|---|
| `above` | image → question text → options (default) |
| `below` | question text → image → options |
| `side_by_side` | question text \| image (50/50 on md+), options full-width below |

**`side_by_side` mobile behaviour:** at ≤ 375px (or any `< md` breakpoint) the layout stacks vertically — image below question text, options below that.

---

## Current usage

| Question | Image | Position |
|---|---|---|
| N5 2017 Vocab Q27 | Box containing 6 apples | `above` |
| N5 2017 Vocab Q28 | Desk with glasses on top, bag underneath, chair beside | `above` |

---

## Database columns added (migration 00008)

```sql
ALTER TABLE questions
  ADD COLUMN image_type     text CHECK (image_type IN ('svg','storage','none')),
  ADD COLUMN image_data     text,
  ADD COLUMN image_alt      text,
  ADD COLUMN image_position text
    DEFAULT 'above'
    CHECK (image_position IN ('above','below','side_by_side'));
```

---

## Rationale

- Mirrors the same `image_type / image_data / image_alt` pattern already used at group level — no new concepts introduced
- `image_position` defaults to `above` so existing question rows (NULL) behave correctly
- `side_by_side` is CSS-only (flexbox), no JS needed

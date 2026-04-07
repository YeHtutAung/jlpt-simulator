-- Migration 00008: Add question-level image columns
-- Questions can have their own image (separate from group-level image)
-- with a position relative to the question text.

ALTER TABLE questions
  ADD COLUMN image_type     text
    CHECK (image_type IN ('svg', 'storage', 'none')),
  ADD COLUMN image_data     text,
  ADD COLUMN image_alt      text,
  ADD COLUMN image_position text
    DEFAULT 'above'
    CHECK (image_position IN ('above', 'below', 'side_by_side'));

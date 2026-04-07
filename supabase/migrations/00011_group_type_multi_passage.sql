-- Migration 00011: add multi_passage to group_type check constraint
ALTER TABLE question_groups DROP CONSTRAINT IF EXISTS question_groups_group_type_check;
ALTER TABLE question_groups ADD CONSTRAINT question_groups_group_type_check
  CHECK (group_type IN (
    'text_only',
    'text_with_passage',
    'multi_passage',
    'text_with_image',
    'audio_only',
    'audio_with_image',
    'audio_with_text',
    'sentence_order',
    'fill_in_blank'
  ));

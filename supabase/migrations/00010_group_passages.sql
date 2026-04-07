-- Migration 00010: group_passages table + passage_id on questions
-- Supports multi_passage question groups (e.g. もんだい4 in grammar/reading)

CREATE TABLE group_passages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     uuid NOT NULL REFERENCES question_groups(id) ON DELETE CASCADE,
  label        text,
  passage_text text NOT NULL,
  order_index  int  NOT NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX group_passages_group_id_idx ON group_passages(group_id, order_index);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage_id uuid REFERENCES group_passages(id);

-- RLS: same policy as question_groups (public read, admin write)
ALTER TABLE group_passages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_passages_select_published" ON group_passages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM question_groups qg
      JOIN sections s ON s.id = qg.section_id
      JOIN exams e ON e.id = s.exam_id
      WHERE qg.id = group_passages.group_id
        AND e.status = 'published'
    )
  );

CREATE POLICY "group_passages_admin_all" ON group_passages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

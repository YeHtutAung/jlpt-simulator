# D001 — Database Schema (S1, ✅ final)

- Normalized: `exams→sections→question_groups→questions` + `profiles→attempts→user_answers`
- `question_groups` = container for shared context (passage/audio/image) across 1+ questions
- `exams.source_json` = full JSON backup for re-seeding without original PDF
- `questions.correct_answer` stored server-side; RLS + Edge Functions prevent client exposure during active exam

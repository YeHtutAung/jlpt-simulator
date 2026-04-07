# D002 — Exam JSON Format (S1, ✅ final)

- Single JSON per exam matching `ExamSchema` Zod schema (`packages/shared/src/schemas/exam.schema.ts`)
- Structure: `{meta:{level,year,month,status}, sections:[{type,time_limit,question_groups:[{id,type,questions:[...]}]}]}`
- Validated by Zod on import — no corrupt data reaches DB

## Adding new question types
1. Add value to `QuestionGroupType` in `exam.types.ts`
2. Add to Zod schema in `exam.schema.ts`
3. Add rendering logic in new/existing component
⚠️ Never change existing type values — breaks old data

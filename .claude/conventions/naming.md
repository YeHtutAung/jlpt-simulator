# Naming Conventions

_Always check this before creating new files or variables._

---

## File Names

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase.tsx | `QuestionCard.tsx` |
| React pages | PascalCase.tsx | `ExamSession.tsx` |
| Hooks | camelCase.ts | `useTimer.ts` |
| Stores (Zustand) | camelCase.ts | `examStore.ts` |
| Utilities | camelCase.ts | `scoring.ts` |
| Types files | camelCase.types.ts | `exam.types.ts` |
| Schema files | camelCase.schema.ts | `exam.schema.ts` |
| Constants files | camelCase.ts | `levels.ts` |
| SQL migrations | NNNNN_description.sql | `00001_create_exams.sql` |

---

## TypeScript

| Type | Convention | Example |
|---|---|---|
| Interfaces | PascalCase | `ExamSection` |
| Type aliases | PascalCase | `QuestionGroupType` |
| Enums | PascalCase | `ExamMode` |
| Constants | UPPER_SNAKE_CASE | `MAX_TIMER_SECONDS` |
| Functions | camelCase | `calculateScore` |
| React components | PascalCase | `QuestionCard` |
| Hooks | useXxx | `useTimer` |
| Store files | xxxStore | `examStore` |

---

## Database

| Type | Convention | Example |
|---|---|---|
| Tables | snake_case plural | `question_groups` |
| Columns | snake_case | `created_at` |
| Foreign keys | {table}_id | `exam_id` |
| Indexes | idx_{table}_{column} | `idx_sections_exam_id` |
| Functions | snake_case | `handle_new_user` |
| Triggers | {table}_{event} | `exams_updated_at` |

---

## JSON / API

| Type | Convention | Example |
|---|---|---|
| JSON keys | snake_case | `correct_answer` |
| Group IDs | {level}-{year}-{section}-g{n} | `n5-2017-v-g1` |
| Audio paths | {level}/{year}/{month}/{file} | `n5/2017/december/q1.mp3` |
| Image paths | {level}/{year}/{month}/{file} | `n5/2017/december/q5.png` |

### Section abbreviations in IDs:
- `v` = vocabulary
- `gr` = grammar_reading
- `l` = listening

---

## CSS / Tailwind

- Use CSS variables for theme colors (defined in globals.css)
- Prefix custom classes with `jlpt-` if needed
- Component-specific styles go in component file (not globals)

---

## Git Commits

Format: `type(scope): description`

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

Examples:
```
feat(web): add timer component with warning state
fix(converter): handle missing audio mapping
docs(claude): update in_progress after session 2
chore(db): add migration 00006 rls policies
```

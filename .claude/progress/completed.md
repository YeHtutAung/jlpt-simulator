# Completed Work — S12

## ✅ S12 — Grammar/Reading multi_passage + image options
- `QuestionGroupType` — added `multi_passage` variant
- `ExamOption` — added `image_type?` + `image_data?` for image options (Option A)
- `ExamQuestion` — added `passage_text?` + `passage_label?` (populated by edge fn join)
- `GroupPassage` type + `GroupPassageSchema` — for seed JSON validation
- Migration 00010 — `group_passages` table + `passage_id` FK on `questions`
- Migration 00011 — added `multi_passage` to `group_type` check constraint
- `seed.ts` — handles `multi_passage` type: inserts passage rows, links questions via `passage_id`
- `n5_2017_december.json` — G4+G5+G6 → single `multi_passage` G4; G7→G5; G8→G6; Q28 grammar options → 4 SVG room layout diagrams
- `get-exam` edge fn — added image columns + `passage_id` to questions select; joins passage data into questions
- `PassageReader` — replaced `instructions` prop with `label?` (for multi_passage passage labels)
- `QuestionCard` — shows `question.passage_text`+`question.passage_label` for multi_passage questions
- `OptionButton` — renders SVG/img when `image_type`/`image_data` set on option
- db:verify 11/13 ✅ (2 pre-existing: N5 2019 audio + status)

# Completed Work — S11

## ✅ S11 — Section-by-section flow + question images
- `examStore` — `isSectionComplete` flag + `advanceSection()` action; `nextQuestion()` stops at section boundary in full_exam → modal; timer resets per section; `tickTimer()` advances section (not submit) for non-last sections
- `examStore` — `prevQuestion()` blocks cross-section nav in full_exam; within-section always allowed
- `examStore` — answer keys now `String(question.number)` (unique per exam) — was compound sIdx-gIdx-qIdx
- `ExamSession` — section-complete modal (answered/flagged count, no cancel in full_exam)
- `QuestionNav` — prev disabled only at section start in full_exam; "Finish Section" on non-last, "Submit Exam" on last
- `submit-exam` EdgeFn — CORS headers on all error responses (was missing → browser CORS error on any failure)
- `submit-exam` EdgeFn — answer lookup by `String(question_number)` not UUID (was always 0% score)
- D004 + `@jlpt/shared` — `ExamQuestion.image?` + `image_position?`; schema validates both
- Migration 00008 — `questions`: image_type/image_data/image_alt/image_position columns (applied via `db query --linked`)
- `QuestionCard` — `QuestionImage` helper renders at above/below/side_by_side slots
- `n5_2017_december.json` + DB — Q27 apple-box SVG, Q28 desk SVG added; reseeded ✅
- `seed.ts` — question insert writes all 4 image columns

## ✅ S10 — Submit fix + forgot password visibility
- `examStore.submitExam()` — sends `Authorization: Bearer` header; `isSubmitted` flag (true only on 200); re-throws errors
- `ExamSession` — navigates to results on `isSubmitted` (not `isComplete`); `useEffect` opens modal on `isComplete && !isSubmitted`
- `Results.tsx` — 3-way render: score / "still calculating"+Refresh / "not found"
- `Login.tsx` — forgot password link visible: right-aligned below password field + below Sign In button

## ✅ S9 — Password reset
- `ResetPassword.tsx` — listens for `PASSWORD_RECOVERY` event (3s timeout); states: waiting→expired/ready→success; calls `updateUser({password})`
- Router — `/reset-password` route (React.lazy, no auth guard)
- `DEPLOYMENT.md` — §1.5 Auth redirect URLs config

## ✅ S8 — Signup + auth UX
- `authStore.signUp` returns `{needsConfirmation}` — `Register.tsx` shows "Check email" or navigates to dashboard
- Login/Register — redirect authenticated users to `/` immediately
- Forgot password btn — inline on Login; calls `resetPasswordForEmail`; success screen
- Removed `VITE_ADMIN_SECRET` (never used; admin uses Supabase auth + `profiles.role='admin'`)

## ✅ S7 — CSS, dark mode, mobile, perf
- `postcss.config.cjs` — created for web + admin; Tailwind now processes in prod (CSS 1kB→14–26kB)
- Dark mode — `tailwind.config darkMode:'class'`; `.dark` CSS var block; `dark:` variants on Toast/ErrorBoundary/QuestionCard/OptionButton/QuestionNav/ReviewCard/Home/Results/Login/Register/Timer/Button
- ThemeToggle — sun/moon SVG in Navbar; wired to `uiStore.toggleTheme`
- Mobile 375px — Home filter `flex-col sm:flex-row`; Dashboard stats `grid-cols-1 sm:grid-cols-3`; QuestionNav buttons `flex-col sm:flex-row`; Navbar hamburger+dropdown
- Perf — `React.lazy`+Suspense on all 9 routes; `staleTime:Infinity` on 4 queries; `React.memo` on QuestionCard/OptionButton/QuestionNav/AudioPlayer/ProgressBar

## ✅ S6 — Live deployment
- `.env` filled; `db:types` fixed (`--project-id`); `tsconfig.seed.json` created (CommonJS for ts-node)
- Migrations — `uuid_generate_v4()` → `gen_random_uuid()` (PostgreSQL 15); types.ts generated
- 2 exams seeded: N5 2017 Dec (89q) + N5 2019 Jul (90q); db:verify 12/13 ✅
- Migrations 00008 (RLS profiles_insert) + 00009 (trigger search_path fix) applied
- Vercel web (`jlpt-simulator`) + admin (`jlpt-simulator-admin`) deployed via API; both live ✅

## ✅ S5 — Deployment docs + DX
- `DEPLOYMENT.md` — full guide: Supabase, Vercel web+admin, Storage, smoke tests, rollback
- `tools/verify-seed.ts` + `db:verify` script — checks table counts, statuses, correct_answers, audio_urls
- `ErrorBoundary.tsx` — wraps RouterProvider + ExamSession; dev-only error details
- `NotFound.tsx` — 四百四 kanji, bilingual, back link; router `*` catch-all → NotFound
- `Skeleton.tsx` — base + ExamCardSkeleton/DashboardSkeleton/AttemptRowSkeleton

## ✅ S4 — Fixes + N5 2019 seed
- Toast.tsx — `toast-enter` CSS class (no plugin); turbo.json `pipeline`→`tasks` (v2)
- tsconfig fixes — packages/shared, tools/converter, web/admin `types:["vite/client"]`
- TypeScript errors fixed across web/admin/shared/converter
- `n5_2019_july.json` — placeholder (33+32+25q, draft)
- README.md, Vercel configs, ESLint setup

## ✅ S3 — UI polish + admin auth
- `uiStore` — theme (persisted), sidebar, toast queue
- `Card.tsx` — 4 variants, header/footer slots
- `ExamSession` — keyboard nav 1–4/N/P/F, toasts
- `Toast.tsx` + `useToast` — success/error/info, 3s auto-dismiss
- Admin `adminStore` + `AuthGuard` — 4 states; checks `profiles.role='admin'`
- 30 converter tests (vitest)

## ✅ Foundation
- Monorepo (Turborepo+npm workspaces), root configs, `.env.example`, `.gitignore`
- `packages/shared` — exam.types/attempt.types/user.types, exam.schema, levels, scoring, index
- `supabase/migrations/` — 00001–00007 ✅
- `supabase/functions/` — submit-exam, get-exam, get-stats ✅
- `supabase/seed/` — n5_2017_december.json, seed.ts ✅
- `packages/web` — all config, pages, components, store, router ✅
- `packages/admin` — all config, pages, components, store ✅
- `tools/converter` — all extractors, parsers, generators, validators, tests ✅
- `.claude/` — all context, conventions, decisions, progress ✅

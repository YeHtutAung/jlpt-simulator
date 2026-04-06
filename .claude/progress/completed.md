# Completed Work

_Last updated: Session 6 (docs sync)_

---

## ✅ Session 6 — Deployment docs, seed verify, error boundary, 404, skeletons

- [x] `DEPLOYMENT.md` — full deployment guide: Supabase setup, Vercel web + admin, Storage, smoke tests, rollback
- [x] `tools/verify-seed.ts` — connects to Supabase, checks table counts, exam statuses, correct_answer validity, empty options, listening audio_url; prints pass/fail report
- [x] `package.json` — added `"db:verify": "ts-node tools/verify-seed.ts"` script
- [x] `packages/web/src/components/ui/ErrorBoundary.tsx` — React class error boundary, default fallback (エラー heading, Go home + Try again buttons), dev-only error details disclosure
- [x] `packages/web/src/App.tsx` — wrapped RouterProvider + ToastContainer with ErrorBoundary
- [x] `packages/web/src/router/index.tsx` — ExamSession wrapped in its own ErrorBoundary; `*` catch-all now renders NotFound instead of Navigate
- [x] `packages/web/src/pages/NotFound.tsx` — 四百四 decorative kanji, bilingual message, Back to home link
- [x] `packages/web/src/components/ui/Skeleton.tsx` — `Skeleton` base (animated pulse, rounded variants), `ExamCardSkeleton`, `DashboardSkeleton`, `AttemptRowSkeleton`
- [x] `packages/web/src/pages/Home.tsx` — loading state uses `ExamCardSkeleton` grid
- [x] `packages/web/src/pages/Dashboard.tsx` — loading state uses `DashboardSkeleton` (full-page skeleton replacing per-section pulse divs)

---

## ✅ Session 5 — Toast fix, type errors, N5 2019 seed, Vercel config, README

- [x] `packages/web/src/components/ui/Toast.tsx` — removed unused `useEffect` import, replaced `animate-in slide-in-from-right-4` with custom `toast-enter` CSS class
- [x] `packages/web/src/styles/globals.css` — added `@keyframes toast-slide-in` and `.toast-enter` class (Option B: no plugin needed)
- [x] `turbo.json` — renamed `pipeline` → `tasks` (Turborepo v2 breaking change)
- [x] `packages/shared/tsconfig.json` — created; was missing, causing tsc to crawl up and compile all packages
- [x] `tools/converter/tsconfig.json` — created; same root-crawl issue
- [x] `packages/web/tsconfig.json` + `packages/admin/tsconfig.json` — added `"types": ["vite/client"]` to fix `import.meta.env` errors
- [x] `packages/shared/src/utils/scoring.ts` — removed unused `UserAnswer` import
- [x] `packages/web/src/pages/ExamSession.tsx` — added `nextQuestion`/`prevQuestion` from store (were used but not destructured); added `toast` to `useCallback` deps
- [x] `packages/web/src/store/examStore.ts` — removed unused `mode` from `submitExam` destructure
- [x] `packages/web/src/pages/Dashboard.tsx` + `Results.tsx` — fixed Supabase join type assertions (cast through `unknown`)
- [x] `packages/web/src/pages/Review.tsx` — replaced `as any` with typed `RawQuestionRow` interface
- [x] `packages/web/package.json` + `.eslintrc.cjs` — added ESLint with `@typescript-eslint` + `react-hooks` plugins
- [x] `tools/converter/src/parsers/answerParser.ts` — `const map` → `let map` (was reassigned)
- [x] `tools/converter/src/extractors/pdfExtractor.ts` — added type annotation for `textContent` parameter
- [x] `tools/converter/src/parsers/grammarParser.ts` + `listeningParser.ts` — prefixed unused `groupType` param with `_`
- [x] `tools/converter/src/parsers/vocabularyParser.ts` — removed unused `OPTION_PATTERN` constant
- [x] `tools/converter/src/__tests__/vocabularyParser.test.ts` — removed unused `makeSectionText` helper
- [x] `supabase/seed/n5_2019_july.json` — N5 2019 July placeholder (33+32+25 questions, status: draft)
- [x] `vercel.json` (root) — project pointers for both deployments
- [x] `packages/web/vercel.json` + `packages/admin/vercel.json` — SPA rewrite + env var config
- [x] `README.md` — project overview, tech stack, getting started, converter workflow, deploy, scripts

---

## ✅ Session 4 — UI Polish, Admin Auth, Tests, Toasts

- [x] `packages/web/src/store/uiStore.ts` — theme persisted via `zustand/middleware persist`, sidebar open/close, toast queue with auto-dismiss timers
- [x] `packages/web/src/components/ui/Card.tsx` — 4 variants (default/elevated/bordered/flat), header/footer slots, padding sizes (sm/md/lg), clickable hover state
- [x] `packages/web/src/pages/ExamSession.tsx` — keyboard nav: 1-4 select option, N/→ next, P/← prev (practice only), F flag; hint bar in footer; toasts on submit/error
- [x] `packages/web/src/components/ui/Toast.tsx` + `useToast` hook — success/error/info, bottom-right, 3s auto-dismiss; wired into App.tsx root
- [x] `packages/admin/src/store/adminStore.ts` + `AuthGuard.tsx` — 4 auth states (loading → inline login form → access denied → app), checks `profiles.role = 'admin'`
- [x] `tools/converter/src/__tests__/` — 30 test cases across answerParser (10), jsonValidator (12), vocabularyParser (8) using vitest

---

## ✅ Project Foundation

- [x] Monorepo structure created (Turborepo + npm workspaces)
- [x] Root `package.json` with all scripts
- [x] Root `turbo.json` pipeline config
- [x] Root `tsconfig.json`
- [x] `.env.example` with all required variables
- [x] `.gitignore`

---

## ✅ packages/shared

- [x] `package.json`
- [x] `src/types/exam.types.ts`
- [x] `src/types/attempt.types.ts`
- [x] `src/types/user.types.ts`
- [x] `src/schemas/exam.schema.ts` — options `.min(3).max(4)`
- [x] `src/constants/levels.ts`
- [x] `src/utils/scoring.ts`
- [x] `src/index.ts`

---

## ✅ supabase/migrations

- [x] `00001_create_exams.sql`
- [x] `00002_create_sections.sql`
- [x] `00003_create_question_groups.sql`
- [x] `00004_create_questions.sql`
- [x] `00005_create_user_tables.sql`
- [x] `00006_rls_policies.sql`
- [x] `00007_storage_buckets.sql`

---

## ✅ supabase/functions

- [x] `submit-exam/index.ts`
- [x] `get-exam/index.ts`
- [x] `get-stats/index.ts`

---

## ✅ supabase/seed

- [x] `n5_2017_december.json`
- [x] `seed.ts`

---

## ✅ packages/web

- [x] All config files (package.json, vite, tailwind, tsconfig)
- [x] `src/main.tsx`, `src/App.tsx` (with ToastContainer)
- [x] `src/lib/supabase.ts`
- [x] `src/router/index.tsx`
- [x] `src/store/examStore.ts`
- [x] `src/store/authStore.ts`
- [x] `src/store/uiStore.ts` — theme (persisted), sidebar, toasts
- [x] All pages (Home, Login, Register, ExamSelect, ExamSession, Results, Review, Dashboard)
- [x] `src/pages/ExamSession.tsx` — keyboard nav (1-4, N/→, P/←, F), toasts on submit
- [x] `src/components/ui/Button.tsx`
- [x] `src/components/ui/Card.tsx` — variants: default/elevated/bordered/flat, header/footer slots
- [x] `src/components/ui/Timer.tsx`
- [x] `src/components/ui/ProgressBar.tsx`
- [x] `src/components/ui/Modal.tsx`
- [x] `src/components/ui/Toast.tsx` — success/error/info, auto-dismiss, useToast hook
- [x] All exam components (QuestionCard, OptionButton, AudioPlayer, SvgRenderer, ImageRenderer, PassageReader, QuestionNav)
- [x] All results components (ScoreCircle, SectionBreakdown, ReviewCard)
- [x] `src/components/layout/Navbar.tsx`

---

## ✅ packages/admin

- [x] All config files (package.json, vite, tailwind, tsconfig, tsconfig.node)
- [x] `src/main.tsx`, `src/App.tsx` (with AuthGuard wrapping)
- [x] `src/lib/supabase.ts`
- [x] `src/store/adminStore.ts` — Zustand auth state (loading/unauthenticated/unauthorized/admin)
- [x] `src/components/AuthGuard.tsx` — inline login form + access denied screen
- [x] `src/components/AdminLayout.tsx`
- [x] `src/components/JsonUploader.tsx`
- [x] `src/components/QuestionPreview.tsx`
- [x] `src/components/AudioUploader.tsx`
- [x] `src/pages/Dashboard.tsx`
- [x] `src/pages/UploadExam.tsx`
- [x] `src/pages/ManageExams.tsx`

---

## ✅ tools/converter

- [x] `package.json` — added vitest devDependency
- [x] `src/index.ts`
- [x] `src/extractors/pdfExtractor.ts`
- [x] `src/extractors/audioMapper.ts`
- [x] `src/parsers/answerParser.ts`
- [x] `src/parsers/vocabularyParser.ts`
- [x] `src/parsers/grammarParser.ts`
- [x] `src/parsers/listeningParser.ts`
- [x] `src/generators/svgGenerator.ts`
- [x] `src/generators/jsonGenerator.ts`
- [x] `src/validators/jsonValidator.ts`
- [x] `src/__tests__/answerParser.test.ts`
- [x] `src/__tests__/jsonValidator.test.ts`
- [x] `src/__tests__/vocabularyParser.test.ts`

---

## ✅ .claude/ Memory System

- [x] All context, conventions, decisions, progress files

---

## ⏳ Not Yet Started

See `todo.md`

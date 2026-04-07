# Completed Work

_Last updated: Session 10 (exam results blank, forgot password visibility)_

---

## ✅ Session 10 — Exam results blank + forgot password visibility

- [x] **`examStore.ts` — Authorization header** — `submitExam()` now calls `supabase.auth.getSession()` and sends `Authorization: Bearer <token>` so the Edge Function can authenticate the request
- [x] **`examStore.ts` — `isSubmitted` flag** — new boolean, set to `true` only when Edge Function returns 200. Separates "reached end of questions" (`isComplete`) from "server confirmed submission" (`isSubmitted`)
- [x] **`examStore.ts` — error re-throw** — `submitExam()` now re-throws errors so `ExamSession` can show the error toast; `tickTimer` auto-submit uses `.catch` to handle re-thrown errors
- [x] **`ExamSession.tsx` — navigate on `isSubmitted`** — navigation to `/results/:attemptId` now requires `isSubmitted` (Edge Function success), not just `isComplete`. Prevents blank Results page when user clicks Next through all questions
- [x] **`ExamSession.tsx` — end-of-questions modal** — `useEffect` watches `isComplete && !isSubmitted`; opens submit modal automatically when user navigates through every question
- [x] **`Results.tsx` — null `score_json` state** — three-way render: full results (score exists) / "⏳ Results still being calculated" + Refresh button (attempt exists, score null) / "Results not found" (no attempt)
- [x] **`Login.tsx` — forgot password visibility** — moved from tiny inline label text to right-aligned link below the password input (`text-sm text-primary`); added second "Forgot your password?" link centered below the Sign In button for late-noticers

---

## ✅ Session 9 — Password reset page

- [x] **`ResetPassword.tsx`** — new page at `/reset-password`; listens for Supabase `PASSWORD_RECOVERY` auth event (3-second timeout); shows a two-field form (new password + confirm); calls `supabase.auth.updateUser({ password })`; four states: `waiting` (spinner) → `expired` (invalid/expired link) / `ready` (form) → `success`; matches Login/Register visual style
- [x] **Router** — `/reset-password` route added to `packages/web/src/router/index.tsx` with `React.lazy`, no auth guard
- [x] **`DEPLOYMENT.md`** — new section 1.5 "Configure Auth redirect URLs": documents Supabase Auth → URL Configuration, Site URL, and required Redirect URL entries (`/reset-password` prod + localhost); smoke tests updated with forgot-password + reset flow

---

## ✅ Session 8 — Signup fix, auth UX improvements, VITE_ADMIN_SECRET cleanup

- [x] **Signup email confirmation handling** — `authStore.signUp` now returns `{ needsConfirmation: boolean }` by checking `data.session`. `Register.tsx` shows "Check your email" screen instead of navigating to dashboard when confirmation is required; navigates to `/dashboard` directly when email confirmation is disabled
- [x] **Register.tsx logged-in redirect** — if user is already authenticated, renders `<Navigate to="/" replace />` immediately
- [x] **Login.tsx logged-in redirect** — same pattern; skips auth form for authenticated users
- [x] **Forgot password** — "Forgot password?" button inline next to Password label; calls `supabase.auth.resetPasswordForEmail`; shows "Check your email" success screen; validates email field is filled before submitting
- [x] **VITE_ADMIN_SECRET removed** — was never used in code (admin uses Supabase auth + `profiles.role = 'admin'`); removed from `.env.example`; notes removed from progress files

---

## ✅ Session 7 — CSS fix, dark mode, mobile responsiveness, performance

- [x] **CSS fix (both apps)** — `packages/web/postcss.config.cjs` + `packages/admin/postcss.config.cjs` created; Tailwind now processed in production on Vercel (CSS grew from ~1 kB → 14–26 kB)
- [x] **Dark mode** — `tailwind.config.ts`: `darkMode: 'class'`; `globals.css`: `.dark` CSS variable block; `dark:` variants added to:
  - `Toast.tsx` — type bg/border/text colors
  - `ErrorBoundary.tsx` — error details box
  - `QuestionCard.tsx` — flag button, explanation box
  - `OptionButton.tsx` — number badge fills (selected/correct/incorrect)
  - `QuestionNav.tsx` — legend color swatches
  - `ReviewCard.tsx` — card backgrounds
  - `Home.tsx` — LEVEL_COLORS badge variants
  - `Dashboard.tsx` — (uses semantic tokens, adapts automatically)
  - `Results.tsx` — pass/fail badge
  - `Login.tsx` + `Register.tsx` — error message background
  - `Timer.tsx` — warning state background
  - `Button.tsx` — focus ring offset color
- [x] **Dark mode toggle in Navbar** — `ThemeToggle` component added with sun/moon SVG icons; wired to `uiStore.toggleTheme`; visible in desktop nav and mobile dropdown ✅
- [x] **Mobile 375px** — Home filter bar `flex-col sm:flex-row`; Dashboard + DashboardSkeleton stats grid `grid-cols-1 sm:grid-cols-3`; Dashboard header + attempt rows `flex-col sm:flex-row`; QuestionNav nav buttons `flex-col sm:flex-row`; Navbar hamburger menu with mobile dropdown
- [x] **Performance** — all 9 page routes use `React.lazy` + `Suspense` with shared `PageLoader` fallback; `staleTime: Infinity` on 4 queries (exams, exam-meta, attempt-results, attempt-review); `React.memo` on QuestionCard, OptionButton, QuestionNav, AudioPlayer, ProgressBar
- [x] `packages/web/package.json` — added `"analyze": "vite build --mode analyze"` script

---

## ✅ Session 6 — Live deployment to Supabase + Vercel

- [x] `.env` — filled with real Supabase URL, anon key, service role key
- [x] `package.json` — fixed `db:types` to use `--project-id` (not `--local`); fixed `db:seed` + `db:verify` to use `ts-node -P tsconfig.seed.json`
- [x] `tsconfig.seed.json` — created at repo root with `module: CommonJS` to fix ts-node ESM resolution for seed/verify scripts
- [x] `supabase/migrations/` — replaced all `uuid_generate_v4()` → `gen_random_uuid()` across 5 migration files (PostgreSQL 15 compatibility)
- [x] `supabase/types.ts` — generated from remote schema via `npm run db:types`
- [x] Both exam seeds inserted: N5 2017 December (89q) + N5 2019 July (90q); `db:verify` 12/13 pass (1 known audio placeholder)
- [x] `supabase/migrations/00008_fix_profiles_insert.sql` — added `profiles_insert_own` RLS policy
- [x] `supabase/migrations/00009_fix_trigger_search_path.sql` — recreated `handle_new_user()` with `SET search_path = public`
- [x] `vercel.json` (root) — simplified to rewrites-only; build settings moved to Vercel project API
- [x] `packages/web/vercel.json` + `packages/admin/vercel.json` — removed `@secret` env references
- [x] Vercel `jlpt-simulator` project — deployed web app; build settings set via API (`turbo run build --filter=@jlpt/web`, output `packages/web/dist`)
- [x] Vercel `jlpt-simulator-admin` project — deployed admin panel; build settings set via API (`turbo run build --filter=@jlpt/admin`, output `packages/admin/dist`)

---

## ✅ Session 5 — Deployment docs, seed verify, error boundary, 404, skeletons

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

## ✅ Session 4 — Toast fix, type errors, N5 2019 seed, Vercel config, README

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

## ✅ Session 3 — UI Polish, Admin Auth, Tests, Toasts

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

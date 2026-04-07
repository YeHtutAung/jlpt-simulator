# Frontend Context

## Stack
React 18+TS+Vite+TailwindCSS | Zustand (exam/auth/ui state) | TanStack Query (server state) | React Router v6 | Supabase JS SDK

## Design Tokens (CSS vars in globals.css)
`--color-bg:#F7F3EE` `--color-surface:#FFF` `--color-border:#E8E0D5` `--color-text:#1A1A2E` `--color-text-muted:#6B6B7B` `--color-primary:#C41E3A` `--color-accent:#2B4A8B` `--color-success:#2D7D46` `--color-error:#C41E3A` `--color-warning:#D4860A`
Fonts: Noto Serif JP (headings) | DM Sans (body/UI) | Noto Sans JP (Japanese)
Dark mode: `tailwind.config darkMode:'class'` → `.dark` block in globals.css

## Routes
`/` Home | `/login` | `/register` | `/exam/:examId` ExamSelect | `/exam/:examId/session` ExamSession | `/results/:attemptId` | `/review/:attemptId` | `/dashboard` | `/reset-password`

## State
**examStore** — exam session: position, answers (keyed by String(question.number)), flagged, timeSpent, timer (per-section), isSectionComplete, isComplete, isSubmitted, mode, advanceSection()
**authStore** — user, signIn/signOut/signUp, initialize
**uiStore** — theme (persisted to localStorage), toasts

## Component Rendering by group_type
`text_only` → QuestionCard | `text_with_passage` → PassageReader+QuestionCard | `text_with_image` → ImageRenderer+QuestionCard | `audio_only` → AudioPlayer+QuestionCard | `audio_with_image` → AudioPlayer+ImageRenderer | `audio_with_text` → AudioPlayer+QuestionCard | `sentence_order/fill_in_blank` → QuestionCard (special layout)

## Image Rendering
`image.source='svg'` → ImageRenderer (dangerouslySetInnerHTML + DOMPurify)
`image.source='storage'` → `<img src={image.storage_url} />`
Group-level: question_groups.image_* | Question-level: questions.image_* + image_position (above/below/side_by_side)

## Key Components
QuestionCard — renders group context + question image (above/below/side_by_side) + text + options + flag
QuestionNav — per-section question grid; Finish Section/Submit Exam button; prev disabled at section boundary in full_exam
Timer — per-section countdown; pulses red <5min; ticks via setInterval in component
ExamSession — section-complete modal (advance) + submit modal; keyboard nav 1-4/N/P/F

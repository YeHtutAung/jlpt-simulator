# Frontend Context

---

## packages/web — Main Exam App

### Stack
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand (exam session state)
- React Query / TanStack Query (server state)
- React Router v6 (routing)
- Supabase JS SDK (auth + data + storage)

---

## Design System

### Color Palette (CSS variables in globals.css)
```css
--color-bg:        #F7F3EE   /* warm off-white, washi paper feel */
--color-surface:   #FFFFFF
--color-border:    #E8E0D5
--color-text:      #1A1A2E   /* deep navy */
--color-text-muted:#6B6B7B
--color-primary:   #C41E3A   /* Japanese red (stamp/hanko) */
--color-primary-hover: #A01830
--color-accent:    #2B4A8B   /* deep blue */
--color-success:   #2D7D46
--color-error:     #C41E3A
--color-warning:   #D4860A
--color-timer-warn:#C41E3A   /* timer turns red under 5 min */
```

### Typography
- Display/headings: `Noto Serif JP` (Google Fonts)
- Body/UI: `DM Sans` (Google Fonts)
- Japanese text: `Noto Sans JP`

### Spacing
- Follow TailwindCSS default scale
- Exam cards: p-6 md:p-8
- Question text: text-lg md:text-xl
- Options: text-base, min-h-[52px]

---

## State Management

### examStore.ts (Zustand)
Manages the entire live exam session:
```typescript
interface ExamStore {
  // Data
  exam: Exam | null
  currentSectionIndex: number
  currentGroupIndex: number
  currentQuestionIndex: number

  // Answers
  answers: Record<string, number>     // questionId → selected option
  flagged: Set<string>                // flagged question ids
  timeSpent: Record<string, number>   // questionId → seconds

  // Timer
  timeRemaining: number               // seconds
  timerActive: boolean

  // Mode
  mode: ExamMode
  attemptId: string | null

  // Actions
  selectAnswer: (questionId: string, option: number) => void
  flagQuestion: (questionId: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  jumpToQuestion: (sectionIdx: number, groupIdx: number, qIdx: number) => void
  submitSection: () => Promise<void>
  submitExam: () => Promise<void>
  resetExam: () => void
}
```

### authStore.ts (Zustand)
```typescript
interface AuthStore {
  user: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}
```

---

## Routing Structure

```
/                     → Home (exam browser)
/login                → Login
/register             → Register
/exam/:examId         → ExamSelect (choose mode)
/exam/:examId/session → ExamSession (live exam)
/results/:attemptId   → Results
/review/:attemptId    → Answer Review
/dashboard            → User dashboard + history
```

---

## Component Patterns

### Question rendering by group_type:
```
text_only           → QuestionCard (text only)
text_with_passage   → PassageReader + QuestionCard
text_with_image     → ImageRenderer + QuestionCard
audio_only          → AudioPlayer + QuestionCard (text options)
audio_with_image    → AudioPlayer + ImageRenderer (image options)
audio_with_text     → AudioPlayer + QuestionCard (text options)
sentence_order      → QuestionCard (special layout)
fill_in_blank       → PassageReader + QuestionCard (inline blanks)
```

### Image rendering:
```typescript
// In ImageRenderer.tsx
if (image.source === 'svg') {
  // Render inline SVG (dangerouslySetInnerHTML with sanitization)
} else if (image.source === 'storage') {
  // Render <img src={image.storage_url} alt={image.alt_text} />
}
```

---

## Key Hooks

### useTimer.ts
- Counts down from section time_limit
- Emits warning at 5 minutes remaining
- Auto-submits at 0 (full_exam mode only)
- Pauses in practice mode if tab hidden

### useExam.ts
- Fetches exam data from Supabase
- Handles loading/error states
- Creates attempt on mount

### useAudio.ts
- Manages audio playback state
- Handles play/pause/replay
- Tracks if audio has been played (for listening restrictions)

---

## Packages Status

| File | Status |
|---|---|
| package.json | ⏳ TODO |
| vite.config.ts | ⏳ TODO |
| tailwind.config.ts | ⏳ TODO |
| src/lib/supabase.ts | ⏳ TODO |
| src/store/examStore.ts | ⏳ TODO |
| src/store/authStore.ts | ⏳ TODO |
| All pages | ⏳ TODO |
| All components | ⏳ TODO |

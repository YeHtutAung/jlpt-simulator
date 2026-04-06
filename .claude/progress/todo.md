# Todo

_Last updated: Session 6 (docs sync)_

---

## 🔴 High Priority — Live Deployment (requires real credentials)

1. **Supabase project setup** ✅
   - [x] Project live at `cmlxfddegfzwisuaiokh.supabase.co`
   - [x] All 9 migrations applied; `supabase/types.ts` generated
   - [x] Both exam seeds loaded; `db:verify` 12/13 pass

2. **Vercel web deployment** ✅
   - [x] Live at https://jlpt-simulator-theta.vercel.app
   - [x] Tailwind CSS fixed (postcss.config.cjs)

3. **Vercel admin deployment** ✅
   - [x] Live at https://jlpt-simulator-admin.vercel.app
   - [x] Tailwind CSS fixed (postcss.config.cjs)
   - [ ] Promote a user: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
   - [ ] Update `VITE_ADMIN_SECRET` to real value in Vercel dashboard
   - [ ] Verify AuthGuard: non-admin sees "Access Denied"
   - [ ] Retest signup — "Database error saving new user" (migration 00009 applied)

4. **Upload N5 audio files to Supabase Storage**
   - [ ] Upload `q1.mp3`–`q4.mp3` to `audio/n5/2017/december/`
   - [ ] Update seed JSON `audio_url` fields with public Storage URLs
   - [ ] Re-run seed + `npm run db:verify`

5. **Upload listening scene images to Supabase Storage**
   - [ ] Upload scene images to `images/n5/2017/december/`
   - [ ] Update seed JSON with Storage URLs

---

## 🟡 Medium Priority

### Mobile Responsiveness Audit
- [ ] Test all pages at 375px viewport width (iPhone SE)
- [ ] ExamSession: question card + option buttons stack cleanly
- [ ] QuestionNav: scrollable on small screens
- [ ] Dashboard: stats grid → single column on mobile
- [ ] Fix any overflow or cramped layouts found

### Dark Mode Implementation
- [ ] `uiStore.theme` toggle is already wired — just needs CSS
- [ ] Add `dark:` Tailwind class variants to all components
- [ ] Persist preference via `zustand/middleware persist` (already set up)
- [ ] Test: toggle in Navbar → all pages update immediately

### N4 Exam Papers
- [ ] Create `supabase/seed/n4_2017_december.json` placeholder (status: draft)
  - Vocabulary: 32 questions, Grammar/Reading: 43 questions, Listening: 30 questions
- [ ] Once real PDFs available: run converter CLI and replace placeholder

### Performance Audit
- [ ] Run Lighthouse on deployed web app, target score 90+
- [ ] Code-split heavy pages (ExamSession, Review) with `React.lazy`
- [ ] Set React Query `staleTime` on exam queries (data rarely changes)
- [ ] Check bundle size: `vite build --report`

### Tests
- [ ] `cd tools/converter && npx vitest run` — verify all 30 tests pass

---

## 🟢 Low Priority

### End-to-End Testing
- [ ] Full smoke test from `DEPLOYMENT.md` (register → exam → results)
- [ ] Test ErrorBoundary: force a render error in dev, confirm fallback shows
- [ ] Test toast notifications: success on submit, error on network fail

### More Exam Content
- [ ] N5 2018 seed JSON
- [ ] N3 and N2 papers (longer-term)

### Converter CLI
- [ ] Get real N5 PDF files and test full pipeline end-to-end
- [ ] Verify SVG output renders in SvgRenderer.tsx

### Infrastructure
- [ ] Supabase Storage CORS for audio (add web app origin)
- [ ] Supabase Edge Functions: `supabase functions deploy`
- [ ] Analytics dashboard in admin panel

---

## 💡 Ideas

- AI-generated explanations for wrong answers
- Spaced repetition for weak vocab
- Score prediction before submitting
- Flashcard mode from flagged questions
- Study plan generator based on weak sections

# Todo

_Last updated: Session 10 (exam results blank, forgot password visibility)_

---

## 🔴 High Priority — Manual Actions Required

These require credentials or file uploads — no code changes needed.

1. **Configure Supabase Auth redirect URLs** (manual — Supabase dashboard)
   - Auth → URL Configuration → Redirect URLs → add:
     - `https://jlpt-simulator-theta.vercel.app/reset-password`
     - `http://localhost:5173/reset-password`
   - Without this, password reset email links are blocked by Supabase

2. **Test full exam flow end-to-end on live app**
   - Start exam → answer questions → Submit → Results page shows score
   - Navigate through all questions to end → submit modal auto-opens → Submit → Results
   - Forgot password → email → `/reset-password` → set new password → success
   - Also requires: `supabase functions deploy submit-exam` if not already deployed

3. **Upload N5 audio files to Supabase Storage**
   - Upload `q1.mp3`–`q4.mp3` to `audio/n5/2017/december/`
   - Update `supabase/seed/n5_2017_december.json` `audio_url` fields with public Storage URLs
   - Re-run `npm run db:seed` and `npm run db:verify` (should get 13/13)

4. **Upload listening scene images to Supabase Storage**
   - Upload scene images to `images/n5/2017/december/`
   - Update seed JSON with Storage URLs

5. **Promote a user to admin**
   - Run in Supabase SQL editor: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
   - Then verify admin panel AuthGuard works (non-admin gets "Access Denied")

---

## 🟡 Medium Priority

### Lighthouse Audit
- Run Lighthouse on https://jlpt-simulator-theta.vercel.app now that CSS is fully loading
- Target: Performance 90+, Accessibility 95+
- Use `npm run analyze` to check bundle size if needed

### E2E Tests with Playwright
- Full smoke test: register → select exam → complete → view results → review answers
- Test dark mode toggle persists across page navigation
- Test mobile layout at 375px (Chrome DevTools device emulation)
- Test ErrorBoundary: force a render error in dev, confirm fallback shows

### N4 Exam Papers
- Create `supabase/seed/n4_2017_december.json` placeholder (status: draft)
  - Vocabulary: 32 questions, Grammar/Reading: 43 questions, Listening: 30 questions
- Once real PDFs available: run converter CLI and replace placeholder

---

## 🟢 Low Priority

### More Exam Content
- N5 2018 seed JSON
- N3 and N2 papers (longer-term)

### Converter CLI
- Get real N5 PDF files and test full pipeline end-to-end
- Verify SVG output renders in SvgRenderer.tsx

### Infrastructure
- Supabase Storage CORS for audio (add web app origin)
- Supabase Edge Functions: `supabase functions deploy`
- Analytics dashboard in admin panel

### Unit Tests
- `cd tools/converter && npx vitest run` — verify all 30 tests still pass

---

## 💡 Ideas

- AI-generated explanations for wrong answers
- Spaced repetition for weak vocab
- Score prediction before submitting
- Flashcard mode from flagged questions
- Study plan generator based on weak sections

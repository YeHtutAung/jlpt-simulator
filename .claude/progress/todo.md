# Todo

_Last updated: Session 8 (mobile/dark/perf)_

---

## 🔴 High Priority — Live Issues

1. **Fix signup "Database error saving new user"**
   - Migration 00009 applied (SET search_path = public on trigger)
   - Needs retest — may still fail

2. **Admin access**
   - [ ] Promote a user: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
   - [ ] Update `VITE_ADMIN_SECRET` to real value in Vercel dashboard
   - [ ] Verify AuthGuard: non-admin sees "Access Denied"

3. **Upload N5 audio files to Supabase Storage**
   - [ ] Upload `q1.mp3`–`q4.mp3` to `audio/n5/2017/december/`
   - [ ] Update seed JSON `audio_url` fields with public Storage URLs
   - [ ] Re-run seed + `npm run db:verify`

4. **Upload listening scene images to Supabase Storage**
   - [ ] Upload scene images to `images/n5/2017/december/`
   - [ ] Update seed JSON with Storage URLs

---

## 🟡 Medium Priority

### N4 Exam Papers
- [ ] Create `supabase/seed/n4_2017_december.json` placeholder (status: draft)
  - Vocabulary: 32 questions, Grammar/Reading: 43 questions, Listening: 30 questions
- [ ] Once real PDFs available: run converter CLI and replace placeholder

### Tests
- [ ] `cd tools/converter && npx vitest run` — verify all 30 tests pass
- [ ] Run Lighthouse on deployed web app, target score 90+

---

## 🟢 Low Priority

### End-to-End Testing
- [ ] Full smoke test from `DEPLOYMENT.md` (register → exam → results)
- [ ] Test ErrorBoundary: force a render error in dev, confirm fallback shows
- [ ] Test toast notifications: success on submit, error on network fail
- [ ] Test dark mode toggle on all pages
- [ ] Test mobile layout at 375px

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

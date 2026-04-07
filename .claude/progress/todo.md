# Todo

_Last updated: Session 11 (section-by-section exam flow, question-level image support)_

---

## 🔴 High Priority — Manual Actions Required

These require credentials or file uploads — no code changes needed.

1. **Configure Supabase Auth redirect URLs** (manual — Supabase dashboard)
   - Auth → URL Configuration → Redirect URLs → add:
     - `https://jlpt-simulator-theta.vercel.app/reset-password`
     - `http://localhost:5173/reset-password`
   - Without this, password reset email links are blocked by Supabase

2. **Test full exam flow end-to-end on live app**
   - Start exam → answer questions in section 1 → press Next on last question → section-complete modal → Proceed → section 2 starts with fresh timer
   - Continue through all sections → Submit → Results page shows score with correct scoring
   - Verify Q27 renders apple-box SVG, Q28 renders desk SVG (both in vocabulary section)
   - Forgot password → email → `/reset-password` → set new password → success

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

### Verify Q27 Q28 render correctly on live app
- Navigate to N5 2017 Dec vocab section, reach Q27 (はこに りんごが…) — should show apple-box SVG above question text
- Reach Q28 (めがねは つくえの…) — should show desk SVG above question text

### Lighthouse Audit
- Run Lighthouse on https://jlpt-simulator-theta.vercel.app
- Target: Performance 90+, Accessibility 95+

### E2E Tests with Playwright
- Full smoke test: register → select exam → complete all sections → view results → review answers
- Test section-by-section advance modal in full_exam mode
- Test dark mode toggle, mobile layout at 375px, ErrorBoundary

### N4 Exam Papers
- Create `supabase/seed/n4_2017_december.json` placeholder (status: draft)

---

## 🟢 Low Priority

### More Exam Content
- N5 2018 seed JSON
- N3 and N2 papers (longer-term)

### Converter CLI
- Get real N5 PDF files and test full pipeline end-to-end

### Infrastructure
- Supabase Storage CORS for audio (add web app origin)
- Analytics dashboard in admin panel

### Unit Tests
- `cd tools/converter && npx vitest run` — verify all 30 tests still pass

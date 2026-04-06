# Todo

_Last updated: Session 4_

---

## 🔴 High Priority

### Dev Environment
- [ ] `npm install` — picks up vitest (converter) + zustand (admin)
- [ ] Copy `.env.example` → `.env` and fill in Supabase credentials
- [ ] `npm run db:start` → `npm run db:migrate` → `npm run db:types` → `npm run db:seed`
- [ ] `npm run dev` — verify web (5173) and admin (5174) start without errors

### Tests
- [ ] `cd tools/converter && npx vitest run` — verify all 30 test cases pass

### Toast animation fix
- [ ] Add `tailwindcss-animate` to packages/web devDeps, or replace `animate-in` classes
  with custom `@keyframes` in globals.css (Toast.tsx uses Tailwind v3 animate plugin)

---

## 🟡 Medium Priority

### End-to-End Testing
- [ ] Test exam session keyboard shortcuts work (1-4, N, P, F)
- [ ] Test admin auth guard: non-admin user sees "Access Denied"
- [ ] Test admin login form rejects bad credentials gracefully
- [ ] Test toast notifications: success on submit, error on network fail

### More Exam Content
- [ ] N5 2018 seed JSON
- [ ] N5 2019 seed JSON
- [ ] N4 papers

### Converter CLI
- [ ] Get real N5 PDF files and test full pipeline end-to-end
- [ ] Verify SVG output renders correctly in SvgRenderer.tsx

---

## 🟢 Low Priority

### Polish
- [ ] Mobile optimization (exam session layout on small screens)
- [ ] Dark mode (uiStore theme toggle already wired, needs Tailwind dark: class variants)
- [ ] Analytics dashboard in admin
- [ ] Performance tuning (React Query staleTime, bundle splitting)

### Infrastructure
- [ ] Vercel deployments (web + admin)
- [ ] Supabase Storage CORS for audio
- [ ] Supabase Edge Functions deployment via `supabase functions deploy`

---

## 💡 Ideas

- AI-generated explanations for wrong answers
- Spaced repetition for weak vocab
- Score prediction before submitting
- Flashcard mode from flagged questions
- Study plan generator based on weak sections

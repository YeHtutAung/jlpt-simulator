# Todo

_Last updated: Session 5 (docs sync)_

---

## 🔴 High Priority

### Deploy to Production

1. **Supabase** — create real project, run migrations, generate types, seed
   - [ ] Create Supabase project at supabase.com
   - [ ] Copy project URL + anon key + service role key into `.env`
   - [ ] `npm run db:migrate` against the live project
   - [ ] `npm run db:types` — regenerate `supabase/types.ts`
   - [ ] `npm run db:seed` — load N5 2017 December + N5 2019 July

2. **Web app** — deploy to Vercel and verify SPA routing works
   - [ ] Create Vercel project, set root directory to `packages/web`
   - [ ] Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - [ ] Deploy and test that `/exam/:id` routes load correctly (SPA rewrite)

3. **Admin panel** — deploy as separate Vercel project
   - [ ] Create separate Vercel project, root directory `packages/admin`
   - [ ] Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - [ ] Verify AuthGuard works: non-admin user sees "Access Denied"

4. **Audio files** — upload to Supabase Storage
   - [ ] Upload real N5 listening audio files (N5Q1-Q4.mp3 etc.) to the `audio` bucket
   - [ ] Update seed JSON with correct Supabase Storage URLs

5. **Images** — upload listening scene images
   - [ ] Upload real images for Listening もんだい5/6 picture scenes to the `images` bucket
   - [ ] Update seed JSON with correct Supabase Storage URLs

### Tests
- [ ] `cd tools/converter && npx vitest run` — verify all 30 test cases pass

---

## 🟡 Medium Priority

### End-to-End Testing
- [ ] Test exam session keyboard shortcuts work (1-4, N, P, F)
- [ ] Test admin auth guard: non-admin user sees "Access Denied"
- [ ] Test admin login form rejects bad credentials gracefully
- [ ] Test toast notifications: success on submit, error on network fail

### More Exam Content
- [ ] N5 2018 seed JSON
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
- [ ] Supabase Storage CORS for audio
- [ ] Supabase Edge Functions deployment via `supabase functions deploy`

---

## 💡 Ideas

- AI-generated explanations for wrong answers
- Spaced repetition for weak vocab
- Score prediction before submitting
- Flashcard mode from flagged questions
- Study plan generator based on weak sections

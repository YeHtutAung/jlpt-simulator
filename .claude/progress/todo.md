# Todo

_Last updated: Session 6_

---

## 🔴 High Priority

### Deploy to Production

1. **Supabase** — create real project, run migrations, generate types, seed
   - [ ] Create Supabase project at supabase.com
   - [ ] Copy project URL + anon key + service role key into `.env`
   - [ ] `npm run db:migrate` against the live project
   - [ ] `npm run db:types` — regenerate `supabase/types.ts` and commit
   - [ ] `npm run db:seed -- --file=n5_2017_december.json`
   - [ ] `npm run db:verify` — confirm all checks pass

2. **Web app** — deploy to Vercel and verify SPA routing works
   - [ ] Create Vercel project, set root directory to `packages/web`
   - [ ] Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - [ ] Deploy and test that `/exam/:id` routes load correctly (SPA rewrite)
   - [ ] Test 404 page: navigate to `/nonexistent` — should show NotFound, not blank

3. **Admin panel** — deploy as separate Vercel project
   - [ ] Create separate Vercel project, root directory `packages/admin`
   - [ ] Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - [ ] Promote a user to admin: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
   - [ ] Verify AuthGuard works: non-admin sees "Access Denied"

4. **Audio files** — upload to Supabase Storage
   - [ ] Upload real N5 listening audio (q1.mp3–q4.mp3) to `audio/n5/2017/december/`
   - [ ] Update seed JSON `audio_url` fields with Supabase Storage public URLs
   - [ ] Re-run seed, then `npm run db:verify` — audio_url check should pass

5. **Images** — upload listening scene images
   - [ ] Upload scene images to `images/n5/2017/december/`
   - [ ] Update seed JSON with Storage URLs

### Tests
- [ ] `cd tools/converter && npx vitest run` — verify all 30 tests pass

---

## 🟡 Medium Priority

### End-to-End Testing
- [ ] Full smoke test from DEPLOYMENT.md (register → exam → results)
- [ ] Test exam session keyboard shortcuts (1-4, N, P, F)
- [ ] Test admin auth guard: non-admin user sees "Access Denied"
- [ ] Test toast notifications: success on submit, error on network fail
- [ ] Test ErrorBoundary: force a render error in dev, confirm fallback shows

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

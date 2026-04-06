# Todo

_Last updated: Session 3_

---

## 🔴 High Priority (do next)

### Dev Environment Setup
- [ ] Run `npm install` in root
- [ ] Copy `.env.example` → `.env` and fill in Supabase credentials
- [ ] `npm run db:start` — start local Supabase
- [ ] `npm run db:migrate` — apply all 7 migrations
- [ ] `npm run db:types` — generate TypeScript types from DB
- [ ] `npm run db:seed` — import N5 2017 seed data
- [ ] `npm run dev` — test both web (5173) and admin (5174)

### Missing packages/web Files
- [ ] `src/store/uiStore.ts` — modal state, toast notifications, sidebar state
- [ ] `src/components/ui/Card.tsx` — reusable card component

---

## 🟡 Medium Priority

### End-to-End Testing
- [ ] Test exam session flow (select → session → results → review)
- [ ] Test admin upload flow (upload JSON → preview → import → publish)
- [ ] Test get-exam edge function returns no correct_answer
- [ ] Test get-stats edge function calculates correctly

### Converter CLI Testing
- [ ] Get real N5 PDF files
- [ ] Test `npm run convert` against real PDFs
- [ ] Verify output validates against schema

### More Seed Data
- [ ] N5 2018 conversion
- [ ] N5 2019 conversion
- [ ] N4 papers

---

## 🟢 Low Priority

### Polish
- [ ] Mobile optimization for web app
- [ ] Performance + caching (React Query staleTime tuning)
- [ ] Analytics dashboard in admin
- [ ] Dark mode

### Infrastructure
- [ ] Set up Vercel deployments (web + admin)
- [ ] Configure Supabase Storage CORS for audio/images
- [ ] Set up Supabase Edge Functions deployment

---

## 💡 Ideas (not committed)

- AI-generated explanations for wrong answers
- Spaced repetition for weak questions
- Leaderboard / social features
- Offline mode (PWA)

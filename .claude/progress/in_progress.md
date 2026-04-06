# Currently In Progress

_Last updated: Session 6 (docs sync)_

---

## 🔨 Active Task

Nothing in progress. Sessions 1–6 complete.

---

## 📍 Project State

The project is **deployment-ready**:
- Feature-complete (exam flow, admin panel, converter CLI, seed data)
- Type-clean (`npm run type-check` passes 4/4 packages)
- Lint-clean (`npm run lint` passes)
- Full deployment documentation in `DEPLOYMENT.md`
- Seed verification script at `npm run db:verify`
- Error boundaries on app root and ExamSession
- 404 page with bilingual message
- Skeleton loading states on Home and Dashboard

### Blocked only on:
- Live Supabase project credentials
- Vercel account / project setup
- Real N5 listening audio MP3 files
- Real listening scene images

### When credentials are available:
1. Fill in `.env` from `.env.example`
2. `npm run db:migrate` → `npm run db:types` → `npm run db:seed -- --file=n5_2017_december.json`
3. `npm run db:verify` — confirm seed pass
4. Deploy web to Vercel (root: `packages/web`)
5. Deploy admin to Vercel (root: `packages/admin`, separate project)
6. Run smoke test checklist from `DEPLOYMENT.md`

---

## ⚠️ Known Issues

- `supabase/types.ts` not generated yet — run `npm run db:types` after first migration
- N5 2019 July listening groups have no `audio_url` — placeholder only; `db:verify` will report audio_url FAIL until real files are uploaded and seed JSON is updated

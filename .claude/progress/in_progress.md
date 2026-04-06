# Currently In Progress

_Last updated: Session 6_

---

## 🔨 Active Task

Nothing in progress. Sessions 1–6 complete.

---

## 📍 Exact State

### Just completed (Session 6):
- `DEPLOYMENT.md` — full production deployment guide at project root
- `tools/verify-seed.ts` + `npm run db:verify` — seed verification script
- `ErrorBoundary.tsx` — wraps entire app and ExamSession independently
- `NotFound.tsx` — replaces the `*` → `/` redirect in the router
- `Skeleton.tsx` — `ExamCardSkeleton` and `DashboardSkeleton` wired into Home + Dashboard
- `npm run type-check` passes clean (4/4 packages)
- `npm run lint` passes clean

### Project state:
- Code is feature-complete, type-clean, lint-clean
- All deployment docs and scripts are ready
- Blocked only on: Supabase project credentials, Vercel accounts, real audio/image assets

### Next immediate steps:
1. Create Supabase project and fill in `.env`
2. `npm run db:migrate` → `npm run db:types` → `npm run db:seed`
3. `npm run db:verify` — verify seed is correct
4. Deploy web to Vercel (root: `packages/web`)
5. Deploy admin to Vercel (root: `packages/admin`)

---

## 🚧 Blocked By

- Need Supabase project credentials for live deployment
- Need real N5 listening audio MP3 files for Storage upload
- Need real listening scene images for Storage upload

---

## ⚠️ Known Issues

- `supabase/types.ts` not generated yet — run `npm run db:types` after db:migrate
- N5 2019 July listening groups have no `audio_url` — placeholder only
- verify-seed will report audio_url FAIL until real files are uploaded

# Currently In Progress

_Last updated: Session 5 (docs sync)_

---

## 🔨 Active Task

Nothing in progress. Sessions 1–5 complete.

---

## 📍 Exact State

### Just completed (Session 5):
- Toast animation fixed (Option B: custom `@keyframes`, no plugin)
- All TypeScript errors resolved — `npm run type-check` passes clean (4/4 packages)
- All lint errors resolved — `npm run lint` passes clean
- `supabase/seed/n5_2019_july.json` created (33+32+25 questions, status: draft)
- Vercel config: root `vercel.json` + `packages/web/vercel.json` + `packages/admin/vercel.json`
- `README.md` written at project root

### Next immediate steps:
1. Copy `.env.example` → `.env` and fill in Supabase credentials
2. `npm run db:start` → `npm run db:migrate` → `npm run db:types` → `npm run db:seed`
3. `npm run dev` — verify web (5173) and admin (5174) start without errors
4. Run converter tests: `cd tools/converter && npx vitest run`

---

## 🚧 Blocked By

- Need Supabase project credentials for end-to-end testing
- Need real PDF files for converter CLI testing

---

## ⚠️ Known Issues

- `supabase/types.ts` not generated yet — run `npm run db:types`
- N5 2019 July seed is placeholder only (audio files don't exist yet for listening section)

# Currently In Progress

_Last updated: Session 3_

---

## 🔨 Active Task

**Building:** Full project — all backend, converter, and admin components

**Session goal:**
Session 3 is complete. All major components have been built.
Next: install dependencies, run dev servers, test end-to-end flow.

---

## 📍 Exact State

### Just completed (Session 3):
- `supabase/functions/get-exam/index.ts` — fetches exam data, strips correct_answer
- `supabase/functions/get-stats/index.ts` — user performance stats
- `tools/converter/src/` — full PDF→JSON CLI (10 files)
- `packages/admin/` — complete admin panel (config + pages + components)
- `supabase/seed/n5_2017_december.json` — fixed field names (`question_text` → `text`)
- `supabase/seed/seed.ts` — fixed `order_index` mapping, batched question inserts
- `packages/shared/src/schemas/exam.schema.ts` — updated options from `.length(4)` to `.min(3).max(4)` to support N5 listening sections with 3 options

### Currently doing:
- Nothing (session ended cleanly)

### Next immediate steps:
1. Run `npm install` in root to install all dependencies
2. Start local Supabase: `npm run db:start`
3. Run migrations: `npm run db:migrate`
4. Seed test data: `npm run db:seed`
5. Start dev servers: `npm run dev`
6. Test web app at localhost:5173
7. Test admin at localhost:5174
8. Add missing `uiStore.ts` in packages/web/src/store/
9. Add missing `Card.tsx` in packages/web/src/components/ui/
10. Set up real Supabase project + fill .env

---

## 🚧 Blocked By

- Need actual Supabase project URL + keys to run end-to-end
- Need actual PDF files to test converter CLI

---

## ⚠️ Known Issues

- `supabase/types.ts` does not exist yet — run `npm run db:types` after migrations
- `packages/web` still missing: `src/store/uiStore.ts`, `src/components/ui/Card.tsx`
- Grammar section question numbers are section-relative (1-32), not global (34-65)
  — this is correct per actual exam format; UUIDs are used for scoring
- Some grammar section answers may need verification against official answer key
- Listening もんだい3 and もんだい4 have 3-option questions — schema updated to allow this

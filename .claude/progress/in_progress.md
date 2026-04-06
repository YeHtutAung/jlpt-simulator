# Currently In Progress

_Last updated: Session 4_

---

## 🔨 Active Task

Nothing in progress. Session 4 complete.

---

## 📍 Exact State

### Just completed (Session 4):
- `packages/web/src/store/uiStore.ts` — theme (persisted to localStorage), sidebar, toasts with auto-dismiss
- `packages/web/src/components/ui/Card.tsx` — 4 variants, header/footer slots, clickable mode
- `packages/web/src/pages/ExamSession.tsx` — keyboard nav (1-4 select, N/→ next, P/← prev in practice, F flag), keyboard hint bar in footer
- `packages/web/src/components/ui/Toast.tsx` — ToastContainer + useToast hook (success/error/info)
- `packages/web/src/App.tsx` — wired ToastContainer
- `packages/admin/src/store/adminStore.ts` — Zustand store: loading/unauthenticated/unauthorized/admin states
- `packages/admin/src/components/AuthGuard.tsx` — inline login form + access denied screen
- `packages/admin/src/App.tsx` — wrapped with AuthGuard
- `packages/admin/package.json` — added zustand dependency
- `tools/converter/src/__tests__/answerParser.test.ts` — 10 test cases
- `tools/converter/src/__tests__/jsonValidator.test.ts` — 12 test cases
- `tools/converter/src/__tests__/vocabularyParser.test.ts` — 8 test cases
- `tools/converter/package.json` — added vitest devDependency

### Next immediate steps:
1. Run `npm install` to pick up vitest + zustand (admin)
2. Run converter tests: `cd tools/converter && npx vitest run`
3. Set up Supabase project + fill `.env`
4. Run migrations + seed
5. Start dev servers: `npm run dev`

---

## 🚧 Blocked By

- Need Supabase project credentials for end-to-end testing
- Need real PDF files for converter CLI testing

---

## ⚠️ Known Issues

- `supabase/types.ts` not generated yet — run `npm run db:types`
- Admin `zustand` not yet in node_modules — needs `npm install`
- `animate-in` / `slide-in-from-right-4` Tailwind classes in Toast.tsx require `tailwindcss-animate` plugin or manual keyframes — add if needed

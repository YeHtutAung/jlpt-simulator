# Currently In Progress

_Last updated: Session 8 (mobile/dark/perf)_

---

## 🔨 Active Task

Nothing in progress. Session 8 complete.

---

## 📍 Project State

The project is **live**:
- Web app: https://jlpt-simulator-theta.vercel.app
- Admin panel: https://jlpt-simulator-admin.vercel.app
- Database: Supabase project `cmlxfddegfzwisuaiokh` — 2 exams seeded, 12/13 verify checks pass

### Completed in Session 8:
- **Dark mode fully implemented** — `darkMode: 'class'` in tailwind.config.ts, `.dark` CSS variable block in globals.css, `dark:` variants on all components and pages
- **Mobile responsive** — 375px compatible: single-column grids, filter bar wraps, nav buttons stack on mobile
- **Performance** — React.lazy + Suspense on all page routes, `staleTime: Infinity` on exam/result queries, `React.memo` on QuestionCard, OptionButton, QuestionNav, AudioPlayer, ProgressBar
- **Bundle analyser** — `npm run analyze` in packages/web/package.json

### Still needed:
- Promote a user to admin: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
- Upload N5 audio files to Supabase Storage (`audio/n5/2017/december/`)
- Upload listening scene images to Supabase Storage
- Update `VITE_ADMIN_SECRET` in Vercel to a real secret value
- Investigate "Database error saving new user" (trigger search_path fix applied — retest needed)

---

## ⚠️ Known Issues

- N5 2019 July listening groups have no `audio_url` — placeholder only; `db:verify` will report audio_url FAIL until real files uploaded
- "Database error saving new user" on signup — `handle_new_user` trigger search_path fix applied in migration 00009; needs retest
- `VITE_ADMIN_SECRET` in Vercel admin project is set to placeholder value

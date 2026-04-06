# Currently In Progress

_Last updated: Session 7 (CSS fix, dark mode, mobile, performance)_

---

## 🔨 Active Task

Nothing in progress. Session 7 complete.

---

## 📍 Project State

The project is **live** and fully styled:
- Web app: https://jlpt-simulator-theta.vercel.app
- Admin panel: https://jlpt-simulator-admin.vercel.app
- Database: Supabase project `cmlxfddegfzwisuaiokh` — 2 exams seeded, 12/13 verify checks pass

### What is working:
- ✅ Both apps live on Vercel with CSS loading correctly
- ✅ Dark mode toggle in Navbar (sun/moon icon), persisted to localStorage
- ✅ Mobile responsive at 375px (single-column grids, stacked nav, wrapping filter bar)
- ✅ React.lazy + Suspense on all routes, staleTime: Infinity on exam queries, React.memo on heavy components

### Remaining blockers — all require manual action, no code needed:
- **Upload N5 audio files** to Supabase Storage (`audio/n5/2017/december/`) — then update seed JSON URLs and re-run `npm run db:seed`
- **Upload listening scene images** to Supabase Storage (`images/n5/2017/december/`)
- **Promote a user to admin** via SQL: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
- **Update `VITE_ADMIN_SECRET`** in Vercel admin project to a real secret value

---

## ⚠️ Known Issues

- N5 2019 July listening groups have no `audio_url` — placeholder only; `db:verify` will report audio_url FAIL until real files are uploaded
- "Database error saving new user" on signup — `handle_new_user` trigger search_path fix applied in migration 00009; needs retest with a real signup attempt
- `VITE_ADMIN_SECRET` in Vercel admin project is set to placeholder value

# Currently In Progress

_Last updated: Session 8 (signup fix, auth UX, VITE_ADMIN_SECRET cleanup)_

---

## 🔨 Active Task

Nothing in progress. Session 8 complete.

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
- ✅ Signup correctly detects email confirmation state and shows appropriate message
- ✅ Login/Register redirect authenticated users away from auth forms
- ✅ Forgot password flow on Login page

### Remaining blockers — all require manual action, no code needed:
- **Upload N5 audio files** to Supabase Storage (`audio/n5/2017/december/`) — then update seed JSON URLs and re-run `npm run db:seed`
- **Upload listening scene images** to Supabase Storage (`images/n5/2017/december/`)
- **Promote a user to admin** via SQL: `UPDATE profiles SET role = 'admin' WHERE id = '...'`

---

## ⚠️ Known Issues

- N5 2019 July listening groups have no `audio_url` — placeholder only; `db:verify` will report audio_url FAIL until real files are uploaded
- Signup trigger (`handle_new_user`) search_path fix is in migration 00009; if "Database error saving new user" still occurs, investigate RLS on profiles table in Supabase dashboard

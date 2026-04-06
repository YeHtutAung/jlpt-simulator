# Currently In Progress

_Last updated: Session 7 (deployment)_

---

## 🔨 Active Task

Nothing in progress. Sessions 1–7 complete.

---

## 📍 Project State

The project is **live**:
- Web app: https://jlpt-simulator-theta.vercel.app
- Admin panel: https://jlpt-simulator-admin.vercel.app
- Database: Supabase project `cmlxfddegfzwisuaiokh` — 2 exams seeded, 12/13 verify checks pass
- Tailwind CSS now fully processed in both packages (`postcss.config.cjs` added)

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

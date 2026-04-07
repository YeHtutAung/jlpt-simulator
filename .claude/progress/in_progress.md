# Currently In Progress

_Last updated: Session 11 (section-by-section exam flow, question-level image support)_

---

## 🔨 Active Task

Nothing in progress. Session 11 complete.

---

## 📍 Project State

The project is **live** and fully styled:
- Web app: https://jlpt-simulator-theta.vercel.app
- Admin panel: https://jlpt-simulator-admin.vercel.app
- Database: Supabase project `cmlxfddegfzwisuaiokh` — 2 exams seeded, migration 00008 applied

### What is working:
- ✅ Both apps live on Vercel with CSS loading correctly
- ✅ Dark mode toggle in Navbar, persisted to localStorage
- ✅ Mobile responsive at 375px
- ✅ React.lazy + Suspense on all routes, performance optimised
- ✅ Full auth flow: signup, login, forgot password, `/reset-password` page
- ✅ Section-by-section exam flow (full_exam mode): timer resets per section, section-complete modal before advancing, cannot go back across sections
- ✅ Exam submission fixed: correct answer keys, CORS headers on all Edge Function responses
- ✅ Results page handles null `score_json`
- ✅ Q27 and Q28 (apple box, desk scene) render inline SVG images with `image_position: above`
- ✅ `QuestionCard` supports `above`, `below`, `side_by_side` image positions

### Remaining blockers — manual actions required:
- **Configure Supabase Auth redirect URLs** — add `/reset-password` to Auth → URL Configuration → Redirect URLs (see DEPLOYMENT.md §1.5)
- **Upload N5 audio files** to Supabase Storage (`audio/n5/2017/december/`) — then re-run `npm run db:seed`
- **Upload listening scene images** to Supabase Storage (`images/n5/2017/december/`)
- **Promote a user to admin** via SQL: `UPDATE profiles SET role = 'admin' WHERE id = '...'`

---

## ⚠️ Known Issues / Gaps

- N5 2019 July has no audio files yet — `db:verify` will report audio_url FAIL until uploaded
- Multiple question rows exist in DB for Q27/Q28 from previous seed runs — pre-existing issue; `source_json` in `exams` table is authoritative and correct
- **Supabase Auth redirect URLs not yet configured** — must add reset-password URL to Auth dashboard (manual step)

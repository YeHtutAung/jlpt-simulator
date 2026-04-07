# In Progress — S11 complete, nothing active

## Live URLs
Web: https://jlpt-simulator-theta.vercel.app
Admin: https://jlpt-simulator-admin.vercel.app
DB: Supabase `cmlxfddegfzwisuaiokh` — 2 exams seeded, migrations 00001–00009+00008_questions_image ✅

## ✅ Working
- Both apps live, CSS loading, dark mode, mobile 375px
- Auth: signup (email confirm handling), login, logout, forgot password, `/reset-password`
- Exam: section-by-section flow (timer resets per section, section-complete modal, no cross-section back in full_exam)
- Exam submission: correct answer keys, CORS on all Edge Function responses, score calculated correctly
- Results: 3-way render (score/calculating/not found)
- Q27 apple-box SVG + Q28 desk SVG render in vocab section

## ⚠️ Blockers (manual actions — no code needed)
- Configure Supabase Auth redirect URLs (Auth→URL Config→add `/reset-password` prod+localhost) — see DEPLOYMENT.md §1.5
- Upload N5 audio files to Storage (`audio/n5/2017/december/q1–q4.mp3`) → update seed JSON → re-seed
- Upload listening scene images to Storage (`images/n5/2017/december/`)
- Promote user to admin: `UPDATE profiles SET role='admin' WHERE id='...'`

## ⚠️ Known gaps
- N5 2019 Jul: no audio yet → db:verify audio_url FAIL expected
- Multiple Q27/Q28 rows in DB from prior seed runs (pre-existing); `source_json` is authoritative ✅

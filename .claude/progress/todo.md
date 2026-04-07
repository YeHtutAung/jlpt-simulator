# Todo — S11

## 🔴 Manual (no code needed)
1. Supabase Auth redirect URLs → add `https://jlpt-simulator-theta.vercel.app/reset-password` + `http://localhost:5173/reset-password` (Auth→URL Config dashboard)
2. Upload N5 audio `q1–q4.mp3` → `audio/n5/2017/december/` → update seed JSON audio_url fields → `npm run db:seed` → `npm run db:verify` (target 13/13)
3. Upload listening scene images → `images/n5/2017/december/` → update seed JSON
4. Promote admin user: `UPDATE profiles SET role='admin' WHERE id='...'` (Supabase SQL editor)

## 🔴 Verify
- Test full exam: start → answer → section-complete modal → proceed → final submit → Results shows correct score
- Verify Q27 apple-box SVG + Q28 desk SVG render above question text in vocab section

## 🟡 Medium
- Lighthouse audit on live app (target: perf 90+, a11y 95+)
- E2E Playwright: register→exam→sections→results→review; section modal; dark mode; 375px; ErrorBoundary
- N4 placeholder seed JSON (`n4_2017_december.json`, draft)

## 🟢 Low
- N5 2018 seed JSON
- N3/N2 papers
- Converter: test full pipeline with real N5 PDFs
- Storage CORS (add web app origin for audio)
- Admin analytics dashboard
- `cd tools/converter && npx vitest run` (verify 30 tests pass)

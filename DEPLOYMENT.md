# Deployment Guide

This guide covers deploying JLPT Simulator to production: Supabase (database + storage + edge functions) and Vercel (two separate apps).

---

## Pre-Deployment Checklist

Before starting, verify locally:

- [ ] `npm install` — all dependencies installed
- [ ] `npm run type-check` — passes clean (4/4 packages)
- [ ] `npm run lint` — passes clean
- [ ] `cd tools/converter && npx vitest run` — all 30 tests pass
- [ ] `.env` file exists with all variables filled in (see below)
- [ ] `supabase/seed/n5_2017_december.json` exists and is `status: published`
- [ ] `supabase/seed/n5_2019_july.json` exists (status: draft — OK)

---

## 1. Supabase Setup

### 1.1 Create a project

1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a region close to your users
3. Set a strong database password — save it somewhere safe
4. Wait for the project to finish provisioning (~2 min)

### 1.2 Get your credentials

From **Project Settings → API**:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — keep this secret |

Also set in `.env`:
```
VITE_SUPABASE_SERVICE_ROLE_KEY=<same as SUPABASE_SERVICE_ROLE_KEY>
```

### 1.3 Link the CLI to your project

```bash
supabase login
supabase link --project-ref <your-project-ref>
# Project ref is the part after https:// and before .supabase.co
```

### 1.4 Run migrations

```bash
npm run db:migrate
# Equivalent to: supabase db push
```

This applies all 7 migrations in order:
- `00001_create_exams.sql`
- `00002_create_sections.sql`
- `00003_create_question_groups.sql`
- `00004_create_questions.sql`
- `00005_create_user_tables.sql`
- `00006_rls_policies.sql`
- `00007_storage_buckets.sql`

### 1.5 Configure Auth redirect URLs

In the Supabase dashboard, go to **Authentication → URL Configuration** and set:

| Field | Value |
|---|---|
| **Site URL** | `https://jlpt-simulator-theta.vercel.app` (your production domain) |
| **Redirect URLs** | Add each of the following on its own line |

Redirect URLs to add:
```
https://jlpt-simulator-theta.vercel.app/reset-password
http://localhost:5173/reset-password
```

> Without these entries the password reset email will contain a link that Supabase blocks as an unauthorized redirect, and the user will never reach `/reset-password`.

---

### 1.6 Regenerate TypeScript types

```bash
npm run db:types
# Writes to: supabase/types.ts
```

> Always run this after any migration. Commit the updated `supabase/types.ts`.

### 1.7 Seed exam data

```bash
# Seed the published N5 2017 December paper
npm run db:seed -- --file=n5_2017_december.json

# Seed the draft N5 2019 July paper (optional — needs audio/images first)
npm run db:seed -- --file=n5_2019_july.json
```

### 1.8 Verify the seed

```bash
npm run db:verify
```

This runs `tools/verify-seed.ts` and prints a pass/fail report.

---

## 2. Supabase Storage Setup

### 2.1 Buckets

Two public buckets are created automatically by migration `00007_storage_buckets.sql`:
- `audio` — listening section MP3 files
- `images` — question diagram images

If they weren't created automatically, create them manually:
**Storage → New bucket** → name `audio`, check "Public" → Create.
Repeat for `images`.

### 2.2 Upload audio files

Listening audio files follow this naming convention:
```
audio/n5/2017/december/q1.mp3   ← もんだい1 audio
audio/n5/2017/december/q2.mp3
audio/n5/2017/december/q3.mp3
audio/n5/2017/december/q4.mp3
```

Upload via Supabase dashboard: **Storage → audio → Upload file**, or via CLI:
```bash
supabase storage cp ./local/audio/q1.mp3 ss:///audio/n5/2017/december/q1.mp3
```

After uploading, get the public URL from the dashboard and update the seed JSON:
```json
"audio_url": "https://<project>.supabase.co/storage/v1/object/public/audio/n5/2017/december/q1.mp3"
```

Then re-run seed for that paper.

### 2.3 Upload listening scene images

Images for picture-description questions:
```
images/n5/2017/december/listen_q5_scene.png
images/n5/2017/december/listen_q6_scene.png
```

Same process: upload via dashboard, then update the seed JSON with the public storage URL.

### 2.4 CORS configuration

If the web app is on a different domain than Supabase:

**Storage → Policies → CORS** → add:
```
Allowed origins: https://your-web-app.vercel.app
Allowed methods: GET
```

---

## 3. Vercel — Web App Deployment

### 3.1 Import repository

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your GitHub repository
3. **Important:** Set **Root Directory** to `packages/web`
4. Framework preset will auto-detect as **Vite** — leave as-is

### 3.2 Configure build settings

Vercel should auto-detect these from `packages/web/vercel.json`, but verify:

| Setting | Value |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` (run from repo root) |

### 3.3 Add environment variables

Under **Settings → Environment Variables**:

| Name | Value | Environments |
|---|---|---|
| `VITE_SUPABASE_URL` | your Supabase project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | your anon key | Production, Preview, Development |

> Do NOT add `SUPABASE_SERVICE_ROLE_KEY` to the web app — this is admin-only.

### 3.4 Deploy

**Via Vercel dashboard:** Click **Deploy**. First deploy takes ~2 minutes.

**Via Vercel CLI (re-deploys):** Run from the repo root — the root `.vercel/project.json` is already linked to `jlpt-simulator`:

```bash
vercel --prod --yes
```

### 3.5 Verify SPA routing

After deploy, test these URLs directly in the browser (not via navigation):
- `https://your-app.vercel.app/login` — should load the login page, not 404
- `https://your-app.vercel.app/dashboard` — should redirect to login if not logged in
- `https://your-app.vercel.app/nonexistent` — should show the 404 page

The `packages/web/vercel.json` rewrite rule (`/* → /index.html`) makes this work.

---

## 4. Vercel — Admin Panel Deployment

### 4.1 Create a separate project

The admin panel **must be a separate Vercel project** — it uses the service role key and should be deployed at a different URL (ideally a non-public one).

1. Vercel → Add New Project → same repository
2. **Root Directory:** leave as repo root (not `packages/admin`)
3. **Build Command:** `turbo run build --filter=@jlpt/admin`
4. **Output Directory:** `packages/admin/dist`
5. **Install Command:** `npm install`
6. Framework: Vite

**CLI re-deploys:** The admin must also be deployed from the repo root (it depends on `@jlpt/shared` workspace package). The root `.vercel/project.json` normally points to the web app — swap it temporarily:

```bash
# From repo root:
node -e "
  const fs = require('fs');
  const web = JSON.parse(fs.readFileSync('.vercel/project.json','utf8'));
  fs.writeFileSync('.vercel/project.web.json', JSON.stringify(web, null, 2));
  const admin = JSON.parse(fs.readFileSync('packages/admin/.vercel/project.json','utf8'));
  admin.settings = { framework:'vite', installCommand:'npm install',
    buildCommand:'turbo run build --filter=@jlpt/admin',
    outputDirectory:'packages/admin/dist', rootDirectory:null, nodeVersion:'24.x' };
  fs.writeFileSync('.vercel/project.json', JSON.stringify(admin, null, 2));
"
vercel --prod --yes
node -e "
  const fs = require('fs');
  fs.copyFileSync('.vercel/project.web.json', '.vercel/project.json');
  fs.unlinkSync('.vercel/project.web.json');
"
```

### 4.2 Add environment variables

| Name | Value | Note |
|---|---|---|
| `VITE_SUPABASE_URL` | your Supabase project URL | Same as web app |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | service role key | **Keep secret — bypasses RLS** |

> ⚠️ The service role key bypasses all Row Level Security policies. Never expose it to end users. The admin panel should be protected by auth (AuthGuard checks `profiles.role = 'admin'`), but consider also adding Vercel Password Protection under **Settings → Security**.

### 4.3 Verify AuthGuard

After deploy:
1. Open the admin URL — should see a login form
2. Log in with a non-admin Supabase user — should see "Access Denied"
3. Log in with a user who has `profiles.role = 'admin'` — should see the dashboard

To promote a user to admin, run in the Supabase SQL editor:
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
```

---

## 5. Deploy Edge Functions

```bash
supabase functions deploy get-exam
supabase functions deploy submit-exam
supabase functions deploy get-stats
```

Set secrets for edge functions (they need service role access):
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## 6. Post-Deployment Smoke Tests

Run through this checklist after every production deploy:

### Auth
- [ ] Register a new user → "Check your email" screen (if email confirmation on) or dashboard
- [ ] Log out → lands on home page (not dashboard)
- [ ] Log back in → lands on dashboard
- [ ] Navigate to `/dashboard` while logged out → redirected to `/login`
- [ ] Click "Forgot password?" on login page → enter email → "Check your email" screen
- [ ] Click the reset link in the email → lands on `/reset-password` → set new password → success screen

### Exam flow
- [ ] Home page loads exam cards
- [ ] Click an exam → ExamSelect page loads with mode options
- [ ] Start Full Exam → timer counts down
- [ ] Answer question 1 with keyboard (`1`) → option selected, toast appears
- [ ] Press `F` → question flagged (nav indicator updates)
- [ ] Press `N` → moves to question 2
- [ ] Submit exam → submit modal appears
- [ ] Confirm submit → Results page loads with score
- [ ] "Review Answers" button → Review page shows correct/incorrect

### Dashboard
- [ ] Dashboard shows attempt count, avg score, best score
- [ ] Recent attempts list shows the just-completed attempt
- [ ] "Results" and "Review" links work from attempt rows

### Admin (separate URL)
- [ ] Login with admin credentials → dashboard appears
- [ ] Upload exam JSON → validates and saves
- [ ] Manage Exams page lists all exams

---

## 7. Rollback Procedure

### Vercel rollback

If a deployment breaks the app:
1. Vercel dashboard → your project → **Deployments** tab
2. Find the last good deployment → click `⋯` → **Promote to Production**

This is instant — no rebuild needed.

### Database rollback

Supabase does not support automatic migration rollback. Options:

**Option A — Restore from backup** (destructive):
1. Supabase dashboard → **Database → Backups**
2. Restore to a point before the bad migration

**Option B — Write a down-migration** (preferred):
```bash
# Create a new migration that undoes the change
touch supabase/migrations/00008_rollback_<description>.sql
# Write the inverse SQL, then:
npm run db:migrate
```

### Edge function rollback

Redeploy the previous version from git:
```bash
git checkout <good-commit> -- supabase/functions/
supabase functions deploy <function-name>
```

---

## Environment Variables Reference

| Variable | Used in | Required | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | web, admin | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | web | Yes | Public anon key (RLS enforced) |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | admin | Yes | Bypasses RLS — keep secret |
| `SUPABASE_SERVICE_ROLE_KEY` | seed, edge functions | Yes | Same key, non-VITE_ for server use |
| `VITE_APP_URL` | optional | No | Web app URL (for CORS/redirects) |
| `VITE_ADMIN_URL` | optional | No | Admin panel URL |

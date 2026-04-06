# JLPT Simulator

A full-stack JLPT (Japanese Language Proficiency Test) exam simulator supporting all levels (N1–N5), multiple years of past papers, two exam modes (Full Exam and Practice), and a PDF → JSON conversion pipeline.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Exam app frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Admin panel frontend | React 18 + TypeScript + Vite + TailwindCSS |
| State management | Zustand + TanStack React Query |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Hosting | Vercel (two separate deployments) |
| Monorepo tooling | Turborepo + npm workspaces |
| Validation | Zod (`@jlpt/shared`) |

---

## Monorepo Structure

```
jlpt-simulator/
├── packages/
│   ├── web/        # Main exam app — deployed to Vercel
│   ├── admin/      # Admin panel — deployed to Vercel (separate)
│   └── shared/     # Shared types, Zod schemas, scoring utils
├── supabase/
│   ├── migrations/ # Versioned SQL migrations
│   ├── functions/  # Deno Edge Functions (get-exam, submit-exam, get-stats)
│   └── seed/       # Exam JSON seed data (N5 2017 december, N5 2019 july, …)
├── tools/
│   └── converter/  # PDF → JSON CLI pipeline
└── .claude/        # Agent context, conventions, progress tracking
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (required by Supabase CLI for local dev)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### 3. Start local Supabase

```bash
npm run db:start
```

### 4. Apply migrations and generate types

```bash
npm run db:migrate
npm run db:types
```

### 5. Seed exam data

```bash
npm run db:seed
```

### 6. Start dev servers

```bash
npm run dev
# Web app:   http://localhost:5173
# Admin app: http://localhost:5174
```

---

## Exam Modes

| Mode | Behaviour |
|---|---|
| **Full Exam** | Timed (per JLPT spec), no backward navigation, submit at end |
| **Practice** | Untimed, free navigation, instant feedback after each answer |

### Keyboard shortcuts (exam session)

| Key | Action |
|---|---|
| `1` `2` `3` `4` | Select answer option |
| `N` / `→` | Next question |
| `P` / `←` | Previous question (practice mode only) |
| `F` | Flag / unflag question |

---

## Converter Workflow

The converter turns raw JLPT PDF files into validated JSON for seeding.

```bash
npm run convert -- \
  --input=path/to/exam.pdf \
  --answers=path/to/answers.pdf \
  --level=N5 \
  --year=2017 \
  --month=december \
  --output=supabase/seed/
```

The output is validated against the Zod schema in `@jlpt/shared` before being written.

### Run converter unit tests

```bash
cd tools/converter && npx vitest run
```

---

## Deployment

Each app is deployed independently on Vercel using its own `vercel.json`.

### Web app (`packages/web`)

1. Create a Vercel project pointing to `packages/web` as the root directory.
2. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Admin panel (`packages/admin`)

1. Create a separate Vercel project pointing to `packages/admin`.
2. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_SERVICE_ROLE_KEY`

Both configs include an SPA rewrite rule (`/* → /index.html`) for client-side routing.

---

## Environment Variables

| Variable | Used in | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | web, admin | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | web | Public anon key (RLS enforced) |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | admin | Service role key — bypasses RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | seed script, Edge Functions | Service role key for server-side ops |

---

## Database

All schema changes go through versioned migration files in `supabase/migrations/`. After any schema change:

```bash
npm run db:migrate
npm run db:types   # regenerates supabase/types.ts
```

Key tables: `exams`, `sections`, `question_groups`, `questions`, `attempts`, `attempt_answers`, `profiles`.

---

## Scripts Reference

```bash
npm run dev          # Start all packages in watch mode
npm run build        # Build all packages
npm run type-check   # TypeScript check across all packages
npm run lint         # ESLint across all packages
npm run db:start     # Start local Supabase (Docker)
npm run db:stop      # Stop local Supabase
npm run db:migrate   # Apply pending migrations
npm run db:reset     # Reset and re-apply all migrations
npm run db:seed      # Seed exam data from supabase/seed/
npm run db:types     # Regenerate TypeScript types from DB schema
npm run convert      # Run PDF → JSON converter CLI
```

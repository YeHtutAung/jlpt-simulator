# JLPT Simulator — Claude Agent Master Guide

## ⚠️ READ THIS ENTIRE FILE BEFORE WRITING ANY CODE

---

## 🎯 Project Overview

A full-stack JLPT exam simulator supporting:
- All levels: N1, N2, N3, N4, N5
- Multiple years of past papers (2010 onwards)
- Two modes: Full Exam (timed, strict) + Practice (relaxed)
- PDF → JSON conversion pipeline for adding new papers
- SVG-first approach for question images

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend (exam app) | React + TypeScript + Vite + TailwindCSS |
| Frontend (admin) | React + TypeScript + Vite + TailwindCSS |
| State management | Zustand + React Query |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Hosting | Vercel (2 deployments: web + admin) |
| Monorepo | Turborepo + npm workspaces |
| Validation | Zod (in @jlpt/shared) |

---

## 📁 Project Structure

```
jlpt-simulator/
├── .claude/              ← YOU ARE HERE (read all files here first)
├── packages/
│   ├── web/              ← Main exam app (Vercel deployment 1)
│   ├── admin/            ← Admin panel (Vercel deployment 2)
│   └── shared/           ← Shared types, schemas, utils
├── supabase/
│   ├── migrations/       ← SQL migrations (versioned)
│   ├── functions/        ← Edge functions
│   └── seed/             ← Exam JSON seed data
└── tools/
    └── converter/        ← PDF → JSON pipeline
```

---

## 📍 Current Status

→ See `.claude/progress/in_progress.md` for active task
→ See `.claude/progress/completed.md` for what is done
→ See `.claude/progress/todo.md` for what is next

---

## 🗄️ Database

→ See `.claude/context/database.md` for full schema details
→ Migrations in: `supabase/migrations/`
→ Always run after schema changes: `npm run db:types`

---

## 🎨 Frontend

→ See `.claude/context/frontend.md` for component patterns
→ Shared types MUST come from `@jlpt/shared`
→ Never redefine types locally

---

## 🔧 Converter Tool

→ See `.claude/context/converter.md` for pipeline details
→ JSON schema defined in `@jlpt/shared/schemas/exam.schema.ts`
→ All output validated against Zod schema before saving

---

## 🚨 RULES — NEVER BREAK THESE

1. **Always import types from `@jlpt/shared`** — never redefine locally
2. **Never use `any` type** — use `unknown` and narrow it
3. **Always validate external data with Zod** before using it
4. **Follow naming conventions** → `.claude/conventions/naming.md`
5. **Update `.claude/progress/` files** at end of every session
6. **Never hardcode level configs** — use `LEVEL_CONFIGS` from `@jlpt/shared`
7. **Check `completed.md` before building** — don't rebuild what exists
8. **Every DB change needs a new migration file** — never edit existing ones
9. **Supabase types must be regenerated** after every migration:
   `npm run db:types`
10. **Audio/image URLs always go through Supabase Storage** — no direct file refs

---

## 🤖 Instructions For Claude Code Agent

### START of every session:
```
1. Read this entire file (CLAUDE.md)
2. Read .claude/progress/in_progress.md
3. Read .claude/progress/completed.md
4. Run: git log --oneline -10
5. Read the relevant .claude/context/*.md
   for the area you are working on
```

### DURING the session:
```
- Follow conventions in .claude/conventions/
- Use types from packages/shared/src/types/
- Check .claude/decisions/ before making arch choices
- If unsure about something → check docs first, ask if still unclear
```

### END of every session:
```
1. Move completed items to .claude/progress/completed.md
2. Update .claude/progress/in_progress.md with true current state
3. Update .claude/progress/todo.md
4. If you made an architecture decision → add to .claude/decisions/
5. Commit everything including .claude/ changes
```

### If you are UNSURE:
```
- Check .claude/decisions/ first
- Check .claude/conventions/ before writing code
- Never guess naming — check naming.md
- Never guess DB schema — check database.md
```

---

## 🔑 Key Commands

```bash
# Development
npm run dev               # Start all packages

# Database
npm run db:start          # Start local Supabase
npm run db:migrate        # Apply migrations
npm run db:reset          # Reset local DB
npm run db:types          # Regenerate TypeScript types
npm run db:seed           # Seed exam data

# Converter
npm run convert -- --input=<file> --level=N5 --year=2017 --month=december

# Build
npm run build             # Build all packages
npm run type-check        # Check TypeScript
```

---

## 📦 Package Names

| Package | Import as |
|---|---|
| packages/shared | @jlpt/shared |
| packages/web | (not imported, it's an app) |
| packages/admin | (not imported, it's an app) |
| tools/converter | (not imported, it's a CLI tool) |

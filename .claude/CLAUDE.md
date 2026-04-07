# JLPT Simulator — Agent Guide

## Stack
React+TS+Vite+Tailwind | Zustand+ReactQuery | Supabase (PG+Auth+Storage+EdgeFn) | Vercel (web+admin) | Turborepo+npm workspaces | Zod

## Structure
```
packages/web       — exam app (Vercel 1)
packages/admin     — admin panel (Vercel 2)
packages/shared    — @jlpt/shared: types, schemas, utils
supabase/migrations/ | supabase/functions/ | supabase/seed/
tools/converter/   — PDF→JSON pipeline
```

## Status → progress/in_progress.md | completed.md | todo.md
## DB schema → context/database.md | Migrations: supabase/migrations/
## Frontend → context/frontend.md
## Converter → context/converter.md

## Rules ⚠️ NEVER BREAK
1. Types from `@jlpt/shared` only — never redefine locally
2. No `any` — use `unknown` + narrow
3. Validate external data with Zod before use
4. Follow conventions/naming.md
5. Update progress/ at end of every session
6. Use `LEVEL_CONFIGS` from `@jlpt/shared` — no hardcoded level data
7. Check completed.md before building — don't rebuild existing work
8. Every DB change = new migration file, never edit existing ones
9. After every migration: `npm run db:types`
10. Audio/image URLs via Supabase Storage only — no direct file refs

## Agent: START
1. Read CLAUDE.md
2. Read progress/in_progress.md + completed.md
3. `git log --oneline -10`
4. Read relevant context/*.md for area being worked on

## Agent: DURING
1. Follow conventions/naming.md + conventions/typescript.md
2. Use types from packages/shared/src/types/
3. Check decisions/ before arch choices

## Agent: END
1. Move done items → progress/completed.md
2. Update progress/in_progress.md (true current state)
3. Update progress/todo.md
4. New arch choice → add to decisions/
5. Commit everything including .claude/

## Agent: IF UNSURE
1. Check decisions/ first
2. Check conventions/ (naming.md, typescript.md)
3. Check context/database.md for schema — never guess

## Commands
```bash
npm run dev          # all packages
npm run db:start     # local Supabase
npm run db:migrate   # apply migrations (supabase db push)
npm run db:reset     # reset local DB
npm run db:types     # regen supabase/types.ts
npm run db:seed      # seed exam data
npm run db:verify    # verify seed integrity
npm run build        # all packages
npm run type-check   # TypeScript check
npm run convert -- --input=<f> --level=N5 --year=2017 --month=december
```

## Packages
| Import | Location |
|---|---|
| `@jlpt/shared` | packages/shared |
| apps | packages/web, packages/admin (not imported) |
| CLI | tools/converter (not imported) |

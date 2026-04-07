# Naming Conventions

## Files
React components/pages: `PascalCase.tsx` | Hooks: `useXxx.ts` | Stores: `xxxStore.ts` | Utils: `camelCase.ts` | Types: `camelCase.types.ts` | Schemas: `camelCase.schema.ts` | SQL migrations: `NNNNN_description.sql`

## TypeScript
Interfaces/Types/Enums: `PascalCase` | Constants: `UPPER_SNAKE_CASE` | Functions/hooks: `camelCase`/`useXxx` | Named exports only — no default exports

## Database
Tables: `snake_case` plural | Columns: `snake_case` | FKs: `{table}_id` | Indexes: `idx_{table}_{col}` | Functions/triggers: `snake_case`

## JSON/API
Keys: `snake_case` | Group IDs: `{level}-{year}-{section}-g{n}` e.g. `n5-2017-v-g1` | Audio: `{level}/{year}/{month}/q{n}.mp3` | Images: `{level}/{year}/{month}/{file}.png`
Section abbrevs: `v`=vocabulary `gr`=grammar_reading `l`=listening

## CSS
CSS variables for theme colors | `jlpt-` prefix for custom classes | Component styles in component file (not globals)

## Git
`type(scope): description` — types: feat/fix/refactor/docs/chore/test

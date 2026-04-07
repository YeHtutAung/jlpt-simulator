# TypeScript Conventions

## Rules
- Import types from `@jlpt/shared` only — never redefine locally
- No `any` — use `unknown` + narrow with Zod or `instanceof`
- Validate all external data: `ExamSchema.safeParse(raw)` before use
- Always destructure `{ data, error }` from Supabase queries; throw on error
- Async functions must handle errors (try/catch or `.catch`)
- Named exports only — no `export default`
- No `@ts-ignore` — fix the type issue
- No non-null assertion `!` unless provably safe
- Catch clauses: `err instanceof Error ? err.message : 'Unknown error'`

## Component Structure
```typescript
// 1. imports (external → internal → types)
// 2. interface XxxProps { ... }
// 3. export function Xxx({ ... }: XxxProps) {
//      hooks → derived state → handlers → return JSX
//    }
```

## Zustand Store Structure
```typescript
interface XxxStore { /* state */ /* actions */ }
export const useXxxStore = create<XxxStore>((set, get) => ({ ... }))
```

## Supabase
```typescript
import type { Database } from '@/../../supabase/types'
const { data, error } = await supabase.from('exams').select('*')
if (error) throw new Error(error.message)
```

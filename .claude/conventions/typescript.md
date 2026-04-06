# TypeScript Conventions

---

## Imports — Always use @jlpt/shared

```typescript
// ✅ CORRECT — import from shared package
import type { Exam, ExamSection, ExamQuestion } from '@jlpt/shared'
import { ExamSchema, LEVEL_CONFIGS, calculateSectionScore } from '@jlpt/shared'

// ❌ WRONG — never redefine types locally
interface Exam { ... }  // NO! Already exists in @jlpt/shared
```

---

## No `any` Types

```typescript
// ✅ CORRECT
const data: unknown = await response.json()
const exam = ExamSchema.parse(data)  // Zod validates + types

// ❌ WRONG
const data: any = await response.json()
```

---

## Always Validate External Data

```typescript
// ✅ CORRECT — validate JSON from any external source
import { ExamSchema } from '@jlpt/shared'

const rawJson = JSON.parse(fileContent)
const result = ExamSchema.safeParse(rawJson)

if (!result.success) {
  console.error('Invalid exam JSON:', result.error.format())
  process.exit(1)
}

const exam = result.data  // fully typed, validated
```

---

## Async Functions — Always handle errors

```typescript
// ✅ CORRECT
async function fetchExam(id: string): Promise<Exam | null> {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('fetchExam failed:', err)
    return null
  }
}

// ❌ WRONG — unhandled promise
const exam = await fetchExam(id)  // no error handling
```

---

## Supabase Queries

```typescript
// ✅ CORRECT — always destructure error
const { data, error } = await supabase.from('exams').select('*')
if (error) throw new Error(error.message)

// ✅ Use generated types
import type { Database } from '@/../../supabase/types'
const supabase = createClient<Database>(url, key)
```

---

## React Components

```typescript
// ✅ CORRECT — explicit props interface
interface QuestionCardProps {
  question: ExamQuestion
  selectedOption: number | null
  onSelect: (option: number) => void
  disabled?: boolean
}

export function QuestionCard({
  question,
  selectedOption,
  onSelect,
  disabled = false,
}: QuestionCardProps) {
  // ...
}

// ❌ WRONG — inline props without interface
export function QuestionCard({ question, onSelect }: { question: any, onSelect: any }) {}
```

---

## Zustand Stores

```typescript
// ✅ CORRECT pattern for all stores
import { create } from 'zustand'

interface ExamStore {
  // State
  currentQuestion: number
  // Actions
  nextQuestion: () => void
}

export const useExamStore = create<ExamStore>((set, get) => ({
  currentQuestion: 0,
  nextQuestion: () => set(state => ({
    currentQuestion: state.currentQuestion + 1
  })),
}))
```

---

## File Structure Rules

```typescript
// Each component file structure:

// 1. Imports (external → internal → types)
import { useState } from 'react'
import type { ExamQuestion } from '@jlpt/shared'

// 2. Types/interfaces
interface Props { ... }

// 3. Component (named export, not default)
export function QuestionCard({ ... }: Props) {
  // hooks first
  // derived state
  // handlers
  // render
}
```

---

## Forbidden Patterns

```typescript
// ❌ No default exports for components
export default function QuestionCard() {}  // NO

// ✅ Named exports only
export function QuestionCard() {}  // YES

// ❌ No ts-ignore
// @ts-ignore  // NEVER

// ❌ No non-null assertion unless absolutely certain
const el = document.getElementById('app')!  // avoid

// ❌ No implicit any in catch
catch (e) { console.log(e.message) }  // NO
catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error'  // YES
}
```

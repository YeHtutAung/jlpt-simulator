import { describe, it, expect } from 'vitest'
import { validateExam } from '../validators/jsonValidator'
import type { ExamSchemaType } from '@jlpt/shared'

// ================================
// jsonValidator tests
// ================================

function makeQuestion(
  number: number,
  overrides: Partial<ExamSchemaType['sections'][0]['question_groups'][0]['questions'][0]> = {}
) {
  return {
    number,
    text: `Question ${number} text here`,
    options: [
      { number: 1 as const, text: 'Option A' },
      { number: 2 as const, text: 'Option B' },
      { number: 3 as const, text: 'Option C' },
      { number: 4 as const, text: 'Option D' },
    ],
    correct_answer: 1 as const,
    ...overrides,
  }
}

function makeGroup(
  id: string,
  orderIndex: number,
  questions: ReturnType<typeof makeQuestion>[]
): ExamSchemaType['sections'][0]['question_groups'][0] {
  return {
    id,
    type: 'text_only',
    order_index: orderIndex,
    questions,
  }
}

function makeValidExam(): ExamSchemaType {
  return {
    meta: { level: 'N5', year: 2017, month: 'december', status: 'published' },
    sections: [
      {
        type:       'vocabulary',
        time_limit: 25,
        order_index: 0,
        question_groups: [
          makeGroup('n5-2017-v-g1', 0, [makeQuestion(1), makeQuestion(2)]),
        ],
      },
    ],
  }
}

describe('validateExam — valid input', () => {
  it('returns parsed data for a valid exam', () => {
    const exam = makeValidExam()
    const result = validateExam(exam)
    expect(result.meta.level).toBe('N5')
    expect(result.sections).toHaveLength(1)
  })

  it('accepts 3-option questions (listening sections)', () => {
    const exam = makeValidExam()
    exam.sections[0].question_groups[0].questions[0].options = [
      { number: 1 as const, text: 'A' },
      { number: 2 as const, text: 'B' },
      { number: 3 as const, text: 'C' },
    ]
    expect(() => validateExam(exam)).not.toThrow()
  })

  it('accepts all valid levels', () => {
    for (const level of ['N1', 'N2', 'N3', 'N4', 'N5'] as const) {
      const exam = makeValidExam()
      exam.meta.level = level
      expect(() => validateExam(exam)).not.toThrow()
    }
  })

  it('accepts july and december months', () => {
    const exam = makeValidExam()
    exam.meta.month = 'july'
    expect(() => validateExam(exam)).not.toThrow()
  })
})

describe('validateExam — invalid input', () => {
  it('throws on missing level', () => {
    const exam = makeValidExam()
    // @ts-expect-error intentional invalid input
    exam.meta.level = 'N6'
    expect(() => validateExam(exam)).toThrow()
  })

  it('throws on year out of range', () => {
    const exam = makeValidExam()
    exam.meta.year = 2009
    expect(() => validateExam(exam)).toThrow()
  })

  it('throws on empty questions array', () => {
    const exam = makeValidExam()
    exam.sections[0].question_groups[0].questions = []
    expect(() => validateExam(exam)).toThrow()
  })

  it('throws on correct_answer outside 1-4', () => {
    const exam = makeValidExam()
    // @ts-expect-error intentional invalid input
    exam.sections[0].question_groups[0].questions[0].correct_answer = 5
    expect(() => validateExam(exam)).toThrow()
  })

  it('throws on missing question text', () => {
    const exam = makeValidExam()
    exam.sections[0].question_groups[0].questions[0].text = ''
    expect(() => validateExam(exam)).toThrow()
  })

  it('throws on invalid month', () => {
    const exam = makeValidExam()
    // @ts-expect-error intentional invalid input
    exam.meta.month = 'march'
    expect(() => validateExam(exam)).toThrow()
  })

  it('throws on too few options (< 3)', () => {
    const exam = makeValidExam()
    exam.sections[0].question_groups[0].questions[0].options = [
      { number: 1 as const, text: 'A' },
      { number: 2 as const, text: 'B' },
    ]
    expect(() => validateExam(exam)).toThrow()
  })

  it('throws on null input', () => {
    expect(() => validateExam(null)).toThrow()
  })
})

describe('validateExam — structural warnings (non-throwing)', () => {
  it('does not throw on non-sequential question numbers (only warns)', () => {
    const exam = makeValidExam()
    // Jump from Q1 to Q3 — gap warning but not a hard error
    exam.sections[0].question_groups[0].questions = [
      makeQuestion(1),
      makeQuestion(3),   // gap
    ]
    expect(() => validateExam(exam)).not.toThrow()
  })
})

import { create } from 'zustand'
import type { Exam, ExamMode } from '@jlpt/shared'

// ================================
// Types
// ================================

interface ExamPosition {
  sectionIndex: number
  groupIndex: number
  questionIndex: number
}

interface ExamStore {
  // ── Data ──────────────────────────────────
  exam: Exam | null
  attemptId: string | null
  mode: ExamMode

  // ── Navigation ────────────────────────────
  position: ExamPosition
  visitedQuestions: Set<string>   // "sIdx-gIdx-qIdx"

  // ── Answers ───────────────────────────────
  answers: Record<string, number>        // questionId → option (1-4)
  flagged: Set<string>                   // questionIds
  timeSpent: Record<string, number>      // questionId → seconds
  questionStartTime: number | null       // Date.now() when question shown

  // ── Timer ─────────────────────────────────
  timeRemaining: number                  // seconds
  timerActive: boolean

  // ── Status ────────────────────────────────
  isSubmitting: boolean
  isComplete: boolean
  showWarning: boolean                   // timer < 5 min

  // ── Actions ───────────────────────────────
  initExam: (exam: Exam, mode: ExamMode, attemptId: string) => void
  selectAnswer: (questionId: string, option: number) => void
  toggleFlag: (questionId: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  jumpTo: (position: ExamPosition) => void
  tickTimer: () => void
  submitExam: () => Promise<void>
  resetExam: () => void
}

// ================================
// Helpers
// ================================

function getQuestionId(exam: Exam, pos: ExamPosition): string | null {
  try {
    const section = exam.sections[pos.sectionIndex]
    const group = section.question_groups[pos.groupIndex]
    const question = group.questions[pos.questionIndex]
    return `${pos.sectionIndex}-${pos.groupIndex}-${pos.questionIndex}-${question.number}`
  } catch {
    return null
  }
}

function getNextPosition(exam: Exam, pos: ExamPosition): ExamPosition | null {
  const section = exam.sections[pos.sectionIndex]
  const group = section.question_groups[pos.groupIndex]

  // Next question in same group
  if (pos.questionIndex < group.questions.length - 1) {
    return { ...pos, questionIndex: pos.questionIndex + 1 }
  }

  // Next group in same section
  if (pos.groupIndex < section.question_groups.length - 1) {
    return { ...pos, groupIndex: pos.groupIndex + 1, questionIndex: 0 }
  }

  // Next section
  if (pos.sectionIndex < exam.sections.length - 1) {
    return { sectionIndex: pos.sectionIndex + 1, groupIndex: 0, questionIndex: 0 }
  }

  return null // exam complete
}

function getPrevPosition(exam: Exam, pos: ExamPosition): ExamPosition | null {
  // Prev question in same group
  if (pos.questionIndex > 0) {
    return { ...pos, questionIndex: pos.questionIndex - 1 }
  }

  // Prev group in same section
  if (pos.groupIndex > 0) {
    const prevGroup = exam.sections[pos.sectionIndex]
      .question_groups[pos.groupIndex - 1]
    return {
      ...pos,
      groupIndex: pos.groupIndex - 1,
      questionIndex: prevGroup.questions.length - 1,
    }
  }

  // Prev section
  if (pos.sectionIndex > 0) {
    const prevSection = exam.sections[pos.sectionIndex - 1]
    const lastGroup = prevSection.question_groups[prevSection.question_groups.length - 1]
    return {
      sectionIndex: pos.sectionIndex - 1,
      groupIndex: prevSection.question_groups.length - 1,
      questionIndex: lastGroup.questions.length - 1,
    }
  }

  return null // already at start
}

// ================================
// Store
// ================================

const INITIAL_POSITION: ExamPosition = {
  sectionIndex: 0,
  groupIndex: 0,
  questionIndex: 0,
}

export const useExamStore = create<ExamStore>((set, get) => ({
  // Initial state
  exam: null,
  attemptId: null,
  mode: 'practice',
  position: INITIAL_POSITION,
  visitedQuestions: new Set(),
  answers: {},
  flagged: new Set(),
  timeSpent: {},
  questionStartTime: null,
  timeRemaining: 0,
  timerActive: false,
  isSubmitting: false,
  isComplete: false,
  showWarning: false,

  initExam: (exam, mode, attemptId) => {
    const firstSection = exam.sections[0]
    set({
      exam,
      mode,
      attemptId,
      position: INITIAL_POSITION,
      answers: {},
      flagged: new Set(),
      timeSpent: {},
      visitedQuestions: new Set(['0-0-0']),
      timeRemaining: firstSection.time_limit * 60,
      timerActive: true,
      isComplete: false,
      isSubmitting: false,
      questionStartTime: Date.now(),
    })
  },

  selectAnswer: (questionId, option) => {
    set(state => ({
      answers: { ...state.answers, [questionId]: option },
    }))
  },

  toggleFlag: (questionId) => {
    set(state => {
      const flagged = new Set(state.flagged)
      if (flagged.has(questionId)) {
        flagged.delete(questionId)
      } else {
        flagged.add(questionId)
      }
      return { flagged }
    })
  },

  nextQuestion: () => {
    const { exam, position, questionStartTime, timeSpent } = get()
    if (!exam) return

    const questionId = getQuestionId(exam, position)
    const nextPos = getNextPosition(exam, position)

    // Record time spent on current question
    const elapsed = questionStartTime
      ? Math.floor((Date.now() - questionStartTime) / 1000)
      : 0

    const newTimeSpent = questionId
      ? { ...timeSpent, [questionId]: (timeSpent[questionId] ?? 0) + elapsed }
      : timeSpent

    if (!nextPos) {
      // No next question = exam complete
      set({ timeSpent: newTimeSpent, isComplete: true })
      return
    }

    const posKey = `${nextPos.sectionIndex}-${nextPos.groupIndex}-${nextPos.questionIndex}`

    set(state => ({
      position: nextPos,
      timeSpent: newTimeSpent,
      questionStartTime: Date.now(),
      visitedQuestions: new Set([...state.visitedQuestions, posKey]),
    }))
  },

  prevQuestion: () => {
    const { exam, position } = get()
    if (!exam) return
    const prevPos = getPrevPosition(exam, position)
    if (prevPos) {
      set({ position: prevPos, questionStartTime: Date.now() })
    }
  },

  jumpTo: (position) => {
    const posKey = `${position.sectionIndex}-${position.groupIndex}-${position.questionIndex}`
    set(state => ({
      position,
      questionStartTime: Date.now(),
      visitedQuestions: new Set([...state.visitedQuestions, posKey]),
    }))
  },

  tickTimer: () => {
    set(state => {
      const newTime = state.timeRemaining - 1
      const showWarning = newTime <= 300 // 5 minutes
      const shouldAutoSubmit = newTime <= 0 && state.mode === 'full_exam'

      if (shouldAutoSubmit) {
        get().submitExam()
        return { timeRemaining: 0, timerActive: false, showWarning: true }
      }

      return { timeRemaining: newTime, showWarning }
    })
  },

  submitExam: async () => {
    const { exam, answers, flagged, timeSpent, attemptId, mode } = get()
    if (!exam || !attemptId) return

    set({ isSubmitting: true })

    try {
      // Submit to Supabase Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-exam`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            answers,
            flagged: Array.from(flagged),
            timeSpent,
          }),
        }
      )

      if (!response.ok) throw new Error('Submit failed')

      set({ isComplete: true, timerActive: false, isSubmitting: false })
    } catch (err) {
      console.error('submitExam error:', err)
      set({ isSubmitting: false })
    }
  },

  resetExam: () => {
    set({
      exam: null,
      attemptId: null,
      position: INITIAL_POSITION,
      answers: {},
      flagged: new Set(),
      timeSpent: {},
      visitedQuestions: new Set(),
      timeRemaining: 0,
      timerActive: false,
      isComplete: false,
      isSubmitting: false,
      showWarning: false,
      questionStartTime: null,
    })
  },
}))

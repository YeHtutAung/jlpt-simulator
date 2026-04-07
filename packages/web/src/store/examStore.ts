import { create } from 'zustand'
import type { Exam, ExamMode } from '@jlpt/shared'
import { supabase } from '@/lib/supabase'

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
  answers: Record<string, number>        // question.number (string) → option (1-4)
  flagged: Set<string>                   // question.number strings
  timeSpent: Record<string, number>      // question.number (string) → seconds
  questionStartTime: number | null       // Date.now() when question shown

  // ── Timer ─────────────────────────────────
  timeRemaining: number                  // seconds for current section
  timerActive: boolean

  // ── Status ────────────────────────────────
  isSubmitting: boolean
  isSectionComplete: boolean  // end of current section — pending advance to next
  isComplete: boolean         // end of last section — pending exam submit
  isSubmitted: boolean        // submit-exam Edge Function call succeeded
  showWarning: boolean        // timer < 5 min

  // ── Actions ───────────────────────────────
  initExam: (exam: Exam, mode: ExamMode, attemptId: string) => void
  selectAnswer: (questionId: string, option: number) => void
  toggleFlag: (questionId: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  jumpTo: (position: ExamPosition) => void
  advanceSection: () => void
  tickTimer: () => void
  submitExam: () => Promise<void>
  resetExam: () => void
}

// ================================
// Helpers
// ================================

// questionId = String(question.number) — globally unique per exam, matches Edge Function
function getQuestionId(exam: Exam, pos: ExamPosition): string | null {
  try {
    const section = exam.sections[pos.sectionIndex]
    const group = section.question_groups[pos.groupIndex]
    const question = group.questions[pos.questionIndex]
    return String(question.number)
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

  return null // exam complete (past last question of last section)
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
  isSectionComplete: false,
  isComplete: false,
  isSubmitted: false,
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
      isSectionComplete: false,
      isComplete: false,
      isSubmitted: false,
      isSubmitting: false,
      showWarning: false,
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
    const { exam, position, mode, questionStartTime, timeSpent } = get()
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
      // Past the last question of the last section → submit prompt
      set({ timeSpent: newTimeSpent, isComplete: true })
      return
    }

    // Section boundary in full_exam mode → pause and show section-complete modal
    if (nextPos.sectionIndex !== position.sectionIndex && mode === 'full_exam') {
      set({ timeSpent: newTimeSpent, isSectionComplete: true })
      return
    }

    // Normal navigation (within section, or cross-section in practice mode)
    const posKey = `${nextPos.sectionIndex}-${nextPos.groupIndex}-${nextPos.questionIndex}`
    set(state => ({
      position: nextPos,
      timeSpent: newTimeSpent,
      questionStartTime: Date.now(),
      visitedQuestions: new Set([...state.visitedQuestions, posKey]),
    }))
  },

  prevQuestion: () => {
    const { exam, position, mode } = get()
    if (!exam) return

    // In full_exam mode, cannot navigate back to a previous section
    const isAtSectionStart = position.questionIndex === 0 && position.groupIndex === 0
    if (mode === 'full_exam' && isAtSectionStart && position.sectionIndex > 0) return

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

  advanceSection: () => {
    const { exam, position } = get()
    if (!exam) return
    const nextSectionIndex = position.sectionIndex + 1
    if (nextSectionIndex >= exam.sections.length) return
    const nextSection = exam.sections[nextSectionIndex]
    set({
      position: { sectionIndex: nextSectionIndex, groupIndex: 0, questionIndex: 0 },
      timeRemaining: nextSection.time_limit * 60,
      timerActive: true,
      isSectionComplete: false,
      questionStartTime: Date.now(),
      visitedQuestions: new Set([`${nextSectionIndex}-0-0`]),
      showWarning: false,
    })
  },

  tickTimer: () => {
    const state = get()
    const newTime = state.timeRemaining - 1
    const showWarning = newTime <= 300 // 5 minutes

    if (newTime <= 0 && state.mode === 'full_exam') {
      const { exam, position } = state
      if (exam) {
        const isLastSection = position.sectionIndex >= exam.sections.length - 1
        if (isLastSection) {
          // Last section timer expired → submit exam
          set({ timeRemaining: 0, timerActive: false, showWarning: true })
          get().submitExam().catch(err => console.error('Auto-submit failed:', err))
        } else {
          // Non-last section timer expired → auto-advance to next section
          get().advanceSection()
        }
        return
      }
    }

    set({ timeRemaining: newTime, showWarning })
  },

  submitExam: async () => {
    const { exam, answers, flagged, timeSpent, attemptId } = get()
    if (!exam || !attemptId) return

    set({ isSubmitting: true })

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-exam`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({
            attemptId,
            answers,
            flagged: Array.from(flagged),
            timeSpent,
          }),
        }
      )

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`Submit failed (${response.status})${text ? `: ${text}` : ''}`)
      }

      set({ isComplete: true, isSubmitted: true, timerActive: false, isSubmitting: false })
    } catch (err) {
      set({ isSubmitting: false })
      throw err
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
      isSectionComplete: false,
      isComplete: false,
      isSubmitted: false,
      isSubmitting: false,
      showWarning: false,
      questionStartTime: null,
    })
  },
}))

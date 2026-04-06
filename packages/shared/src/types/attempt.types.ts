import type { JLPTLevel, ExamMonth, ExamMode, SectionType } from './exam.types'

// ================================
// Attempt Types
// ================================

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'

export interface SectionScore {
  section_type: SectionType
  correct: number
  total: number
  percentage: number
  time_spent: number        // seconds
}

export interface AttemptScoreJson {
  total_correct: number
  total_questions: number
  total_percentage: number
  sections: SectionScore[]
  completed_at: string      // ISO timestamp
}

export interface Attempt {
  id: string
  user_id: string
  exam_id: string
  mode: ExamMode
  status: AttemptStatus
  started_at: string
  completed_at?: string
  score_json?: AttemptScoreJson
}

export interface UserAnswer {
  id: string
  attempt_id: string
  question_id: string
  selected_option: 1 | 2 | 3 | 4
  is_correct: boolean
  time_spent: number        // seconds on this question
  flagged: boolean
}

// ================================
// Review Types (for answer review screen)
// ================================

export interface ReviewQuestion {
  question_number: number
  question_text: string
  options: { number: number; text: string }[]
  correct_answer: number
  selected_answer: number
  is_correct: boolean
  explanation?: string
  flagged: boolean
  time_spent: number
}

export interface ReviewSection {
  section_type: SectionType
  score: SectionScore
  questions: ReviewQuestion[]
}

export interface AttemptReview {
  attempt: Attempt
  sections: ReviewSection[]
}

// ================================
// History / Stats Types
// ================================

export interface ExamHistoryItem {
  attempt_id: string
  level: JLPTLevel
  year: number
  month: ExamMonth
  mode: ExamMode
  completed_at: string
  total_percentage: number
  section_scores: SectionScore[]
}

export interface UserStats {
  total_attempts: number
  average_score: number
  best_score: number
  scores_by_level: Record<JLPTLevel, number>
  recent_trend: number[]    // last 10 scores
  weak_sections: SectionType[]
}

import type { SectionType } from '../types/exam.types'

// ================================
// Scoring Utilities
// ================================

export interface QuestionResult {
  question_id: string
  is_correct: boolean
  section_type: SectionType
  time_spent: number
}

export function calculateSectionScore(
  results: QuestionResult[],
  sectionType: SectionType
) {
  const sectionResults = results.filter(r => r.section_type === sectionType)
  const correct = sectionResults.filter(r => r.is_correct).length
  const total = sectionResults.length
  const time_spent = sectionResults.reduce((sum, r) => sum + r.time_spent, 0)

  return {
    section_type: sectionType,
    correct,
    total,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    time_spent,
  }
}

export function calculateTotalScore(results: QuestionResult[]) {
  const correct = results.filter(r => r.is_correct).length
  const total = results.length
  return {
    total_correct: correct,
    total_questions: total,
    total_percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
  }
}

export function isPassing(percentage: number, level: string): boolean {
  // JLPT passing thresholds vary by level
  // These are approximate overall pass thresholds
  const thresholds: Record<string, number> = {
    N1: 60,
    N2: 60,
    N3: 60,
    N4: 60,
    N5: 60,
  }
  return percentage >= (thresholds[level] ?? 60)
}

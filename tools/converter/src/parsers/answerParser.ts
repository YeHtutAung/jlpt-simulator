import { normalizeText } from '../extractors/pdfExtractor'

// ================================
// Answer Key Parser
// Parses the answer key PDF text into a map of
// questionNumber → correctAnswer (1-4)
// ================================

export type AnswerMap = Record<number, 1 | 2 | 3 | 4>

/**
 * Parses the raw text from the answer key PDF.
 *
 * The answer key PDF typically has rows like:
 *   問題番号  解答
 *   1         2
 *   2         4
 *   ...
 *
 * Or in tabular form with question numbers and answers side-by-side.
 * This parser handles both formats.
 */
export function parseAnswers(rawText: string): AnswerMap {
  const normalized = normalizeText(rawText)
  const map: AnswerMap = {}

  // Strategy 1: Look for lines with number + answer pairs
  // Matches: "1  2", "12 3", "（1） 2" etc.
  const pairPattern = /[（(]?\s*(\d{1,2})\s*[）)]?\s+([1-4])/g
  let match: RegExpExecArray | null

  while ((match = pairPattern.exec(normalized)) !== null) {
    const qNum  = parseInt(match[1], 10)
    const ans   = parseInt(match[2], 10) as 1 | 2 | 3 | 4

    // Sanity check: JLPT questions are numbered 1-100
    if (qNum >= 1 && qNum <= 100 && ans >= 1 && ans <= 4) {
      // Only set if not already found (first match wins)
      if (!(qNum in map)) {
        map[qNum] = ans
      }
    }
  }

  // Strategy 2: Look for answer blocks — rows of just numbers
  // e.g. lines like "2 4 1 3 2" where position = question offset
  if (Object.keys(map).length === 0) {
    map = parseTabularAnswers(normalized)
  }

  if (Object.keys(map).length === 0) {
    console.warn('⚠️  Could not parse any answers from answer key PDF')
    console.warn('    The converter will produce placeholders (answer=1) — fix manually!')
  }

  return map
}

/**
 * Fallback parser for tabular answer keys where answers are in
 * blocks of numbers on consecutive lines.
 *
 * Example:
 *   もんだい1  2 4 1 3 2 1 4
 *   もんだい2  3 2 1 4 2 3
 */
function parseTabularAnswers(text: string): AnswerMap {
  const map: AnswerMap = {}
  const lines  = text.split('\n')
  let qCounter = 1

  for (const line of lines) {
    // Skip header lines, page numbers, Japanese labels
    if (/[ぁ-んァ-ン一-龯]/.test(line) && !/^\s*[1-4]/.test(line)) continue

    const nums = line.trim().split(/\s+/).map(Number).filter((n) => n >= 1 && n <= 4)
    for (const n of nums) {
      map[qCounter++] = n as 1 | 2 | 3 | 4
    }
  }

  return map
}

/**
 * Looks up the correct answer for a question number.
 * Returns 1 as a safe fallback if the answer is missing (with a warning).
 */
export function getAnswer(map: AnswerMap, questionNumber: number): 1 | 2 | 3 | 4 {
  const answer = map[questionNumber]
  if (answer === undefined) {
    console.warn(`⚠️  No answer found for question ${questionNumber} — defaulting to 1`)
    return 1
  }
  return answer
}

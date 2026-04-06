import type { ExamQuestionGroupSchemaType } from '@jlpt/shared'
import { normalizeText, splitBySection } from '../extractors/pdfExtractor'
import { getAnswer, type AnswerMap } from './answerParser'
import { generateGroupId } from '../generators/jsonGenerator'

// ================================
// Vocabulary Section Parser
// Parses N5-style vocabulary PDF into ExamQuestionGroup[]
//
// N5 Vocabulary structure:
//   もんだい1 (Q1-Q10)  — Kanji reading (underline_word present)
//   もんだい2 (Q11-Q15) — Hiragana → Kanji
//   もんだい3 (Q16-Q22) — Contextual meaning
//   もんだい4 (Q23-Q28) — Usage / antonym
//   もんだい5 (Q29-Q33) — Word ordering
// ================================

const VOCAB_SECTION_MARKER = 'もんだい'
const OPTION_PATTERN        = /^[1-4１-４]\s+(.+)/

/**
 * Parses the vocabulary PDF text into question groups.
 * Vocabulary questions start at Q1.
 */
export function parseVocabulary(
  rawText:   string,
  answerMap: AnswerMap,
  level:     string,
  year:      number
): ExamQuestionGroupSchemaType[] {
  const normalized = normalizeText(rawText)
  const sections   = splitBySection(normalized, VOCAB_SECTION_MARKER)

  if (sections.length === 0) {
    console.warn('⚠️  No もんだい sections found in vocabulary PDF — check input file')
    return []
  }

  const groups: ExamQuestionGroupSchemaType[] = []
  let   globalQNum = 1     // N5 vocab starts at Q1

  for (let i = 0; i < sections.length; i++) {
    const sectionText = sections[i]
    const groupIndex  = i

    const instructions = extractInstructions(sectionText)
    const questions    = parseQuestionsFromSection(sectionText, answerMap, globalQNum)

    if (questions.length === 0) continue

    const groupType = groupIndex === 0
      ? 'text_only'   // もんだい1 has underline_word (kanji reading)
      : 'text_only'   // all vocab groups are text_only

    groups.push({
      id:           generateGroupId(level, year, 'v', groupIndex + 1),
      type:         groupType,
      order_index:  groupIndex,
      instructions,
      questions,
    })

    globalQNum += questions.length
  }

  return groups
}

function extractInstructions(sectionText: string): string {
  // First non-empty line after the section marker is typically the instruction
  const lines = sectionText.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines[0] ?? ''
}

function parseQuestionsFromSection(
  text:        string,
  answerMap:   AnswerMap,
  startQNum:   number
): ExamQuestionGroupSchemaType['questions'] {
  const lines    = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const questions: ExamQuestionGroupSchemaType['questions'] = []

  let   qNum       = startQNum
  let   state: 'seeking' | 'in_question' | 'in_options' = 'seeking'
  let   currentText  = ''
  let   currentOpts: { number: 1 | 2 | 3 | 4; text: string }[] = []
  let   underlineWord: string | undefined

  for (const line of lines) {
    // Question start: line begins with a number in parentheses or standalone
    const qStart = line.match(/^[（(]?\s*(\d+)\s*[）)]?\s+(.+)/)
    if (qStart && isQuestionStart(line)) {
      // Save previous question if we were building one
      if (state === 'in_options' && currentOpts.length === 4) {
        questions.push(buildQuestion(qNum - 1, currentText, underlineWord, currentOpts, answerMap))
      }
      currentText  = qStart[2].trim()
      currentOpts  = []
      underlineWord = extractUnderlineWord(currentText)
      state        = 'in_question'
      continue
    }

    // Option lines: start with 1-4 (half or full width)
    const optMatch = line.match(/^([1-4１-４])\s+(.+)/)
    if (optMatch && (state === 'in_question' || state === 'in_options')) {
      const optNum = parseInt(normalizeFullWidth(optMatch[1]), 10) as 1 | 2 | 3 | 4
      currentOpts.push({ number: optNum, text: optMatch[2].trim() })
      state = 'in_options'

      if (currentOpts.length === 4) {
        questions.push(buildQuestion(qNum, currentText, underlineWord, currentOpts, answerMap))
        qNum++
        state       = 'seeking'
        currentText = ''
        currentOpts = []
        underlineWord = undefined
      }
      continue
    }

    // Continuation of question text
    if (state === 'in_question') {
      currentText += ' ' + line
    }
  }

  return questions
}

function isQuestionStart(line: string): boolean {
  return /^[（(]?\s*\d{1,2}\s*[）)]?\s+[^\d]/.test(line)
}

function extractUnderlineWord(questionText: string): string | undefined {
  // In kanji-reading questions, the underline word is often wrapped in 【】 or 「」
  const match = questionText.match(/[【「](.+?)[】」]/)
  return match ? match[1] : undefined
}

function buildQuestion(
  num:          number,
  text:         string,
  underlineWord: string | undefined,
  options:      { number: 1 | 2 | 3 | 4; text: string }[],
  answerMap:    AnswerMap
): ExamQuestionGroupSchemaType['questions'][number] {
  return {
    number:         num,
    text:           text.trim(),
    ...(underlineWord ? { underline_word: underlineWord } : {}),
    options:        options as [
      { number: 1; text: string },
      { number: 2; text: string },
      { number: 3; text: string },
      { number: 4; text: string },
    ],
    correct_answer: getAnswer(answerMap, num),
  }
}

function normalizeFullWidth(char: string): string {
  const code = char.charCodeAt(0)
  if (code >= 0xFF10 && code <= 0xFF19) {
    return String.fromCharCode(code - 0xFEE0)
  }
  return char
}

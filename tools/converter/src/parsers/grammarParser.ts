import type { ExamQuestionGroupSchemaType } from '@jlpt/shared'
import { normalizeText, splitBySection } from '../extractors/pdfExtractor'
import { getAnswer, type AnswerMap } from './answerParser'
import { generateGroupId } from '../generators/jsonGenerator'

// ================================
// Grammar + Reading Section Parser
// Parses N5-style grammar/reading PDF into ExamQuestionGroup[]
//
// N5 Grammar+Reading structure:
//   もんだい1 (Q34-Q38) — Fill in the blank grammar
//   もんだい2 (Q39-Q43) — Sentence ordering (★ marker)
//   もんだい3 (Q44-Q48) — Text + grammar questions
//   もんだい4 (Q49-Q55) — Short reading passages
//   もんだい5 (Q56-Q60) — Longer reading passage
//
// Vocabulary section has Q1-Q33, so grammar starts at Q34.
// ================================

const GRAMMAR_START_QNUM = 34
const SECTION_MARKER     = 'もんだい'

/**
 * Parses the grammar+reading PDF text into question groups.
 */
export function parseGrammar(
  rawText:   string,
  answerMap: AnswerMap,
  level:     string,
  year:      number
): ExamQuestionGroupSchemaType[] {
  const normalized = normalizeText(rawText)
  const sections   = splitBySection(normalized, SECTION_MARKER)

  if (sections.length === 0) {
    console.warn('⚠️  No もんだい sections found in grammar PDF — check input file')
    return []
  }

  const groups: ExamQuestionGroupSchemaType[] = []
  let   globalQNum = GRAMMAR_START_QNUM

  for (let i = 0; i < sections.length; i++) {
    const sectionText  = sections[i]
    const instructions = extractInstructions(sectionText)
    const groupType    = detectGroupType(i)
    const passage      = extractPassage(sectionText, groupType)
    const questions    = parseQuestionsFromSection(
      sectionText, answerMap, globalQNum, groupType
    )

    if (questions.length === 0) continue

    const group: ExamQuestionGroupSchemaType = {
      id:           generateGroupId(level, year, 'gr', i + 1),
      type:         groupType,
      order_index:  i,
      instructions,
      questions,
    }

    if (passage) group.passage_text = passage

    groups.push(group)
    globalQNum += questions.length
  }

  return groups
}

/**
 * Detects the group type based on position in the grammar section.
 * もんだい2 is sentence_order; もんだい3+ with passages are text_with_passage.
 */
function detectGroupType(sectionIndex: number): ExamQuestionGroupSchemaType['type'] {
  if (sectionIndex === 1) return 'sentence_order'   // もんだい2
  if (sectionIndex >= 2)  return 'text_with_passage' // もんだい3,4,5
  return 'fill_in_blank'                             // もんだい1
}

function extractInstructions(sectionText: string): string {
  const lines = sectionText.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines[0] ?? ''
}

/**
 * Extracts a reading passage from the section text.
 * Passages are typically the block of Japanese text before the questions.
 */
function extractPassage(
  sectionText: string,
  groupType:   ExamQuestionGroupSchemaType['type']
): string | undefined {
  if (groupType !== 'text_with_passage' && groupType !== 'fill_in_blank') return undefined

  const lines  = sectionText.split('\n').map((l) => l.trim()).filter(Boolean)
  const passage: string[] = []

  for (const line of lines) {
    // Stop when we hit question lines
    if (/^[（(]?\s*\d{1,2}\s*[）)]?/.test(line)) break
    // Skip instruction line (first line)
    if (passage.length === 0 && line === lines[0]) continue
    passage.push(line)
  }

  const text = passage.join('\n').trim()
  return text.length > 0 ? text : undefined
}

function parseQuestionsFromSection(
  text:      string,
  answerMap: AnswerMap,
  startQNum: number,
  groupType: ExamQuestionGroupSchemaType['type']
): ExamQuestionGroupSchemaType['questions'] {
  const lines    = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const questions: ExamQuestionGroupSchemaType['questions'] = []

  let qNum        = startQNum
  let state: 'seeking' | 'in_question' | 'in_options' = 'seeking'
  let currentText = ''
  let currentOpts: { number: 1 | 2 | 3 | 4; text: string }[] = []

  for (const line of lines) {
    const qStart = line.match(/^[（(]\s*(\d+)\s*[）)]\s+(.+)/)
    if (qStart) {
      if (state === 'in_options' && currentOpts.length === 4) {
        questions.push(buildQuestion(qNum - 1, currentText, currentOpts, answerMap))
      }
      currentText = qStart[2].trim()
      currentOpts = []
      state       = 'in_question'
      continue
    }

    const optMatch = line.match(/^([1-4])\s+(.+)/)
    if (optMatch && (state === 'in_question' || state === 'in_options')) {
      const optNum = parseInt(optMatch[1], 10) as 1 | 2 | 3 | 4
      currentOpts.push({ number: optNum, text: optMatch[2].trim() })
      state = 'in_options'

      if (currentOpts.length === 4) {
        questions.push(buildQuestion(qNum, currentText, currentOpts, answerMap))
        qNum++
        state       = 'seeking'
        currentText = ''
        currentOpts = []
      }
      continue
    }

    if (state === 'in_question') {
      currentText += ' ' + line
    }
  }

  return questions
}

function buildQuestion(
  num:     number,
  text:    string,
  options: { number: 1 | 2 | 3 | 4; text: string }[],
  answerMap: AnswerMap
): ExamQuestionGroupSchemaType['questions'][number] {
  return {
    number:         num,
    text:           text.trim(),
    options:        options as [
      { number: 1; text: string },
      { number: 2; text: string },
      { number: 3; text: string },
      { number: 4; text: string },
    ],
    correct_answer: getAnswer(answerMap, num),
  }
}

import type { ExamQuestionGroupSchemaType } from '@jlpt/shared'
import { normalizeText, splitBySection } from '../extractors/pdfExtractor'
import { getAnswer, type AnswerMap } from './answerParser'
import { generateGroupId } from '../generators/jsonGenerator'

// ================================
// Listening Section Parser
// Parses N5-style listening PDF into ExamQuestionGroup[]
//
// N5 Listening structure:
//   もんだい1 (Q66-Q72) — Listen & pick image (audio_with_image)
//   もんだい2 (Q73-Q78) — Listen & pick text (audio_with_text)
//   もんだい3 (Q79-Q83) — Listen & pick image from 4 choices (audio_with_image)
//   もんだい4 (Q84-Q90) — Short responses, no image (audio_only)
//
// Grammar section has Q34-Q65 (32 questions), so listening starts at Q66.
// ================================

const LISTENING_START_QNUM = 66
const SECTION_MARKER       = 'もんだい'

// Maps section index → group type for N5
const LISTENING_GROUP_TYPES: Record<number, ExamQuestionGroupSchemaType['type']> = {
  0: 'audio_with_image',   // もんだい1: listen & select from images
  1: 'audio_with_text',    // もんだい2: listen & select text answer
  2: 'audio_with_image',   // もんだい3: listen & select from image options
  3: 'audio_only',         // もんだい4: short response, no image
}

/**
 * Parses the listening PDF text into question groups.
 * Each もんだい block becomes one group that maps to one MP3 file.
 */
export function parseListening(
  rawText:   string,
  answerMap: AnswerMap,
  level:     string,
  year:      number
): ExamQuestionGroupSchemaType[] {
  const normalized = normalizeText(rawText)
  const sections   = splitBySection(normalized, SECTION_MARKER)

  if (sections.length === 0) {
    console.warn('⚠️  No もんだい sections found in listening PDF — check input file')
    return []
  }

  const groups: ExamQuestionGroupSchemaType[] = []
  let   globalQNum = LISTENING_START_QNUM

  for (let i = 0; i < sections.length; i++) {
    const sectionText  = sections[i]
    const instructions = extractInstructions(sectionText)
    const groupType    = LISTENING_GROUP_TYPES[i] ?? 'audio_only'
    const questions    = parseListeningQuestions(sectionText, answerMap, globalQNum, groupType)

    if (questions.length === 0) continue

    const group: ExamQuestionGroupSchemaType = {
      id:           generateGroupId(level, year, 'l', i + 1),
      type:         groupType,
      order_index:  i,
      instructions,
      // audio_url will be attached by the CLI after audioMapper runs
      questions,
    }

    // For image groups, add a placeholder image that will be replaced by SVG/upload
    if (groupType === 'audio_with_image') {
      group.image = {
        source:   'none',
        alt_text: `Listening question ${i + 1} image options`,
      }
    }

    groups.push(group)
    globalQNum += questions.length
  }

  return groups
}

function extractInstructions(sectionText: string): string {
  const lines = sectionText.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines[0] ?? ''
}

function parseListeningQuestions(
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
    // Question start
    const qStart = line.match(/^[（(]\s*(\d+)\s*[）)]\s*(.*)/)
    if (qStart) {
      if (state === 'in_options' && currentOpts.length >= 2) {
        // Listening questions can have 3-4 options depending on section
        questions.push(buildListeningQuestion(
          qNum - 1, currentText, currentOpts, answerMap, groupType
        ))
      }
      currentText = qStart[2].trim()
      currentOpts = []
      state       = 'in_question'
      continue
    }

    // Option lines
    const optMatch = line.match(/^([1-4])\s*(.*)/)
    if (optMatch && (state === 'in_question' || state === 'in_options')) {
      const optNum = parseInt(optMatch[1], 10) as 1 | 2 | 3 | 4
      // For image-based options, text may be empty (image placeholders)
      const optText = optMatch[2].trim() || `選択肢${optNum}`
      currentOpts.push({ number: optNum, text: optText })
      state = 'in_options'

      if (currentOpts.length === 4) {
        questions.push(buildListeningQuestion(
          qNum, currentText, currentOpts, answerMap, groupType
        ))
        qNum++
        state       = 'seeking'
        currentText = ''
        currentOpts = []
      }
      continue
    }

    if (state === 'in_question' && line.length > 0) {
      currentText += (currentText ? ' ' : '') + line
    }
  }

  // Push last question if complete
  if (state === 'in_options' && currentOpts.length === 4) {
    questions.push(buildListeningQuestion(
      qNum, currentText, currentOpts, answerMap, groupType
    ))
  }

  return questions
}

function buildListeningQuestion(
  num:       number,
  text:      string,
  options:   { number: 1 | 2 | 3 | 4; text: string }[],
  answerMap: AnswerMap,
  groupType: ExamQuestionGroupSchemaType['type']
): ExamQuestionGroupSchemaType['questions'][number] {
  // Ensure exactly 4 options
  const paddedOptions = padOptions(options)

  return {
    number:         num,
    text:           text.trim() || '（音声を聞いて答えてください）',
    options:        paddedOptions,
    correct_answer: getAnswer(answerMap, num),
  }
}

function padOptions(
  options: { number: 1 | 2 | 3 | 4; text: string }[]
): [
  { number: 1; text: string },
  { number: 2; text: string },
  { number: 3; text: string },
  { number: 4; text: string },
] {
  const result = [1, 2, 3, 4].map((n) => {
    const found = options.find((o) => o.number === n)
    return { number: n as 1 | 2 | 3 | 4, text: found?.text ?? `選択肢${n}` }
  })
  return result as [
    { number: 1; text: string },
    { number: 2; text: string },
    { number: 3; text: string },
    { number: 4; text: string },
  ]
}

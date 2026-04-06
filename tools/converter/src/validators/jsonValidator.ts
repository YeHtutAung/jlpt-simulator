import { ExamSchema, type ExamSchemaType } from '@jlpt/shared'

// ================================
// Exam JSON Validator
// Validates against Zod schema and runs additional
// structural checks specific to JLPT format.
// ================================

export interface ValidationResult {
  valid:    boolean
  errors:   string[]
  warnings: string[]
}

/**
 * Validates exam JSON against the ExamSchema.
 * Throws on hard validation failures; prints warnings for soft issues.
 */
export function validateExam(exam: unknown): ExamSchemaType {
  // ── Zod validation ───────────────────────────────────────
  const result = ExamSchema.safeParse(exam)

  if (!result.success) {
    const formatted = result.error.issues.map((issue) => {
      const path = issue.path.join('.')
      return `  ${path ? path + ': ' : ''}${issue.message}`
    })
    console.error('❌ Schema validation failed:')
    formatted.forEach((e) => console.error(e))
    throw new Error(`Invalid exam JSON: ${result.error.issues.length} error(s)`)
  }

  const parsed = result.data

  // ── Structural checks ────────────────────────────────────
  const { errors, warnings } = runStructuralChecks(parsed)

  if (warnings.length > 0) {
    console.warn(`\n⚠️  Warnings (${warnings.length}):`)
    warnings.forEach((w) => console.warn(`  ${w}`))
  }

  if (errors.length > 0) {
    console.error(`\n❌ Structural errors (${errors.length}):`)
    errors.forEach((e) => console.error(`  ${e}`))
    throw new Error(`Structural validation failed: ${errors.length} error(s)`)
  }

  console.log('  ✓ Schema valid')
  console.log(`  ✓ ${countQuestions(parsed)} total questions across ${parsed.sections.length} sections`)

  return parsed
}

function runStructuralChecks(exam: ExamSchemaType): { errors: string[]; warnings: string[] } {
  const errors:   string[] = []
  const warnings: string[] = []

  let expectedQNum = 1

  for (const section of exam.sections) {
    for (const group of section.question_groups) {
      for (const question of group.questions) {
        // Check sequential question numbering
        if (question.number !== expectedQNum) {
          warnings.push(
            `Question numbering gap: expected Q${expectedQNum}, found Q${question.number} in group ${group.id}`
          )
          expectedQNum = question.number + 1
        } else {
          expectedQNum++
        }

        // Check correct_answer is 1-4
        if (question.correct_answer < 1 || question.correct_answer > 4) {
          errors.push(`Q${question.number}: correct_answer out of range (${question.correct_answer})`)
        }

        // Check options are numbered 1-4
        const optNums = question.options.map((o) => o.number).sort()
        if (JSON.stringify(optNums) !== JSON.stringify([1, 2, 3, 4])) {
          errors.push(`Q${question.number}: options must be numbered 1-4, got [${optNums.join(',')}]`)
        }

        // Warn on empty question text
        if (question.text.trim().length === 0) {
          warnings.push(`Q${question.number}: empty question text`)
        }
      }

      // Warn on missing audio_url for audio groups
      if (
        (group.type === 'audio_only' || group.type === 'audio_with_image' || group.type === 'audio_with_text') &&
        !group.audio_url
      ) {
        warnings.push(`Group ${group.id}: audio group has no audio_url — add after upload`)
      }

      // Warn on missing image for image groups
      if (
        (group.type === 'text_with_image' || group.type === 'audio_with_image') &&
        (!group.image || group.image.source === 'none')
      ) {
        warnings.push(`Group ${group.id}: image group has no image — add SVG or upload`)
      }
    }
  }

  return { errors, warnings }
}

function countQuestions(exam: ExamSchemaType): number {
  return exam.sections.reduce(
    (total, section) =>
      total + section.question_groups.reduce(
        (sTotal, group) => sTotal + group.questions.length,
        0
      ),
    0
  )
}

/**
 * Pretty-prints a summary of the exam for CLI output.
 */
export function printExamSummary(exam: ExamSchemaType): void {
  console.log('\n📋 Exam Summary:')
  console.log(`   Level: ${exam.meta.level}  Year: ${exam.meta.year}  Month: ${exam.meta.month}`)

  for (const section of exam.sections) {
    const total = section.question_groups.reduce(
      (sum, g) => sum + g.questions.length, 0
    )
    console.log(`   ${section.type.padEnd(20)} ${section.question_groups.length} groups  ${total} questions  ${section.time_limit}min`)
  }
}

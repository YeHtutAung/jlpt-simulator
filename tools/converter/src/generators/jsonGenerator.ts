import type { ExamSchemaType, ExamQuestionGroupSchemaType } from '@jlpt/shared'
import { LEVEL_CONFIGS } from '@jlpt/shared'

// ================================
// JSON Assembler
// Takes parsed groups from all section parsers and
// assembles the final ExamSchemaType object.
// ================================

export interface AssembleOptions {
  level:          'N1' | 'N2' | 'N3' | 'N4' | 'N5'
  year:           number
  month:          'july' | 'december'
  vocabGroups:    ExamQuestionGroupSchemaType[]
  grammarGroups:  ExamQuestionGroupSchemaType[]
  listeningGroups: ExamQuestionGroupSchemaType[]
}

/**
 * Assembles the full exam JSON from parsed section groups.
 * Uses LEVEL_CONFIGS from @jlpt/shared for time limits.
 */
export function assembleExam(opts: AssembleOptions): ExamSchemaType {
  const levelConfig = LEVEL_CONFIGS[opts.level]
  if (!levelConfig) {
    throw new Error(`Unknown level: ${opts.level}`)
  }

  const getSectionConfig = (type: string) => {
    const config = levelConfig.sections.find((s) => s.type === type)
    if (!config) throw new Error(`No section config for type: ${type}`)
    return config
  }

  const vocabConfig    = getSectionConfig('vocabulary')
  const grammarConfig  = getSectionConfig('grammar_reading')
  const listeningConfig = getSectionConfig('listening')

  return {
    meta: {
      level:  opts.level,
      year:   opts.year,
      month:  opts.month,
      status: 'draft',
    },
    sections: [
      {
        type:             'vocabulary',
        time_limit:       vocabConfig.time_limit,
        order_index:      0,
        instructions:     vocabConfig.label_ja,
        question_groups:  opts.vocabGroups,
      },
      {
        type:             'grammar_reading',
        time_limit:       grammarConfig.time_limit,
        order_index:      1,
        instructions:     grammarConfig.label_ja,
        question_groups:  opts.grammarGroups,
      },
      {
        type:             'listening',
        time_limit:       listeningConfig.time_limit,
        order_index:      2,
        instructions:     listeningConfig.label_ja,
        question_groups:  opts.listeningGroups,
      },
    ],
  }
}

/**
 * Generates a group ID following the naming convention:
 *   {level}-{year}-{section_abbrev}-g{index}
 *   e.g. n5-2017-v-g1
 *
 * section: 'v' | 'gr' | 'l'
 */
export function generateGroupId(
  level:   string,
  year:    number,
  section: 'v' | 'gr' | 'l',
  index:   number
): string {
  return `${level.toLowerCase()}-${year}-${section}-g${index}`
}

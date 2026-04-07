// ================================
// Core Exam Types
// ================================

export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5'
export type ExamMonth = 'july' | 'december'
export type SectionType = 'vocabulary' | 'grammar_reading' | 'listening'
export type ExamMode = 'full_exam' | 'practice'
export type ExamStatus = 'draft' | 'published' | 'archived'

export type QuestionGroupType =
  | 'text_only'          // Pure text question
  | 'text_with_passage'  // Reading comprehension (single passage)
  | 'multi_passage'      // Multiple short passages, one question each (もんだい4)
  | 'text_with_image'    // Image-based question
  | 'audio_only'         // Listen and answer (no image options)
  | 'audio_with_image'   // Listen and pick image
  | 'audio_with_text'    // Listen and pick text
  | 'sentence_order'     // Rearrange sentence (もんだい2 type)
  | 'fill_in_blank'      // Fill in blank from passage

export type ImageSourceType = 'svg' | 'storage' | 'none'

// ================================
// Exam Structure
// ================================

export interface ExamMeta {
  level: JLPTLevel
  year: number
  month: ExamMonth
  status: ExamStatus
}

export interface ExamImage {
  source: ImageSourceType
  svg_data?: string       // inline SVG string
  storage_url?: string    // Supabase storage URL
  alt_text?: string       // accessibility
}

export interface ExamOption {
  number: 1 | 2 | 3 | 4
  text: string
  image_type?: ImageSourceType  // set when option is an image (e.g. room layout diagrams)
  image_data?: string           // inline SVG string or storage URL
}

export interface ExamQuestion {
  number: number
  text: string
  underline_word?: string   // for vocab reading questions
  options: ExamOption[]
  correct_answer: 1 | 2 | 3 | 4
  explanation?: string      // for review mode
  image?: ExamImage
  image_position?: 'above' | 'below' | 'side_by_side'
  passage_text?: string     // populated by edge fn for multi_passage groups
  passage_label?: string    // e.g. "(1)", "(2)" for multi_passage
}

// Used in seed JSON for multi_passage groups
export interface GroupPassage {
  label?: string
  text: string
  questions: ExamQuestion[]
}

export interface ExamQuestionGroup {
  id: string                // e.g. "n5-2017-v-g1"
  type: QuestionGroupType
  instructions?: string
  passage_text?: string     // for text_with_passage groups
  passages?: GroupPassage[] // for multi_passage groups (seed JSON only)
  image?: ExamImage
  audio_url?: string        // Supabase storage URL
  questions: ExamQuestion[]
  order_index: number
}

export interface ExamSection {
  type: SectionType
  time_limit: number        // minutes
  instructions?: string
  question_groups: ExamQuestionGroup[]
  order_index: number
}

export interface Exam {
  meta: ExamMeta
  sections: ExamSection[]
}

// ================================
// Section Config (per level)
// ================================

export interface SectionConfig {
  type: SectionType
  label_en: string
  label_ja: string
  time_limit: number
}

export interface LevelConfig {
  level: JLPTLevel
  label: string
  sections: SectionConfig[]
  total_time: number        // minutes
}

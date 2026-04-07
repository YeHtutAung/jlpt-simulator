import { z } from 'zod'

// ================================
// Zod Schemas — Exam JSON Validation
// Used by: converter tool, admin upload, API
// ================================

export const JLPTLevelSchema = z.enum(['N1', 'N2', 'N3', 'N4', 'N5'])
export const ExamMonthSchema = z.enum(['july', 'december'])
export const ExamStatusSchema = z.enum(['draft', 'published', 'archived'])
export const SectionTypeSchema = z.enum(['vocabulary', 'grammar_reading', 'listening'])
export const ImageSourceTypeSchema = z.enum(['svg', 'storage', 'none'])

export const QuestionGroupTypeSchema = z.enum([
  'text_only',
  'text_with_passage',
  'multi_passage',
  'text_with_image',
  'audio_only',
  'audio_with_image',
  'audio_with_text',
  'sentence_order',
  'fill_in_blank',
])

export const ExamMetaSchema = z.object({
  level: JLPTLevelSchema,
  year: z.number().min(2010).max(2030),
  month: ExamMonthSchema,
  status: ExamStatusSchema.default('draft'),
})

export const ExamImageSchema = z.object({
  source: ImageSourceTypeSchema,
  svg_data: z.string().optional(),
  storage_url: z.string().url().optional(),
  alt_text: z.string().optional(),
})

export const ExamOptionSchema = z.object({
  number: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().default(''),
  image_type: ImageSourceTypeSchema.optional(),
  image_data: z.string().optional(),
})

export const ExamQuestionSchema = z.object({
  number: z.number().positive(),
  text: z.string().min(1),
  underline_word: z.string().optional(),
  options: z.array(ExamOptionSchema).min(3).max(4),
  correct_answer: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  explanation: z.string().optional(),
  image: ExamImageSchema.optional(),
  image_position: z.enum(['above', 'below', 'side_by_side']).default('above').optional(),
  passage_text: z.string().optional(),
  passage_label: z.string().optional(),
})

export const GroupPassageSchema = z.object({
  label: z.string().optional(),
  text: z.string().min(1),
  questions: z.array(ExamQuestionSchema).min(1),
})

export const ExamQuestionGroupSchema = z.object({
  id: z.string().min(1),
  type: QuestionGroupTypeSchema,
  instructions: z.string().optional(),
  passage_text: z.string().optional(),
  passages: z.array(GroupPassageSchema).optional(),
  image: ExamImageSchema.optional(),
  audio_url: z.string().optional(),
  questions: z.array(ExamQuestionSchema).default([]),
  order_index: z.number().min(0),
})

export const ExamSectionSchema = z.object({
  type: SectionTypeSchema,
  time_limit: z.number().positive(),
  instructions: z.string().optional(),
  question_groups: z.array(ExamQuestionGroupSchema).min(1),
  order_index: z.number().min(0),
})

export const ExamSchema = z.object({
  meta: ExamMetaSchema,
  sections: z.array(ExamSectionSchema).min(1).max(3),
})

// ================================
// Inferred types from schemas
// ================================
export type ExamSchemaType = z.infer<typeof ExamSchema>
export type ExamSectionSchemaType = z.infer<typeof ExamSectionSchema>
export type ExamQuestionGroupSchemaType = z.infer<typeof ExamQuestionGroupSchema>
export type ExamQuestionSchemaType = z.infer<typeof ExamQuestionSchema>
export type GroupPassageSchemaType = z.infer<typeof GroupPassageSchema>

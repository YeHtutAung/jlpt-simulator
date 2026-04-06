import type { LevelConfig } from '../types/exam.types'

// ================================
// JLPT Level Configurations
// ================================

export const LEVEL_CONFIGS: Record<string, LevelConfig> = {
  N5: {
    level: 'N5',
    label: 'N5 — Beginner',
    total_time: 105,
    sections: [
      {
        type: 'vocabulary',
        label_en: 'Language Knowledge (Vocabulary)',
        label_ja: 'げんごちしき（もじ・ごい）',
        time_limit: 25,
      },
      {
        type: 'grammar_reading',
        label_en: 'Language Knowledge (Grammar) · Reading',
        label_ja: 'げんごちしき（ぶんぽう）・どっかい',
        time_limit: 50,
      },
      {
        type: 'listening',
        label_en: 'Listening',
        label_ja: 'ちょうかい',
        time_limit: 30,
      },
    ],
  },
  N4: {
    level: 'N4',
    label: 'N4 — Elementary',
    total_time: 125,
    sections: [
      {
        type: 'vocabulary',
        label_en: 'Language Knowledge (Vocabulary)',
        label_ja: '言語知識（文字・語彙）',
        time_limit: 30,
      },
      {
        type: 'grammar_reading',
        label_en: 'Language Knowledge (Grammar) · Reading',
        label_ja: '言語知識（文法）・読解',
        time_limit: 60,
      },
      {
        type: 'listening',
        label_en: 'Listening',
        label_ja: '聴解',
        time_limit: 35,
      },
    ],
  },
  N3: {
    level: 'N3',
    label: 'N3 — Intermediate',
    total_time: 140,
    sections: [
      {
        type: 'vocabulary',
        label_en: 'Language Knowledge (Vocabulary)',
        label_ja: '言語知識（文字・語彙）',
        time_limit: 30,
      },
      {
        type: 'grammar_reading',
        label_en: 'Language Knowledge (Grammar) · Reading',
        label_ja: '言語知識（文法）・読解',
        time_limit: 70,
      },
      {
        type: 'listening',
        label_en: 'Listening',
        label_ja: '聴解',
        time_limit: 40,
      },
    ],
  },
  N2: {
    level: 'N2',
    label: 'N2 — Upper Intermediate',
    total_time: 155,
    sections: [
      {
        type: 'vocabulary',
        label_en: 'Language Knowledge (Vocabulary)',
        label_ja: '言語知識（文字・語彙）',
        time_limit: 30,
      },
      {
        type: 'grammar_reading',
        label_en: 'Language Knowledge (Grammar) · Reading',
        label_ja: '言語知識（文法）・読解',
        time_limit: 85,
      },
      {
        type: 'listening',
        label_en: 'Listening',
        label_ja: '聴解',
        time_limit: 40,
      },
    ],
  },
  N1: {
    level: 'N1',
    label: 'N1 — Advanced',
    total_time: 170,
    sections: [
      {
        type: 'vocabulary',
        label_en: 'Language Knowledge (Vocabulary)',
        label_ja: '言語知識（文字・語彙）',
        time_limit: 35,
      },
      {
        type: 'grammar_reading',
        label_en: 'Language Knowledge (Grammar) · Reading',
        label_ja: '言語知識（文法）・読解',
        time_limit: 95,
      },
      {
        type: 'listening',
        label_en: 'Listening',
        label_ja: '聴解',
        time_limit: 40,
      },
    ],
  },
}

export const JLPT_LEVELS = ['N1', 'N2', 'N3', 'N4', 'N5'] as const
export const EXAM_MONTHS = ['july', 'december'] as const

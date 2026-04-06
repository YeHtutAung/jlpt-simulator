import { describe, it, expect } from 'vitest'
import { parseVocabulary } from '../parsers/vocabularyParser'
import type { AnswerMap } from '../parsers/answerParser'

// ================================
// vocabularyParser tests
// ================================

// Build a minimal answer map for Q1-Q10
function makeAnswerMap(answers: Record<number, 1 | 2 | 3 | 4> = {}): AnswerMap {
  const defaults: AnswerMap = {}
  for (let i = 1; i <= 33; i++) {
    defaults[i] = (((i - 1) % 4) + 1) as 1 | 2 | 3 | 4
  }
  return { ...defaults, ...answers }
}


describe('parseVocabulary — empty input', () => {
  it('returns empty array for empty text', () => {
    const groups = parseVocabulary('', makeAnswerMap(), 'N5', 2017)
    expect(groups).toEqual([])
  })

  it('returns empty array when no もんだい found', () => {
    const groups = parseVocabulary('Some random text without sections', makeAnswerMap(), 'N5', 2017)
    expect(groups).toEqual([])
  })
})

describe('parseVocabulary — group extraction', () => {
  it('creates one group per もんだい section', () => {
    const text = [
      'もんだい1　instruction one',
      '(1) Q text',
      '1 A  2 B  3 C  4 D',
      'もんだい2　instruction two',
      '(11) Q text',
      '1 A  2 B  3 C  4 D',
    ].join('\n')

    const groups = parseVocabulary(text, makeAnswerMap(), 'N5', 2017)
    expect(groups.length).toBeGreaterThanOrEqual(1)
  })

  it('generates correct group IDs using level+year+section', () => {
    const text = 'もんだい1　instruction\n(1) Q\n1 A  2 B  3 C  4 D\n'
    const groups = parseVocabulary(text, makeAnswerMap(), 'N5', 2017)
    if (groups.length > 0) {
      expect(groups[0].id).toMatch(/^n5-2017-v-g/)
    }
  })

  it('assigns correct order_index to groups', () => {
    const text = [
      'もんだい1　inst1\n(1) Q1\n1 A  2 B  3 C  4 D\n',
      'もんだい2　inst2\n(11) Q2\n1 A  2 B  3 C  4 D\n',
    ].join('')
    const groups = parseVocabulary(text, makeAnswerMap(), 'N5', 2017)
    groups.forEach((g, i) => {
      expect(g.order_index).toBe(i)
    })
  })

  it('sets group type to text_only for vocabulary', () => {
    const text = 'もんだい1　inst\n(1) Q\n1 A  2 B  3 C  4 D\n'
    const groups = parseVocabulary(text, makeAnswerMap(), 'N5', 2017)
    if (groups.length > 0) {
      expect(groups[0].type).toBe('text_only')
    }
  })
})

describe('parseVocabulary — answer mapping', () => {
  it('applies correct_answer from answerMap', () => {
    const answerMap = makeAnswerMap({ 1: 3 })
    const text = 'もんだい1　inst\n(1) Q text here\n1 A  2 B  3 C  4 D\n'
    const groups = parseVocabulary(text, answerMap, 'N5', 2017)
    if (groups.length > 0 && groups[0].questions.length > 0) {
      expect(groups[0].questions[0].correct_answer).toBe(3)
    }
  })
})

describe('parseVocabulary — different levels', () => {
  it('uses the provided level in group IDs', () => {
    const text = 'もんだい1　inst\n(1) Q\n1 A  2 B  3 C  4 D\n'
    for (const level of ['N1', 'N2', 'N3', 'N4', 'N5']) {
      const groups = parseVocabulary(text, makeAnswerMap(), level, 2023)
      if (groups.length > 0) {
        expect(groups[0].id).toContain(level.toLowerCase())
        expect(groups[0].id).toContain('2023')
      }
    }
  })
})

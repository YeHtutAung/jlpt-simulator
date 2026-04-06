import { describe, it, expect } from 'vitest'
import { parseAnswers, getAnswer } from '../parsers/answerParser'

// ================================
// answerParser tests
// ================================

describe('parseAnswers — strategy 1: pair matching', () => {
  it('parses simple number-answer pairs', () => {
    const text = `
      1  2
      2  4
      3  1
      4  3
    `
    const map = parseAnswers(text)
    expect(map[1]).toBe(2)
    expect(map[2]).toBe(4)
    expect(map[3]).toBe(1)
    expect(map[4]).toBe(3)
  })

  it('parses pairs with parentheses', () => {
    const text = `
      （1） 2
      （2） 4
      （3） 3
    `
    const map = parseAnswers(text)
    expect(map[1]).toBe(2)
    expect(map[2]).toBe(4)
    expect(map[3]).toBe(3)
  })

  it('handles two-digit question numbers', () => {
    const text = '10  3\n11  2\n12  4'
    const map = parseAnswers(text)
    expect(map[10]).toBe(3)
    expect(map[11]).toBe(2)
    expect(map[12]).toBe(4)
  })

  it('ignores answers out of 1-4 range', () => {
    const text = '1  5\n2  0\n3  3'
    const map = parseAnswers(text)
    expect(map[1]).toBeUndefined()
    expect(map[2]).toBeUndefined()
    expect(map[3]).toBe(3)
  })

  it('ignores question numbers out of 1-100 range', () => {
    const text = '0  2\n101  3\n50  1'
    const map = parseAnswers(text)
    expect(map[0]).toBeUndefined()
    expect(map[101]).toBeUndefined()
    expect(map[50]).toBe(1)
  })

  it('first match wins for duplicate question numbers', () => {
    const text = '5  2\n5  4'
    const map = parseAnswers(text)
    expect(map[5]).toBe(2)
  })
})

describe('parseAnswers — real-world-style input', () => {
  it('parses a full answer key block', () => {
    const text = `
もんだい1
1 2  2 4  3 1  4 3  5 2
もんだい2
6 1  7 4  8 2  9 3  10 4
    `
    const map = parseAnswers(text)
    expect(map[1]).toBe(2)
    expect(map[5]).toBe(2)
    expect(map[6]).toBe(1)
    expect(map[10]).toBe(4)
  })
})

describe('getAnswer', () => {
  it('returns the mapped answer', () => {
    const map = { 1: 3 as const, 2: 1 as const }
    expect(getAnswer(map, 1)).toBe(3)
    expect(getAnswer(map, 2)).toBe(1)
  })

  it('returns 1 as fallback when question not in map', () => {
    const map = {}
    expect(getAnswer(map, 99)).toBe(1)
  })
})

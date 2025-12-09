import { describe, it, expect } from 'vitest'
import {
  monacoSelectionToRange,
  extractSelectedText,
  generateThreadId,
} from './lineUtils'

describe('lineUtils', () => {
  describe('monacoSelectionToRange', () => {
    it('should convert Monaco Selection to {startLine, endLine}', () => {
      // Create a mock Selection object with required properties
      const selection = {
        startLineNumber: 5,
        startColumn: 1,
        endLineNumber: 10,
        endColumn: 1,
      }

      const result = monacoSelectionToRange(selection)

      expect(result).toEqual({
        startLine: 5,
        endLine: 10,
      })
    })

    it('should handle single line selection', () => {
      const selection = {
        startLineNumber: 5,
        startColumn: 1,
        endLineNumber: 5,
        endColumn: 10,
      }

      const result = monacoSelectionToRange(selection)

      expect(result).toEqual({
        startLine: 5,
        endLine: 5,
      })
    })

    it('should return null for null selection', () => {
      const result = monacoSelectionToRange(null)

      expect(result).toBeNull()
    })
  })

  describe('extractSelectedText', () => {
    const sampleCode = `function test() {
  return true;
}

function another() {
  return false;
}`

    it('should extract correct lines from code string', () => {
      const result = extractSelectedText(sampleCode, 1, 3)

      expect(result).toBe(`function test() {
  return true;
}`)
    })

    it('should handle single line selection', () => {
      const result = extractSelectedText(sampleCode, 2, 2)

      expect(result).toBe('  return true;')
    })

    it('should handle full file selection', () => {
      // sampleCode has 7 lines, so select 1-7 to get all lines
      const result = extractSelectedText(sampleCode, 1, 7)

      expect(result).toBe(sampleCode)
    })

    it('should handle empty code string', () => {
      const result = extractSelectedText('', 1, 1)

      expect(result).toBe('')
    })

    it('should handle selection beyond code length', () => {
      const result = extractSelectedText(sampleCode, 1, 100)

      expect(result).toBe(sampleCode)
    })
  })

  describe('generateThreadId', () => {
    it('should return unique IDs', () => {
      const id1 = generateThreadId()
      const id2 = generateThreadId()

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^thread-\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^thread-\d+-[a-z0-9]+$/)
    })

    it('should return string starting with "thread-"', () => {
      const id = generateThreadId()

      expect(id).toMatch(/^thread-/)
    })

    it('should generate different IDs on subsequent calls', () => {
      const ids = Array.from({ length: 10 }, () => generateThreadId())
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(10)
    })
  })
})


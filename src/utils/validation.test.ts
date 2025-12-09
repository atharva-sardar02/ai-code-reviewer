import { describe, it, expect } from 'vitest'
import {
  isValidSelection,
  isValidMessage,
  shouldTruncateCode,
  truncateCodeWithContext,
} from './validation'

describe('validation', () => {
  describe('isValidSelection', () => {
    it('should return false for empty selection (start === end, no text)', () => {
      expect(isValidSelection(5, 5, '')).toBe(false)
      expect(isValidSelection(5, 5, '   ')).toBe(false)
    })

    it('should return true for single line with content', () => {
      expect(isValidSelection(5, 5, 'const x = 1;')).toBe(true)
      expect(isValidSelection(0, 0, 'function test() {')).toBe(true)
    })

    it('should return true for multi-line selection', () => {
      expect(isValidSelection(5, 10, 'line 1\nline 2\nline 3')).toBe(true)
      expect(isValidSelection(0, 5, 'function test() {\n  return true;\n}')).toBe(true)
    })

    it('should return false for invalid line numbers', () => {
      expect(isValidSelection(-1, 5, 'some code')).toBe(false)
      expect(isValidSelection(5, -1, 'some code')).toBe(false)
      expect(isValidSelection(10, 5, 'some code')).toBe(false)
    })

    it('should return false for whitespace-only selection', () => {
      expect(isValidSelection(5, 10, '   \n   \n   ')).toBe(false)
      expect(isValidSelection(0, 2, '\n\n')).toBe(false)
    })

    it('should return true for selection with content and whitespace', () => {
      expect(isValidSelection(5, 10, '  const x = 1;  ')).toBe(true)
      expect(isValidSelection(0, 2, '  code  \n  more  ')).toBe(true)
    })
  })

  describe('isValidMessage', () => {
    it('should return false for empty string', () => {
      expect(isValidMessage('')).toBe(false)
    })

    it('should return false for whitespace-only string', () => {
      expect(isValidMessage('   ')).toBe(false)
      expect(isValidMessage('\n\t  \n')).toBe(false)
    })

    it('should return true for non-empty trimmed string', () => {
      expect(isValidMessage('Hello')).toBe(true)
      expect(isValidMessage('  Hello  ')).toBe(true)
      expect(isValidMessage('What does this code do?')).toBe(true)
    })

    it('should return true for multi-line message with content', () => {
      expect(isValidMessage('Line 1\nLine 2')).toBe(true)
      expect(isValidMessage('  Line 1  \n  Line 2  ')).toBe(true)
    })
  })

  describe('shouldTruncateCode', () => {
    it('should return false for short code', () => {
      const shortCode = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`).join('\n')
      expect(shouldTruncateCode(shortCode)).toBe(false)
    })

    it('should return true when code exceeds line limit', () => {
      const longCode = Array.from({ length: 600 }, (_, i) => `line ${i + 1}`).join('\n')
      expect(shouldTruncateCode(longCode)).toBe(true)
    })

    it('should return true when code exceeds character limit', () => {
      const longCode = 'x'.repeat(60000)
      expect(shouldTruncateCode(longCode)).toBe(true)
    })

    it('should return false for code within limits', () => {
      const code = Array.from({ length: 400 }, (_, i) => `line ${i + 1}`).join('\n')
      expect(shouldTruncateCode(code)).toBe(false)
    })
  })

  describe('truncateCodeWithContext', () => {
    it('should return code as-is if short enough', () => {
      const code = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`).join('\n')
      const result = truncateCodeWithContext(code, 50, 60)
      
      expect(result).toBe(code)
    })

    it('should truncate long code while keeping selection context', () => {
      const lines = Array.from({ length: 1000 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 500, 510)
      
      // Should include selection
      expect(result).toContain('line 501')
      expect(result).toContain('line 511')
      
      // Should not include all lines
      expect(result).not.toContain('line 1')
      expect(result).not.toContain('line 1000')
    })

    it('should add truncation markers', () => {
      const lines = Array.from({ length: 1000 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 500, 510)
      
      // Should have markers indicating truncation
      expect(result).toMatch(/\.\.\./)
    })

    it('should handle selection at start of file', () => {
      const lines = Array.from({ length: 600 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 0, 10)
      
      expect(result).toContain('line 1')
      expect(result).toContain('line 11')
    })

    it('should handle selection at end of file', () => {
      const lines = Array.from({ length: 600 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 590, 599)
      
      expect(result).toContain('line 591')
      expect(result).toContain('line 600')
    })

    it('should handle very large selection', () => {
      const lines = Array.from({ length: 1000 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      // Selection larger than MAX_TRUNCATED_LINES
      const result = truncateCodeWithContext(code, 0, 600)
      
      // Should truncate the selection itself
      expect(result).toContain('more lines in selection')
    })

    it('should handle single line selection in long file', () => {
      const lines = Array.from({ length: 600 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 300, 300)
      
      expect(result).toContain('line 301')
      // Should have context before and after
      expect(result.split('\n').length).toBeLessThan(600)
    })
  })
})







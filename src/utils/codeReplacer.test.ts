import { describe, it, expect } from 'vitest'
import {
  replaceLines,
  applyMultipleReplacements,
  extractOriginalCode,
  prepareCodeFixes,
  validateNoOverlaps,
  mergeOverlappingReplacements,
} from './codeReplacer'

describe('replaceLines', () => {
  const sampleCode = `line 1
line 2
line 3
line 4
line 5`

  it('should replace a single line', () => {
    const result = replaceLines(sampleCode, 2, 2, 'new line 2')
    
    expect(result).toBe(`line 1
new line 2
line 3
line 4
line 5`)
  })
  
  it('should replace multiple lines', () => {
    const result = replaceLines(sampleCode, 2, 4, 'replacement')
    
    expect(result).toBe(`line 1
replacement
line 5`)
  })
  
  it('should replace with multiple lines', () => {
    const result = replaceLines(sampleCode, 3, 3, 'new line A\nnew line B')
    
    expect(result).toBe(`line 1
line 2
new line A
new line B
line 4
line 5`)
  })
  
  it('should replace first line', () => {
    const result = replaceLines(sampleCode, 1, 1, 'new first line')
    
    expect(result).toBe(`new first line
line 2
line 3
line 4
line 5`)
  })
  
  it('should replace last line', () => {
    const result = replaceLines(sampleCode, 5, 5, 'new last line')
    
    expect(result).toBe(`line 1
line 2
line 3
line 4
new last line`)
  })
  
  it('should handle invalid start line (too low)', () => {
    const result = replaceLines(sampleCode, 0, 1, 'new')
    
    // Should return original
    expect(result).toBe(sampleCode)
  })
  
  it('should handle invalid end line (too high)', () => {
    const result = replaceLines(sampleCode, 1, 100, 'new')
    
    // Should return original
    expect(result).toBe(sampleCode)
  })
  
  it('should handle start > end', () => {
    const result = replaceLines(sampleCode, 3, 1, 'new')
    
    // Should return original
    expect(result).toBe(sampleCode)
  })
  
  it('should replace entire file', () => {
    const result = replaceLines(sampleCode, 1, 5, 'single line')
    
    expect(result).toBe('single line')
  })
})

describe('applyMultipleReplacements', () => {
  const sampleCode = `line 1
line 2
line 3
line 4
line 5`

  it('should apply single replacement', () => {
    const replacements = [
      { startLine: 2, endLine: 2, newCode: 'new 2' },
    ]
    
    const result = applyMultipleReplacements(sampleCode, replacements)
    
    expect(result).toBe(`line 1
new 2
line 3
line 4
line 5`)
  })
  
  it('should apply multiple non-overlapping replacements', () => {
    const replacements = [
      { startLine: 2, endLine: 2, newCode: 'new 2' },
      { startLine: 4, endLine: 4, newCode: 'new 4' },
    ]
    
    const result = applyMultipleReplacements(sampleCode, replacements)
    
    expect(result).toBe(`line 1
new 2
line 3
new 4
line 5`)
  })
  
  it('should handle replacements in any order', () => {
    const replacements = [
      { startLine: 4, endLine: 4, newCode: 'new 4' },
      { startLine: 2, endLine: 2, newCode: 'new 2' },
    ]
    
    const result = applyMultipleReplacements(sampleCode, replacements)
    
    expect(result).toBe(`line 1
new 2
line 3
new 4
line 5`)
  })
  
  it('should return original for empty replacements', () => {
    const result = applyMultipleReplacements(sampleCode, [])
    
    expect(result).toBe(sampleCode)
  })
  
  it('should handle replacements that change line count', () => {
    const replacements = [
      { startLine: 2, endLine: 2, newCode: 'new A\nnew B' },
      { startLine: 4, endLine: 4, newCode: 'new C' },
    ]
    
    const result = applyMultipleReplacements(sampleCode, replacements)
    
    expect(result).toBe(`line 1
new A
new B
line 3
new C
line 5`)
  })
})

describe('extractOriginalCode', () => {
  const sampleCode = `line 1
line 2
line 3
line 4
line 5`

  it('should extract single line', () => {
    const result = extractOriginalCode(sampleCode, 2, 2)
    
    expect(result).toBe('line 2')
  })
  
  it('should extract multiple lines', () => {
    const result = extractOriginalCode(sampleCode, 2, 4)
    
    expect(result).toBe(`line 2
line 3
line 4`)
  })
  
  it('should return empty for invalid start', () => {
    const result = extractOriginalCode(sampleCode, -1, 2)
    
    expect(result).toBe('')
  })
  
  it('should clamp end line to file length', () => {
    const result = extractOriginalCode(sampleCode, 4, 100)
    
    expect(result).toBe(`line 4
line 5`)
  })
})

describe('prepareCodeFixes', () => {
  const sampleCode = `line 1
line 2
line 3`

  it('should prepare code fixes with original and new code', () => {
    const replacements = [
      { startLine: 2, endLine: 2, newCode: 'new line 2' },
    ]
    
    const fixes = prepareCodeFixes(sampleCode, replacements)
    
    expect(fixes).toHaveLength(1)
    expect(fixes[0]).toEqual({
      startLine: 2,
      endLine: 2,
      originalCode: 'line 2',
      newCode: 'new line 2',
    })
  })
  
  it('should prepare multiple fixes', () => {
    const replacements = [
      { startLine: 1, endLine: 1, newCode: 'new 1' },
      { startLine: 3, endLine: 3, newCode: 'new 3' },
    ]
    
    const fixes = prepareCodeFixes(sampleCode, replacements)
    
    expect(fixes).toHaveLength(2)
  })
})

describe('validateNoOverlaps', () => {
  it('should return true for non-overlapping ranges', () => {
    const replacements = [
      { startLine: 1, endLine: 2, newCode: '' },
      { startLine: 4, endLine: 5, newCode: '' },
    ]
    
    expect(validateNoOverlaps(replacements)).toBe(true)
  })
  
  it('should return false for overlapping ranges', () => {
    const replacements = [
      { startLine: 1, endLine: 3, newCode: '' },
      { startLine: 2, endLine: 4, newCode: '' },
    ]
    
    expect(validateNoOverlaps(replacements)).toBe(false)
  })
  
  it('should return true for adjacent ranges', () => {
    const replacements = [
      { startLine: 1, endLine: 2, newCode: '' },
      { startLine: 3, endLine: 4, newCode: '' },
    ]
    
    expect(validateNoOverlaps(replacements)).toBe(true)
  })
  
  it('should return true for single replacement', () => {
    const replacements = [
      { startLine: 1, endLine: 5, newCode: '' },
    ]
    
    expect(validateNoOverlaps(replacements)).toBe(true)
  })
  
  it('should return true for empty array', () => {
    expect(validateNoOverlaps([])).toBe(true)
  })
})

describe('mergeOverlappingReplacements', () => {
  it('should not change non-overlapping replacements', () => {
    const replacements = [
      { startLine: 1, endLine: 2, newCode: 'a' },
      { startLine: 4, endLine: 5, newCode: 'b' },
    ]
    
    const merged = mergeOverlappingReplacements(replacements)
    
    expect(merged).toHaveLength(2)
  })
  
  it('should merge overlapping replacements', () => {
    const replacements = [
      { startLine: 1, endLine: 3, newCode: 'old' },
      { startLine: 2, endLine: 4, newCode: 'new' },
    ]
    
    const merged = mergeOverlappingReplacements(replacements)
    
    expect(merged).toHaveLength(1)
    expect(merged[0].startLine).toBe(1)
    expect(merged[0].endLine).toBe(4)
    expect(merged[0].newCode).toBe('new') // Uses newer code
  })
  
  it('should handle single replacement', () => {
    const replacements = [
      { startLine: 1, endLine: 5, newCode: 'a' },
    ]
    
    const merged = mergeOverlappingReplacements(replacements)
    
    expect(merged).toHaveLength(1)
    expect(merged[0]).toEqual(replacements[0])
  })
  
  it('should handle empty array', () => {
    const merged = mergeOverlappingReplacements([])
    
    expect(merged).toHaveLength(0)
  })
})


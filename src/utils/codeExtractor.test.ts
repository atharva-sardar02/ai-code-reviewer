import { describe, it, expect } from 'vitest'
import {
  stripLineNumbers,
  hasLineNumbers,
  extractLineReferences,
  extractAllCodeBlocks,
  extractCodeBlocksWithLineInfo,
  findBestMatchingRange,
} from './codeExtractor'

describe('stripLineNumbers', () => {
  it('should strip pipe-formatted line numbers', () => {
    const code = `   1 | const x = 1
   2 | const y = 2
   3 | const z = 3`
    
    const result = stripLineNumbers(code)
    
    expect(result).toBe(`const x = 1
const y = 2
const z = 3`)
  })
  
  it('should strip colon-formatted line numbers', () => {
    const code = `1: const x = 1
2: const y = 2
3: const z = 3`
    
    const result = stripLineNumbers(code)
    
    expect(result).toBe(`const x = 1
const y = 2
const z = 3`)
  })
  
  it('should strip "Line X:" formatted line numbers', () => {
    const code = `Line 1: const x = 1
Line 2: const y = 2
line 3: const z = 3`
    
    const result = stripLineNumbers(code)
    
    expect(result).toBe(`const x = 1
const y = 2
const z = 3`)
  })
  
  it('should strip pipe format without spaces', () => {
    const code = `1| const x = 1
2| const y = 2`
    
    const result = stripLineNumbers(code)
    
    // The regex strips "1| " including the space after pipe
    expect(result).toBe(`const x = 1
const y = 2`)
  })
  
  it('should preserve code without line numbers', () => {
    const code = `const x = 1
const y = 2
const z = 3`
    
    const result = stripLineNumbers(code)
    
    expect(result).toBe(code)
  })
  
  it('should handle empty code', () => {
    expect(stripLineNumbers('')).toBe('')
  })
  
  it('should handle padded line numbers with multiple spaces', () => {
    const code = `  10 | const x = 1
  11 | const y = 2
 100 | const z = 3`
    
    const result = stripLineNumbers(code)
    
    expect(result).toBe(`const x = 1
const y = 2
const z = 3`)
  })
})

describe('hasLineNumbers', () => {
  it('should detect pipe-formatted line numbers', () => {
    const code = `   1 | const x = 1
   2 | const y = 2`
    
    expect(hasLineNumbers(code)).toBe(true)
  })
  
  it('should detect colon-formatted line numbers', () => {
    const code = `1: const x = 1
2: const y = 2`
    
    expect(hasLineNumbers(code)).toBe(true)
  })
  
  it('should return false for code without line numbers', () => {
    const code = `const x = 1
const y = 2`
    
    expect(hasLineNumbers(code)).toBe(false)
  })
  
  it('should handle mixed content', () => {
    const code = `   1 | const x = 1
   2 | const y = 2
some text without line numbers`
    
    expect(hasLineNumbers(code)).toBe(true)
  })
})

describe('extractLineReferences', () => {
  it('should extract "lines X-Y" format', () => {
    const text = 'Please check lines 5-10 for errors.'
    
    const refs = extractLineReferences(text)
    
    expect(refs).toHaveLength(1)
    expect(refs[0]).toEqual({ startLine: 5, endLine: 10 })
  })
  
  it('should extract "lines X to Y" format', () => {
    const text = 'The error is on lines 3 to 7.'
    
    const refs = extractLineReferences(text)
    
    expect(refs).toHaveLength(1)
    expect(refs[0]).toEqual({ startLine: 3, endLine: 7 })
  })
  
  it('should extract single line references', () => {
    const text = 'Check line 5 for the bug.'
    
    const refs = extractLineReferences(text)
    
    expect(refs).toHaveLength(1)
    expect(refs[0]).toEqual({ startLine: 5, endLine: 5 })
  })
  
  it('should extract multiple line references', () => {
    const text = 'Check lines 1-3 and line 10 for issues.'
    
    const refs = extractLineReferences(text)
    
    expect(refs).toHaveLength(2)
    expect(refs[0]).toEqual({ startLine: 1, endLine: 3 })
    expect(refs[1]).toEqual({ startLine: 10, endLine: 10 })
  })
  
  it('should handle "L5-L10" format', () => {
    const text = 'The issue is in L5-L10.'
    
    const refs = extractLineReferences(text)
    
    expect(refs).toHaveLength(1)
    expect(refs[0]).toEqual({ startLine: 5, endLine: 10 })
  })
  
  it('should return empty array for text without line references', () => {
    const text = 'This code looks fine.'
    
    const refs = extractLineReferences(text)
    
    expect(refs).toHaveLength(0)
  })
  
  it('should deduplicate references', () => {
    const text = 'Check lines 5-10. Again, lines 5-10 have issues.'
    
    const refs = extractLineReferences(text)
    
    expect(refs).toHaveLength(1)
  })
  
  it('should sort by start line', () => {
    const text = 'Check lines 10-15 and lines 1-5.'
    
    const refs = extractLineReferences(text)
    
    expect(refs[0].startLine).toBeLessThan(refs[1].startLine)
  })
})

describe('extractAllCodeBlocks', () => {
  it('should extract code blocks with language tags', () => {
    const response = `Here is the fix:

\`\`\`typescript
const x = 1
const y = 2
\`\`\`
`
    
    const blocks = extractAllCodeBlocks(response)
    
    expect(blocks).toHaveLength(1)
    expect(blocks[0].language).toBe('typescript')
    expect(blocks[0].code).toBe('const x = 1\nconst y = 2')
  })
  
  it('should extract code blocks without language tags', () => {
    const response = `Fix:

\`\`\`
const x = 1
\`\`\`
`
    
    const blocks = extractAllCodeBlocks(response)
    
    expect(blocks).toHaveLength(1)
    expect(blocks[0].language).toBeUndefined()
  })
  
  it('should extract multiple code blocks', () => {
    const response = `First:
\`\`\`javascript
const a = 1
\`\`\`

Second:
\`\`\`typescript
const b = 2
\`\`\`
`
    
    const blocks = extractAllCodeBlocks(response)
    
    expect(blocks).toHaveLength(2)
    expect(blocks[0].code).toBe('const a = 1')
    expect(blocks[1].code).toBe('const b = 2')
  })
  
  it('should strip line numbers from code blocks', () => {
    const response = `Fix:

\`\`\`typescript
   1 | const x = 1
   2 | const y = 2
\`\`\`
`
    
    const blocks = extractAllCodeBlocks(response)
    
    expect(blocks).toHaveLength(1)
    expect(blocks[0].code).toBe('const x = 1\nconst y = 2')
  })
  
  it('should return empty array for response without code blocks', () => {
    const response = 'Just some text without any code.'
    
    const blocks = extractAllCodeBlocks(response)
    
    expect(blocks).toHaveLength(0)
  })
})

describe('extractCodeBlocksWithLineInfo', () => {
  it('should associate code blocks with line references', () => {
    const response = `The error is on lines 5-7. Here is the fix:

\`\`\`typescript
const x = 1
\`\`\`
`
    const fallback = { startLine: 1, endLine: 10 }
    
    const blocks = extractCodeBlocksWithLineInfo(response, fallback)
    
    expect(blocks).toHaveLength(1)
    expect(blocks[0].lineRange).toEqual({ startLine: 5, endLine: 7 })
  })
  
  it('should use fallback range when no line references found', () => {
    const response = `Here is the fix:

\`\`\`typescript
const x = 1
\`\`\`
`
    const fallback = { startLine: 3, endLine: 5 }
    
    const blocks = extractCodeBlocksWithLineInfo(response, fallback)
    
    expect(blocks).toHaveLength(1)
    expect(blocks[0].lineRange).toEqual(fallback)
  })
  
  it('should return empty array when no code blocks found', () => {
    const response = 'No code blocks here.'
    const fallback = { startLine: 1, endLine: 5 }
    
    const blocks = extractCodeBlocksWithLineInfo(response, fallback)
    
    expect(blocks).toHaveLength(0)
  })
})

describe('findBestMatchingRange', () => {
  it('should find matching range for similar code', () => {
    const newCode = 'const x = 1'
    const originalCode = `const a = 0
const x = 1
const y = 2`
    const fallback = { startLine: 1, endLine: 3 }
    
    const range = findBestMatchingRange(newCode, originalCode, fallback)
    
    // Should find line 2 as best match
    expect(range.startLine).toBe(2)
  })
  
  it('should return fallback for no matching code', () => {
    const newCode = 'completely different code'
    const originalCode = `const a = 0
const b = 1`
    const fallback = { startLine: 5, endLine: 10 }
    
    const range = findBestMatchingRange(newCode, originalCode, fallback)
    
    expect(range).toEqual(fallback)
  })
  
  it('should return fallback for empty new code', () => {
    const newCode = ''
    const originalCode = `const a = 0`
    const fallback = { startLine: 1, endLine: 1 }
    
    const range = findBestMatchingRange(newCode, originalCode, fallback)
    
    expect(range).toEqual(fallback)
  })
})


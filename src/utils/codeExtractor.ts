/**
 * Utilities for extracting and cleaning code from AI responses
 */

export interface CodeBlock {
  code: string
  language?: string
  lineRange?: { startLine: number; endLine: number }
}

export interface LineReference {
  startLine: number
  endLine: number
}

/**
 * Strips explanatory comments that AI might add to code
 * e.g., "// Changed X to Y", "// Fixed typo", "// Corrected"
 */
export function stripExplanatoryComments(code: string): string {
  const lines = code.split('\n')
  
  const cleanedLines = lines.map(line => {
    // Pattern: code // explanation (where explanation contains change-related words)
    const commentMatch = line.match(/^(.+?)\s*\/\/\s*(changed|fixed|corrected|updated|modified|added|removed|replaced)/i)
    if (commentMatch) {
      return commentMatch[1].trimEnd()
    }
    
    // Pattern: code // Line X or // line X
    const lineRefMatch = line.match(/^(.+?)\s*\/\/\s*[Ll]ine\s*\d+/i)
    if (lineRefMatch) {
      return lineRefMatch[1].trimEnd()
    }
    
    return line
  })
  
  return cleanedLines.join('\n')
}

/**
 * Strips line numbers from code in various formats:
 * - "   5 | const x = 1" → "const x = 1"
 * - "5: const x = 1" → "const x = 1"
 * - "Line 5: const x = 1" → "const x = 1"
 * - "5| const x = 1" → "const x = 1"
 * - "  5  | const x = 1" → "const x = 1"
 * 
 * Preserves indentation after stripping line numbers.
 */
export function stripLineNumbers(code: string): string {
  const lines = code.split('\n')
  
  const strippedLines = lines.map(line => {
    // Pattern 1: "   5 | code" or "5| code" (with optional spaces around pipe)
    const pipePattern = /^\s*\d+\s*\|\s?/
    if (pipePattern.test(line)) {
      return line.replace(pipePattern, '')
    }
    
    // Pattern 2: "5: code" or "  5: code" (number followed by colon)
    const colonPattern = /^\s*\d+:\s?/
    if (colonPattern.test(line)) {
      return line.replace(colonPattern, '')
    }
    
    // Pattern 3: "Line 5: code" or "line 5: code"
    const lineWordPattern = /^\s*[Ll]ine\s+\d+:\s?/
    if (lineWordPattern.test(line)) {
      return line.replace(lineWordPattern, '')
    }
    
    // Pattern 4: "   5  code" (number with lots of spaces, common in some formats)
    // Only match if line starts with spaces, number, and at least 2 spaces before code
    const spacePaddedPattern = /^\s*(\d+)\s{2,}/
    if (spacePaddedPattern.test(line)) {
      // Check if this looks like a line number (reasonable range)
      const match = line.match(spacePaddedPattern)
      if (match) {
        const num = parseInt(match[1], 10)
        // If number is reasonable for a line number (1-10000), strip it
        if (num >= 1 && num <= 10000) {
          return line.replace(spacePaddedPattern, '')
        }
      }
    }
    
    return line
  })
  
  return strippedLines.join('\n')
}

/**
 * Detects if code contains line numbers that should be stripped
 */
export function hasLineNumbers(code: string): boolean {
  const lines = code.split('\n')
  
  // Check first few non-empty lines for line number patterns
  const nonEmptyLines = lines.filter(line => line.trim().length > 0).slice(0, 5)
  
  let lineNumberCount = 0
  for (const line of nonEmptyLines) {
    // Check for common line number patterns
    if (/^\s*\d+\s*\|/.test(line) || /^\s*\d+:\s/.test(line) || /^\s*[Ll]ine\s+\d+:/.test(line)) {
      lineNumberCount++
    }
  }
  
  // If more than half of sampled lines have line numbers, code likely has them
  return lineNumberCount >= Math.ceil(nonEmptyLines.length / 2)
}

/**
 * Extracts line range references from text
 * Looks for patterns like:
 * - "lines 5-10"
 * - "line 7"
 * - "Lines 1 to 5"
 * - "line 3 through 8"
 * - "L5-L10"
 */
export function extractLineReferences(text: string): LineReference[] {
  const references: LineReference[] = []
  
  // Pattern 1: "lines X-Y" or "lines X to Y" or "lines X through Y"
  const rangePatterns = [
    /[Ll]ines?\s+(\d+)\s*[-–—]\s*(\d+)/g,
    /[Ll]ines?\s+(\d+)\s+(?:to|through)\s+(\d+)/gi,
    /L(\d+)\s*[-–—]\s*L?(\d+)/g,
  ]
  
  for (const pattern of rangePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const start = parseInt(match[1], 10)
      const end = parseInt(match[2], 10)
      if (start > 0 && end > 0 && start <= end) {
        references.push({ startLine: start, endLine: end })
      }
    }
  }
  
  // Pattern 2: Single line reference "line X"
  const singleLinePattern = /[Ll]ine\s+(\d+)(?!\s*[-–—to])/g
  let match
  while ((match = singleLinePattern.exec(text)) !== null) {
    const line = parseInt(match[1], 10)
    if (line > 0) {
      // Check if this line isn't already part of a range
      const alreadyInRange = references.some(
        ref => line >= ref.startLine && line <= ref.endLine
      )
      if (!alreadyInRange) {
        references.push({ startLine: line, endLine: line })
      }
    }
  }
  
  // Remove duplicates and sort by start line
  const uniqueRefs = references.filter((ref, index, self) =>
    index === self.findIndex(r => r.startLine === ref.startLine && r.endLine === ref.endLine)
  )
  
  return uniqueRefs.sort((a, b) => a.startLine - b.startLine)
}

/**
 * Extracts all code blocks from an AI response
 * Handles markdown code fences with optional language tags
 */
export function extractAllCodeBlocks(response: string): CodeBlock[] {
  const codeBlocks: CodeBlock[] = []
  
  // Match code blocks with optional language tag
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  
  let match
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const language = match[1] || undefined
    let code = match[2]
    
    // Strip line numbers if present
    if (hasLineNumbers(code)) {
      code = stripLineNumbers(code)
    }
    
    // Strip explanatory comments AI might have added
    code = stripExplanatoryComments(code)
    
    // Trim trailing whitespace but preserve leading indentation structure
    code = code.replace(/\s+$/, '')
    
    if (code.trim().length > 0) {
      codeBlocks.push({
        code,
        language,
      })
    }
  }
  
  return codeBlocks
}

/**
 * Extracts code blocks with their associated line references from AI response
 * 
 * Since AI now focuses ONLY on the selected code:
 * - Single code block: Always use the user's selection range (fallbackRange)
 * - Multiple code blocks: Try to match line references, converting relative to absolute
 * - Line references from AI might be relative to selection, so we adjust accordingly
 */
export function extractCodeBlocksWithLineInfo(
  response: string,
  fallbackRange: { startLine: number; endLine: number }
): CodeBlock[] {
  const codeBlocks = extractAllCodeBlocks(response)
  
  if (codeBlocks.length === 0) {
    return []
  }
  
  // AI now focuses only on selected code, so the code block is a replacement
  // for the entire selection. Use the fallback range (user's selection).
  if (codeBlocks.length === 1) {
    return [{
      ...codeBlocks[0],
      lineRange: fallbackRange,
    }]
  }
  
  // Multiple code blocks: try to match each to a line reference
  // Line references from AI might be relative (within selection) or absolute
  const codeBlockPositions = [...response.matchAll(/```\w*\n[\s\S]*?```/g)].map(m => m.index!)
  const selectionLength = fallbackRange.endLine - fallbackRange.startLine + 1
  
  const result: CodeBlock[] = codeBlocks.map((block, index) => {
    const blockPosition = codeBlockPositions[index]
    
    // Look for the closest line reference before this code block
    const textBeforeBlock = response.substring(0, blockPosition)
    const refsInTextBefore = extractLineReferences(textBeforeBlock)
    
    // Use the last (most recent) line reference before this block
    let associatedRef = refsInTextBefore.length > 0 
      ? refsInTextBefore[refsInTextBefore.length - 1]
      : null
    
    // Convert relative line numbers to absolute if needed
    // If AI says "line 1" or "lines 1-5" and selection starts at line 10,
    // it likely means lines 10-14 in the actual file
    if (associatedRef) {
      associatedRef = convertRelativeToAbsolute(associatedRef, fallbackRange, selectionLength)
    }
    
    return {
      ...block,
      lineRange: associatedRef || fallbackRange,
    }
  })
  
  return result
}

/**
 * Converts line references that might be relative to the selection into absolute line numbers
 * 
 * If AI says "line 1-3" and the user selected lines 10-20:
 * - If 1-3 fits within selection size (11 lines), treat as relative → lines 10-12
 * - If the reference is clearly within absolute range (10-20), keep as-is
 */
function convertRelativeToAbsolute(
  ref: LineReference,
  fallbackRange: { startLine: number; endLine: number },
  selectionLength: number
): LineReference {
  // Check if this reference looks like it's relative to the selection
  // (i.e., small numbers that fit within the selection size)
  const isLikelyRelative = ref.startLine <= selectionLength && 
                           ref.endLine <= selectionLength &&
                           ref.startLine < fallbackRange.startLine
  
  if (isLikelyRelative) {
    // Convert to absolute: line 1 in selection = fallbackRange.startLine in file
    // But we use 0-indexed internally, and line refs are 1-indexed
    return {
      startLine: fallbackRange.startLine + ref.startLine - 1,
      endLine: Math.min(fallbackRange.startLine + ref.endLine - 1, fallbackRange.endLine),
    }
  }
  
  // Reference seems to be absolute, use as-is but clamp to reasonable range
  return ref
}

/**
 * Finds the best matching line range for a code block by comparing with original code
 * Uses similarity matching to find where the code most likely belongs
 */
export function findBestMatchingRange(
  newCode: string,
  originalCode: string,
  fallbackRange: { startLine: number; endLine: number }
): { startLine: number; endLine: number } {
  const newLines = newCode.split('\n').filter(l => l.trim().length > 0)
  const originalLines = originalCode.split('\n')
  
  if (newLines.length === 0) {
    return fallbackRange
  }
  
  // Try to find the first line of new code in original
  const firstNewLine = newLines[0].trim()
  
  // Look for similar lines in original code
  let bestMatchIndex = -1
  let bestMatchScore = 0
  
  for (let i = 0; i < originalLines.length; i++) {
    const originalLine = originalLines[i].trim()
    
    // Calculate similarity (simple character overlap)
    const similarity = calculateSimilarity(firstNewLine, originalLine)
    
    if (similarity > bestMatchScore && similarity > 0.5) {
      bestMatchScore = similarity
      bestMatchIndex = i
    }
  }
  
  if (bestMatchIndex >= 0) {
    // Found a match, estimate the range
    const estimatedEndLine = Math.min(
      bestMatchIndex + newLines.length,
      originalLines.length
    )
    return {
      startLine: bestMatchIndex + 1, // Convert to 1-indexed
      endLine: estimatedEndLine,
    }
  }
  
  return fallbackRange
}

/**
 * Simple string similarity calculation (Jaccard-like)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1
  if (str1.length === 0 || str2.length === 0) return 0
  
  // Compare character sets
  const set1 = new Set(str1.toLowerCase().split(''))
  const set2 = new Set(str2.toLowerCase().split(''))
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}


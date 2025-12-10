/**
 * Utilities for replacing specific line ranges in file content
 */

export interface CodeReplacement {
  startLine: number  // 1-indexed
  endLine: number    // 1-indexed
  newCode: string
}

export interface CodeFix {
  startLine: number
  endLine: number
  originalCode: string
  newCode: string
}

/**
 * Replaces a specific line range in file content
 * 
 * @param fileContent - The original file content
 * @param startLine - Starting line number (1-indexed)
 * @param endLine - Ending line number (1-indexed, inclusive)
 * @param newCode - The new code to insert
 * @returns The modified file content
 */
export function replaceLines(
  fileContent: string,
  startLine: number,
  endLine: number,
  newCode: string
): string {
  const lines = fileContent.split('\n')
  
  // Convert to 0-indexed
  const startIdx = startLine - 1
  const endIdx = endLine - 1
  
  // Validate indices
  if (startIdx < 0 || endIdx < 0 || startIdx > lines.length || endIdx >= lines.length) {
    console.warn('Invalid line range for replacement:', { startLine, endLine, totalLines: lines.length })
    // Return original if indices are invalid
    return fileContent
  }
  
  if (startIdx > endIdx) {
    console.warn('Start line is greater than end line:', { startLine, endLine })
    return fileContent
  }
  
  // Split new code into lines
  const newLines = newCode.split('\n')
  
  // Build the new content
  const before = lines.slice(0, startIdx)
  const after = lines.slice(endIdx + 1)
  
  const result = [...before, ...newLines, ...after]
  
  return result.join('\n')
}

/**
 * Applies multiple replacements to file content
 * Replacements are sorted by line number and applied in reverse order
 * to preserve line numbers for subsequent replacements
 * 
 * @param fileContent - The original file content
 * @param replacements - Array of replacements to apply
 * @returns The modified file content
 */
export function applyMultipleReplacements(
  fileContent: string,
  replacements: CodeReplacement[]
): string {
  if (replacements.length === 0) {
    return fileContent
  }
  
  // Sort by start line in descending order (apply from bottom to top)
  const sortedReplacements = [...replacements].sort((a, b) => b.startLine - a.startLine)
  
  let result = fileContent
  
  for (const replacement of sortedReplacements) {
    result = replaceLines(
      result,
      replacement.startLine,
      replacement.endLine,
      replacement.newCode
    )
  }
  
  return result
}

/**
 * Extracts the original code from a file for a given line range
 * 
 * @param fileContent - The file content
 * @param startLine - Starting line number (1-indexed)
 * @param endLine - Ending line number (1-indexed, inclusive)
 * @returns The extracted code
 */
export function extractOriginalCode(
  fileContent: string,
  startLine: number,
  endLine: number
): string {
  const lines = fileContent.split('\n')
  
  // Convert to 0-indexed
  const startIdx = startLine - 1
  const endIdx = endLine - 1
  
  // Validate indices
  if (startIdx < 0 || endIdx < 0 || startIdx >= lines.length) {
    return ''
  }
  
  const endIdxClamped = Math.min(endIdx, lines.length - 1)
  
  return lines.slice(startIdx, endIdxClamped + 1).join('\n')
}

/**
 * Prepares CodeFix objects from replacements and original file content
 * Used to show the user what will be changed
 * Filters out invalid or empty fixes
 * Also validates that AI didn't accidentally return the entire file
 * 
 * @param fileContent - The original file content
 * @param replacements - Array of replacements to apply
 * @returns Array of CodeFix objects with original and new code
 */
export function prepareCodeFixes(
  fileContent: string,
  replacements: CodeReplacement[]
): CodeFix[] {
  const fileLineCount = fileContent.split('\n').length
  
  return replacements
    .map(replacement => {
      const originalCode = extractOriginalCode(fileContent, replacement.startLine, replacement.endLine)
      let newCode = replacement.newCode
      
      const selectionLineCount = replacement.endLine - replacement.startLine + 1
      const newCodeLineCount = newCode.split('\n').length
      
      // If new code is WAY larger than selection, AI returned wrong code
      // Allow some flexibility: up to 2x the lines (for added error handling, etc.)
      // But if it's more than 3x or close to full file, reject/extract
      if (newCodeLineCount > selectionLineCount * 3) {
        console.warn(`AI returned ${newCodeLineCount} lines for a ${selectionLineCount} line selection`)
        
        // If it looks like the entire file, try to extract the relevant portion
        if (newCodeLineCount >= fileLineCount * 0.7) {
          console.warn('AI returned entire file, attempting to extract relevant portion')
          const extracted = extractRelevantPortion(newCode, originalCode, selectionLineCount)
          if (extracted) {
            newCode = extracted
          } else {
            // Can't extract - mark as invalid by making it empty
            console.error('Could not extract relevant portion, skipping this fix')
            newCode = originalCode // Keep original to filter out
          }
        }
      }
      
      return {
        startLine: replacement.startLine,
        endLine: replacement.endLine,
        originalCode,
        newCode,
      }
    })
    // Filter out fixes where both original and new are empty, or where they're identical
    .filter(fix => {
      const hasContent = fix.originalCode.trim().length > 0 || fix.newCode.trim().length > 0
      const isDifferent = fix.originalCode !== fix.newCode
      return hasContent && isDifferent
    })
}

/**
 * Attempts to extract just the relevant portion from AI's response
 * when AI accidentally returned the entire file
 * 
 * @param fullResponse - The full code block from AI (possibly entire file)
 * @param originalSelection - The original selected code
 * @param expectedLines - Expected number of lines in the fix
 * @returns The relevant portion, or null if can't determine
 */
function extractRelevantPortion(
  fullResponse: string,
  originalSelection: string,
  expectedLines: number
): string | null {
  const responseLines = fullResponse.split('\n')
  const originalLines = originalSelection.split('\n').filter(l => l.trim())
  
  if (originalLines.length === 0) {
    return null
  }
  
  // Try to find where the original selection starts in the response
  const firstOriginalLine = originalLines[0].trim()
  let startIndex = -1
  
  for (let i = 0; i < responseLines.length; i++) {
    if (responseLines[i].trim().includes(firstOriginalLine.substring(0, 20)) ||
        calculateLineSimilarity(responseLines[i], originalLines[0]) > 0.7) {
      startIndex = i
      break
    }
  }
  
  if (startIndex === -1) {
    // Try finding by looking for similar structure
    for (let i = 0; i < responseLines.length; i++) {
      // Look for lines that look like the start of the selection
      if (originalLines[0].includes('const ') && responseLines[i].includes('const ') ||
          originalLines[0].includes('function ') && responseLines[i].includes('function ') ||
          originalLines[0].includes('class ') && responseLines[i].includes('class ')) {
        // Check if subsequent lines also match
        let matchCount = 0
        for (let j = 0; j < Math.min(3, originalLines.length); j++) {
          if (i + j < responseLines.length &&
              calculateLineSimilarity(responseLines[i + j], originalLines[j]) > 0.5) {
            matchCount++
          }
        }
        if (matchCount >= 2) {
          startIndex = i
          break
        }
      }
    }
  }
  
  if (startIndex === -1) {
    return null
  }
  
  // Extract approximately the expected number of lines
  const endIndex = Math.min(startIndex + expectedLines + 2, responseLines.length)
  const extracted = responseLines.slice(startIndex, endIndex).join('\n')
  
  return extracted.trim() ? extracted : null
}

/**
 * Simple line similarity calculation
 */
function calculateLineSimilarity(line1: string, line2: string): number {
  const s1 = line1.trim().toLowerCase()
  const s2 = line2.trim().toLowerCase()
  
  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0
  
  // Count common characters
  const set1 = new Set(s1)
  const set2 = new Set(s2)
  const intersection = [...set1].filter(c => set2.has(c)).length
  const union = new Set([...set1, ...set2]).size
  
  return intersection / union
}

/**
 * Validates that replacements don't overlap
 * 
 * @param replacements - Array of replacements to validate
 * @returns true if no overlaps, false otherwise
 */
export function validateNoOverlaps(replacements: CodeReplacement[]): boolean {
  if (replacements.length <= 1) {
    return true
  }
  
  // Sort by start line
  const sorted = [...replacements].sort((a, b) => a.startLine - b.startLine)
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    
    // Check if current range overlaps with next
    if (current.endLine >= next.startLine) {
      return false
    }
  }
  
  return true
}

/**
 * Merges overlapping replacements (uses the later one)
 * 
 * @param replacements - Array of replacements that may overlap
 * @returns Array of non-overlapping replacements
 */
export function mergeOverlappingReplacements(replacements: CodeReplacement[]): CodeReplacement[] {
  if (replacements.length <= 1) {
    return replacements
  }
  
  // Sort by start line
  const sorted = [...replacements].sort((a, b) => a.startLine - b.startLine)
  const merged: CodeReplacement[] = [sorted[0]]
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]
    
    // Check if current overlaps with last merged
    if (current.startLine <= last.endLine) {
      // Replace with the current one (later in the list, more recent)
      merged[merged.length - 1] = {
        startLine: Math.min(last.startLine, current.startLine),
        endLine: Math.max(last.endLine, current.endLine),
        newCode: current.newCode, // Use the newer code
      }
    } else {
      merged.push(current)
    }
  }
  
  return merged
}

